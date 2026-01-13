import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const prompt = body.prompt;
        const style = body.style || "Studio Minimalis";
        const base64Image = body.image; // Optional: Base64 image for img2img

        let enhancedPrompt = prompt;

        // 1. Determine Prompt (Vision or Text)
        if (base64Image) {
            // Smart Reconstruction Mode (Vision Analysis -> Text Generation)
            console.log("Analyzing uploaded image with Gemini Vision...");

            try {
                // Remove data URL prefix if present for Gemini API
                const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

                const visionPrompt = `Analyze this product image in extreme detail. 
                Describe the product's shape, color, material, and key features.
                Then, write a high-end, 8k photorealistic prompt for Stable Diffusion to RECREATE this exact product but in a "${style}" setting.
                
                Guidelines:
                - Keep the product looking exactly as described.
                - Improve the lighting (cinematic, professional studio).
                - Improve the background (blurred, premium context).
                - Output ONLY the prompt text. No markdown, no "Here is the prompt".`;

                const visionResult = await model.generateContent([
                    visionPrompt,
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: "image/jpeg", // Assuming JPEG/PNG
                        },
                    },
                ]);

                const visionResponse = await visionResult.response;
                let visionText = visionResponse.text().trim();

                // Cleanup potentially messy AI output
                visionText = visionText.replace(/[*#`]/g, '').replace(/^"|"$/g, '').replace(/^Here is.*:/i, '').trim();

                console.log("Vision Analysis Result:", visionText);
                if (visionText.length > 10) {
                    enhancedPrompt = visionText;
                }
            } catch (visionError: any) {
                console.warn("Vision Analysis Failed:", visionError.message);
                // Fallback: Proceed with original prompt if vision fails, but log it
            }

        } else {
            // Standard Text-to-Image Mode: Enhance prompt with text-only Gemini
            try {
                const enhancementPrompt = `You are a professional photography prompter for high-end commercial products. 
                Convert this product description: "${prompt}" into a technical 8k photorealistic prompt for stable diffusion.
                Style: "${style}". 
                
                Guidelines:
                - Focus on lighting (cinematic, rim lighting, softbox).
                - Focus on textures (water droplets, wood grain, glass reflections).
                - Set a premium environment (marble surface, blurred bokeh background).
                - Colors: Moody, vibrant, and professional.
                
                IMPORTANT: OUTPUT ONLY THE ENHANCED PROMPT IN ENGLISH. NO INTRO, NO QUOTES, NO MARKDOWN.`;

                const result = await model.generateContent(enhancementPrompt);
                const response = await result.response;
                let aiText = response.text().trim();
                aiText = aiText.replace(/[*#`]/g, '').replace(/^"|"$/g, '').trim();

                if (aiText && aiText.length > 5) {
                    enhancedPrompt = aiText;
                }
            } catch (err: any) {
                console.warn("Gemini Text Enhancement Error:", err.message);
            }
        }

        // 2. Generate Image (Using Standard Endpoint for both modes)
        // We use the standard endpoint because we are now doing Text-to-Image based on the description (Vision or Text)
        const seed = Math.floor(Math.random() * 1000000);

        // Always use the robust public endpoint, never the 'kontext' model (img2img) which is restricted
        const imageUrlParam = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`;

        console.log("Generating photo with prompt:", enhancedPrompt);
        console.log("Requesting URL:", imageUrlParam);

        // Fetch the image server-side
        const imageResponse = await fetch(imageUrlParam);

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image from AI provider: ${imageResponse.status} ${imageResponse.statusText}`);
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const outputBase64 = Buffer.from(imageBuffer).toString('base64');
        const dataUri = `data:image/jpeg;base64,${outputBase64}`;

        return NextResponse.json({
            imageUrl: dataUri, // Return Base64 Data URI instead of external URL
            enhancedPrompt,
            fallback: enhancedPrompt === prompt,
            seed
        });

    } catch (error: any) {
        console.error("Critical Image API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
