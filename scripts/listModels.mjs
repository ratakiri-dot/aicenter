
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    try {
        // The listModels method is on the generative AI instance
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels?.() || [];
        console.log("Supported Models:");
        // Actually, the correct way in newer SDKs might differ.
        // Let's try to just list models via the API directly if possible, or use the tool method if exists.
        // If not, I'll search for the correct way to list models in @google/generative-ai
    } catch (e) {
        console.error("Error listing models:", e);
    }
}
// listModels();
