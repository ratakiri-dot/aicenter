import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { appendChatHistory } from "@/lib/googleSheets";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

const PUBLIC_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/13aFq17smTHLDvNEK7Tm6alIHRvNYYzh77ukRCe9oeTE/export?format=csv";
const PUBLIC_DOC_TXT_URL = "https://docs.google.com/document/d/1JqbBEWC38N0W62WDzNMvb1MqStmz19EAmEEOnB1ddkc/export?format=txt";

const BASE_SYSTEM_PROMPT = `Anda adalah UNI, asisten AI resmi dari LPH (Lembaga Pemeriksa Halal) Universitas Islam Malang (UNISMA). 
Tugas utama Anda adalah membantu pelaku usaha dan masyarakat mengenai sertifikasi halal di Indonesia sesuai regulasi BPJPH (Badan Penyelenggara Jaminan Produk Halal).

INFORMASI PENTING LPH UNISMA (Gunakan sebagai referensi utama):
1. **Profil**: LPH UNISMA adalah LPH Pratama (Wilayah Jawa Timur) khusus untuk usaha Mikro & Kecil sektor Makanan & Minuman.
2. **Kepala LPH**: Dr. Hj. Jeni Susyanti, SE, MM, BKP, CBV.
3. **Alamat**: Gedung Laboratorium Terpadu Lt 5, UNISMA, Jl. MT. Haryono No 193, Malang.
4. **Tim Auditor**: Ike Widyaningrum, Majida Ramadhan, Syafarotin.
5. **SDM Syariah**: Dr. H. Syamsu Madyan, Khoirul Asfiyak.
6. **Layanan**: Sertifikasi Halal skema Reguler (Makanan/Minuman).
7. **Penyelia Halal**: Wajib ada (Muslim, paham syariat). Bertanggung jawab atas PPH dan mendampingi auditor.
8. **Dokumentasi Wajib**: Foto Menu/Produk, Video (Produksi, Cuci Bahan/Alat, Kemasan).
9. **Program Makan Bergizi Gratis (SPPG)**: 1 SPPG = 1 Sertifikat = 1 Penyelia Halal (bisa pegawai SPPG/Chef).

LINK PENTING:
- Pendaftaran: ptsp.halal.go.id (Butuh NIB di oss.go.id)
- Cek Bahan/ID Halal: bpjph.halal.go.id
- Konsultasi: wa.me/6282142903454

Karakteristik UNI:
1. Sapa pengguna baru dengan: "Assalamualaikum Warahmatullah Wabarakatuh".
2. Gunakan format Markdown standar untuk memperjelas jawaban (tebal untuk penekanan, miring, dll).
3. Jika jawaban berupa poin-poin/langkah-langkah, WAJIB menggunakan format list Markdown (1. 2. 3. atau - - -) dan PASTIKAN setiap poin berada di baris baru. JANGAN menggabungkan poin-poin menjadi satu paragraf. Poin-poin harus tersusun menurun secara rapi.
4. Sopan, profesional, namun ramah.
5. Gunakan REFERENSI MATERI (Google Docs) dan DATABASE MITRA (Google Sheets) sebagai rujukan utama dan prioritas pertama. Jika informasi tidak ditemukan di sana, Anda diperbolehkan menjawab berdasarkan pengetahuan umum Anda SELAMA masih dalam ruang lingkup Sertifikasi Halal di Indonesia.
6. Jika ditanya biaya, arahkan ke menu "Simulator Biaya" atau link kalkulator BPJPH.
7. Jika ditanya status produk, arahkan ke menu "Halal Search".
8. Jika bertanya tentang status pendaftaran, cek di DATABASE MITRA di bawah. PENTING: Jika data pendaftaran memiliki ID Halal (ID351...), Anda WAJIB menyampaikan ID Halalnya kepada pengguna dalam jawaban Anda. Jika tidak ada di data, sarankan cek di ptsp.halal.go.id.
9. ATURAN SANGAT KETAT: Anda TIDAK BOLEH menjawab pertanyaan apapun di luar topik sertifikasi halal, LPH UNISMA, dan BPJPH. Jika pengguna menanyakan hal lain (misalnya coding, matematika, definisi umum di luar halal, dll), TOLAK DENGAN SOPAN dan sampaikan bahwa Anda hanya asisten untuk Sertifikasi Halal LPH UNISMA.
10. Anda diperbolehkan menjawab pertanyaan yang jawabannya tidak tersedia di Google Docs atau Sheets, asalkan informasi tersebut masih dalam ruang lingkup BPJPH, Sertifikasi Halal, dan LPH Universitas Islam Malang. Gunakan pengetahuan bawaan Anda hanya untuk topik tersebut. TETAP TOLAK pertanyaan di luar ruang lingkup tersebut secara tegas dan sopan.`;

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { messages } = body;
        // userId bersifat opsional — fallback ke "anonymous" jika tidak dikirim client
        const userId: string = body.userId ?? "anonymous";

        // Fetch Sheet & Doc secara paralel untuk menghemat waktu
        let mitraDataText = "DATABASE MITRA TERBARU (Data Snapshot):\nGunakan data ini jika pengguna bertanya tentang status sertifikasi spesifik. Jika data tidak ditemukan, minta nomor pendaftaran.\n";
        let docDataText = "";

        const [sheetResult, docResult] = await Promise.allSettled([
            fetch(PUBLIC_SHEET_CSV_URL, { next: { revalidate: 300 } }),
            fetch(PUBLIC_DOC_TXT_URL, { next: { revalidate: 300 } }),
        ]);

        // Proses hasil Sheet
        if (sheetResult.status === "fulfilled" && sheetResult.value.ok) {
            try {
                const csvText = await sheetResult.value.text();
                const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                if (parsed.data && parsed.data.length > 0) {
                    parsed.data.forEach((row: any, index: number) => {
                        const nama = row["NAMA"] || "Tanpa Nama";
                        const merk = row["MERK"] || "Tanpa Merk";
                        const status = row["STATUS PERMOHONAN"] || "Status Tidak Diketahui";
                        const noSertifikat = row["NO SERTIFIKASI HALAL"] || row["NO SERTIFIKAT"] || "-";
                        mitraDataText += `${index + 1}. ${merk} (${nama}). Status: ${status}`;
                        if (noSertifikat !== "-") mitraDataText += ` (ID: ${noSertifikat})`;
                        mitraDataText += "\n";
                    });
                } else {
                    mitraDataText += "Terjadi kesalahan saat membaca atau data kosong.\n";
                }
            } catch (e) {
                console.error("Failed to parse Google Sheet CSV:", e);
                mitraDataText += "[Peringatan: Gagal memproses database mitra]\n";
            }
        } else {
            console.error("Failed to fetch Google Sheet:", sheetResult);
            mitraDataText += "[Peringatan: Gagal terhubung ke database mitra saat ini]\n";
        }

        // Proses hasil Doc
        if (docResult.status === "fulfilled" && docResult.value.ok) {
            try {
                let text = await docResult.value.text();
                text = text.replace(/^\uFEFF/, "").trim();
                docDataText = "\nREFERENSI MATERI (DARI GOOGLE DOCS):\n" + text + "\n";
            } catch (e) {
                console.error("Failed to read Google Doc text:", e);
                docDataText = "\n[Peringatan: Gagal memproses referensi dari Google Docs]\n";
            }
        } else {
            console.error("Failed to fetch Google Doc:", docResult);
            docDataText = "\n[Peringatan: Gagal mengambil referensi tambahan dari Google Docs]\n";
        }

        // Combine prompt
        const finalSystemPrompt = BASE_SYSTEM_PROMPT + docDataText + "\n\n" + mitraDataText;

        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === "bot" ? "model" : "user",
            parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: finalSystemPrompt }] },
                { role: "model", parts: [{ text: "Baik, saya UNI dari LPH UNISMA. Saya siap membantu Anda." }] },
                ...history
            ],
        });

        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error("AI returned an empty response");

        // Simpan ke Google Sheets secara fire-and-forget.
        // Kegagalan logging TIDAK boleh menggagalkan respons chatbot ke user.
        const lastUserMessage = messages[messages.length - 1]?.content ?? "";
        appendChatHistory({
            userId,
            message: lastUserMessage,
            response: text,
        }).catch((err) => {
            console.error("[GoogleSheets] Gagal menyimpan riwayat chat:", {
                message: err?.message ?? err,
                code: err?.code,
                status: err?.status,
                details: err?.errors ?? err?.response?.data ?? null,
                envCheck: {
                    hasEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
                    hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
                    hasSheetId: !!process.env.GOOGLE_SHEET_ID,
                },
            });
        });

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Gemini API Error (Chat):", error);

        const status = error.status || 500;
        const message = error.message || "Unknown error in Chat API";

        return NextResponse.json({
            error: message,
            details: status === 429 ? "Quota Exceeded. Please try again later." : error.toString()
        }, { status });
    }
}
