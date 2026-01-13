import { GoogleGenAI, Type } from "@google/genai";

export const generateSermonMetadata = async (title: string, scripture: string, preacher: string) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Generate a short, engaging summary (max 2 sentences) and 3 relevant tags for a church sermon.
      Title: ${title}
      Scripture: ${scripture}
      Preacher: ${preacher}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {
      summary: "Could not generate summary at this time.",
      tags: ["Sermon", "Church"]
    };
  }
};