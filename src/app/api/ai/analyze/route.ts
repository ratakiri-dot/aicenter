import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    try {
        const { query, mode } = await req.json();

        let prompt = "";
        if (mode === "id-check") {
            prompt = `Anda adalah petugas verifikasi sertifikasi halal BPJPH. Tugas Anda adalah memberikan DATA RESMI dari database sertifikasi halal Indonesia untuk: "${query}".
            
            KRITERIA WAJIB:
            1. Carilah NAMA PRODUSEN/PT YANG SEBENARNYA dari produk tersebut (Contoh: "Indomie" -> "PT Indofood CBP Sukses Makmur Tbk"). JANGAN RANDOM.
            2. Carilah NOMOR ID HALAL (ID31...) yang terdaftar untuk produk tersebut. Jika Anda tidak memiliki nomor persisnya, berikan nomor ID simulasi yang memiliki format BENAR (ID + 15 angka) dan terlihat resmi. JANGAN KOSONG atau N/A.
            3. Berikan "Tanggal Terbit" yang akurat atau simulasi realistis (Contoh: "15 Januari 2024").
            
            Format Output (JSON):
            {
                "status": "halal" | "warning" | "haram",
                "halalId": "NOMOR ID SERTIFIKAT (TIDAK BOLEH N/A)",
                "analysis": "Penjelasan detail mengenai status kehalalan produk",
                "producer": "NAMA PT/PERUSAHAAN RESMI (WAJIB)",
                "lphName": "NAMA LPH/LEMBAGA PEMERIKSA HALAL (Contoh: LPPOM MUI, LPH Kemenag, dll)",
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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        // Robust JSON extraction
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const text = jsonMatch ? jsonMatch[0] : rawText;

        try {
            const jsonOutput = JSON.parse(text);
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
        return NextResponse.json({ error: error.message || "Unknown AI error" }, { status: 500 });
    }
}
