import { GoogleGenAI } from "@google/genai";

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key length:", apiKey ? apiKey.length : 0);
  console.log("API Key starts with:", apiKey ? apiKey.substring(0, 5) : "undefined");
  
  if (!apiKey) {
    console.log("No API key found in environment");
    return;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.replace(/^["']|["']$/g, '').trim() });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello",
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
