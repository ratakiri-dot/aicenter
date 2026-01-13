import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        env: {
            hasApiKey: !!process.env.GEMINI_API_KEY,
            apiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
            apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) + "...",
            nodeEnv: process.env.NODE_ENV,
        },
        test: null as any,
        error: null as any,
    };

    // Test Gemini API
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Say 'API is working' in one sentence");
        const response = await result.response;
        const text = response.text();

        diagnostics.test = {
            success: true,
            response: text,
        };
    } catch (error: any) {
        diagnostics.error = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            toString: error.toString(),
        };
    }

    return NextResponse.json(diagnostics, { status: 200 });
}
