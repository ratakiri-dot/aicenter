import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    try {
        const { productName, productDescription, promoText, style } = await req.json();

        const prompt = `Anda adalah seorang desainer grafis & copywriter spesialis iklan jualan flyer UMKM Halal.
Tugas Anda adalah membuat konten teks flyer promosi yang sangat menarik, estetik, dan menjual untuk produk berikut:
Nama Produk: "${productName || "Produk UMKM"}"
Deskripsi / Keunggulan: "${productDescription || "Produk berkualitas tinggi dan Halal"}"
Penawaran Promo: "${promoText || "Promo Spesial"}"
Gaya Desain: "${style || "Flash Sale Bold"}"

WAJIB:
1. Buat teks yang singkat, padat, dan berdampak tinggi agar pas dimasukkan dalam desain poster/flyer digital.
2. Sisipkan nuansa jaminan Halal & keunggulan produk.

Kirimkan jawaban HANYA dalam format JSON murni tanpa pembuka/penutup markdown (\`\`\`json).
Struktur JSON yang harus dikembalikan:
{
    "headline": "Judul headline promo yang besar dan mencolok (maksimal 6 kata, gunakan huruf kapital di kata penting)",
    "subheadline": "Sub-headline pendukung yang menggugah selera/minat (1 kalimat pendek)",
    "highlights": [
        "Poin 1 dengan emoji (contoh: 🌶️ 100% Cabai Alami)",
        "Poin 2 dengan emoji (contoh: 📜 Sertifikat Halal LPH UNISMA)",
        "Poin 3 dengan emoji (contoh: 🚀 Siap Kirim Seluruh Indonesia)"
    ],
    "badgeText": "Teks singkat untuk badge promo (contoh: DISKON 25%, SPESIAL HARGA, HEMAT BANGET)",
    "callToAction": "Kalimat ajakan bertindak (contoh: Pesan Sekarang via WhatsApp!, Hubungi Kami Sekarang!)"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        let text = rawText;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }
        text = text.replace(/^[^{]*|[^}]*$/g, '');

        try {
            const jsonOutput = JSON.parse(text);
            return NextResponse.json(jsonOutput);
        } catch (e) {
            console.error("Flyer Copywriting Parse Error:", rawText);
            return NextResponse.json({
                headline: productName ? `PROMO SPESIAL ${productName.toUpperCase()}!` : "PROMO SPESIAL HALAL!",
                subheadline: productDescription || "Dapatkan kualitas terbaik dengan sertifikasi halal resmi.",
                highlights: [
                    "✨ Kualitas Terjamin & Higienis",
                    "📜 Terdaftar & Bersertifikat Halal",
                    "🎁 Penawaran Terbatas Hari Ini"
                ],
                badgeText: promoText || "SPECIAL OFFER",
                callToAction: "Order Sekarang Sebelum Kehabisan!"
            });
        }
    } catch (error: any) {
        console.error("Gemini API Error (Flyer):", error);
        return NextResponse.json({ error: error.message || "Unknown error in Flyer API" }, { status: 500 });
    }
}
