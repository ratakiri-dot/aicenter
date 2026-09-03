import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { appendAnalysisHistory } from "@/lib/googleSheets";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const PUBLIC_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/13aFq17smTHLDvNEK7Tm6alIHRvNYYzh77ukRCe9oeTE/export?format=csv";

// Fallback model list if primary model experiences 503 Service Unavailable spikes
const CANDIDATE_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

async function generateContentWithFallback(prompt: string) {
    let lastError: any = null;
    for (const modelName of CANDIDATE_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (err: any) {
            console.warn(`[Gemini Fallback] Model ${modelName} returned error: ${err.message}. Retrying next candidate...`);
            lastError = err;
        }
    }
    throw lastError || new Error("Seluruh model Gemini AI sedang sibuk. Silakan coba beberapa saat lagi.");
}

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { query, mode } = body;
        const userId: string = body.userId ?? "anonymous";

        let prompt = "";
        if (mode === "id-check") {
            // Fetch dynamically from sheet
            let mitraDataText = "DATABASE MITRA TERBARU:\nCari apakah query pengguna cocok dengan data di bawah ini.\n";
            try {
                const sheetRes = await fetch(PUBLIC_SHEET_CSV_URL, { cache: "no-store" });
                if (sheetRes.ok) {
                    const csvText = await sheetRes.text();
                    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                    if (parsed.data && parsed.data.length > 0) {
                        parsed.data.forEach((row: any, index: number) => {
                            const nama = row["NAMA"] || "Tanpa Nama";
                            const merk = row["MERK"] || "Tanpa Merk";
                            const status = row["STATUS PERMOHONAN"] || "Status Tidak Diketahui";
                            const noSertifikat = row["NO SERTIFIKASI HALAL"] || row["NO SERTIFIKAT"] || "-";
                            const tglTerbit = row["TANGGAL SH"] || "-";

                            mitraDataText += `${index + 1}. Merek: ${merk}, Pemilik: ${nama}, Status: ${status}, ID: ${noSertifikat}, Tgl: ${tglTerbit}\n`;
                        });
                    }
                }
            } catch (error) {
                console.error("Gagal menarik data sheet:", error);
            }

            prompt = `Anda adalah petugas verifikasi sertifikasi halal BPJPH. Tugas Anda adalah memberikan DATA RESMI dari database sertifikasi halal Indonesia untuk: "${query}".
            
            Jika data yang dicari ADA di ${mitraDataText}, maka gunakan persis data tersebut. Jika tidak ada, Anda boleh mensimulasikannya khusus untuk kasus pencarian general.
            
            KRITERIA WAJIB:
            1. Carilah NAMA PRODUSEN/PT YANG SEBENARNYA dari produk tersebut (Untuk data dari sheet, gunakan Pemilik atau nama Merek).
            2. Carilah NOMOR ID HALAL (ID31...) yang terdaftar untuk produk tersebut. Jika data dari sheet, gunakan ID Halal dari sheet. Jika bukan, berikan nomor simulasi.
            3. Berikan "Tanggal Terbit" yang akurat dari data sheet atau simulasi realistis jika tidak ada.
            4. PENTING: Untuk SEMUA yang berasal dari "DATABASE MITRA TERBARU", kolom lphName WAJIB diisi "LPH Universitas Islam Malang" BUKAN LPPOM MUI.
            
            Format Output (JSON):
            {
                "status": "halal" | "warning" | "haram",
                "halalId": "NOMOR ID SERTIFIKAT (TIDAK BOLEH N/A)",
                "analysis": "Penjelasan detail mengenai status kehalalan produk",
                "producer": "NAMA PT/PEMILIK",
                "lphName": "NAMA LPH/LEMBAGA PEMERIKSA HALAL (WAJIB: LPH Universitas Islam Malang khusus data sheet)",
                "issueDate": "TANGGAL TERBIT (WAJIB)",
                "recommendation": "Saran verifikasi resmi"
            }
            Balas HANYA JSON murni.`;
        } else {
            prompt = `Anda adalah ahli audit halal teknis. Analisislah kehalalan dari bahan/zat berikut: "${query}" secara mendalam (titik kritis). 
            Jelaskan sumber asal bahan (nabati, hewani, sintetik) dan potensi kontaminasi haram.
            
            Berikan jawaban dalam format JSON:
            {
                "status": "halal" | "warning" | "haram",
                "analysis": "Penjelasan teknis mengenai kehalalan bahan ini",
                "criticalPoints": ["titik kritis 1", "titik kritis 2"],
                "recommendation": "Saran untuk penggunaan bahan ini dalam industri"
            }
            Balas HANYA JSON murni.`;
        }

        const rawText = await generateContentWithFallback(prompt);

        // Robust JSON extraction
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const text = jsonMatch ? jsonMatch[0] : rawText;

        try {
            const jsonOutput = JSON.parse(text);

            // Simpan riwayat analisis ke Google Sheets secara aman
            try {
                await appendAnalysisHistory({
                    userId,
                    query,
                    mode: mode || "analyze",
                    status: jsonOutput.status || "unknown",
                    analysis: jsonOutput.analysis || jsonOutput.recommendation || text,
                });
            } catch (sheetErr: any) {
                console.error("[GoogleSheets] Gagal menyimpan riwayat analisis:", sheetErr?.message || sheetErr);
            }

            return NextResponse.json(jsonOutput);
        } catch (parseError) {
            console.error("Failed to parse Gemini response as JSON:", rawText);
            return NextResponse.json({
                error: "AI returned invalid format",
                raw: rawText.substring(0, 100)
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Halal Analysis Error:", error);
        return NextResponse.json({
            error: error.message && error.message.includes("503")
                ? "Layanan Gemini AI sedang mengalami lonjakan beban tinggi sementara dari Google. Silakan coba beberapa detik lagi."
                : error.message || "Unknown AI error"
        }, { status: 500 });
    }
}
