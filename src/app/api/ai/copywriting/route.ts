import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    try {
        const { productName, features, tone } = await req.json();

        const prompt = `Anda adalah ahli copywriting pemasaran AI yang spesifik untuk produk halal. 
        Tugas Anda adalah membuat 3 versi iklan yang sangat persuasif dan profesional untuk produk berikut:
        Nama Produk: "${productName}"
        Keunggulan: "${features}"
        Tone: "${tone}"
        
        WAJIB: Selalu hubungkan dengan jaminan halal resmi untuk membangun kepercayaan konsumen Muslim.
        
        Kirimkan jawaban HANYA dalam format JSON murni tanpa pembuka/penutup markdown (\`\`\`json).
        Struktur JSON:
        {
            "instagram": "Teks caption IG lengkap dengan emoji yang relevan dan hashtag populer",
            "whatsapp": "Teks pesan WA yang ramah dengan format bold/italic ala WhatsApp (*teks*, _teks_)",
            "landing": "Teks deskripsi website yang profesional, menjual, dan terpercaya"
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        // Robust JSON extraction
        let text = rawText;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        // Final cleanup of any potential escaped characters or leftovers
        text = text.replace(/^[^{]*|[^}]*$/g, '');

        try {
            const jsonOutput = JSON.parse(text);
            return NextResponse.json(jsonOutput);
        } catch (e) {
            console.error("Copywriting Parse Error:", rawText);
            // Fallback if AI doesn't return clean JSON
            return NextResponse.json({
                instagram: rawText,
                whatsapp: rawText,
                landing: rawText
            });
        }
    } catch (error: any) {
        console.error("Gemini API Error (Copy):", error);
        return NextResponse.json({ error: error.message || "Unknown error in Copy API" }, { status: 500 });
    }
}
