import { Opportunity } from "../types";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are MuternalAI, a Startup Validation & Execution Engine.
Your goal is to validate high-leverage startup opportunities by analyzing demand proof.

VALIDATION SOURCES:
1. Google Trends -> Demand Strength (Search momentum).
2. Reddit -> Pain Proof (Complaint frequency & intensity).
3. Twitter (X) -> Momentum Proof (Engagement spikes).
4. Product Hunt -> Competition Proof (Competitor count).

You must generate strictly numeric strength scores (0-10) for these dimensions based on startup gap analysis.
`;

export const generateOpportunities = async (niche: string = "General"): Promise<Opportunity[]> => {
  try {
    let apiKey = "AIzaSyBL2DybPabTXmODmvKGwwwoPhejj4tk35A";
    if (!apiKey || apiKey === "undefined" || apiKey === '""' || apiKey.trim() === "") {
      throw new Error("Your Gemini API Key is missing. Please check your API Key configuration in the Settings menu.");
    }
    
    apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Discover startup gaps for: "${niche}" using search to find validation proof (last 90 days).

      Identify top 10 Validated Startup Ideas.
      
      For each opportunity, provide:
      1. Opportunity Name & Target User.
      2. Dominant Pain: A specific problem statement found in user communities.
      3. Proof Strength (0-10):
         - Demand Score: Based on Google Trends search volume/growth.
         - Pain Score: Based on Reddit complaint frequency.
         - Momentum Score: Based on Twitter engagement spikes.
         - Supply Score: Based on Product Hunt competitor density.
      4. Metrics:
         - Demand Growth: String (e.g. "+145%").
         - Reddit Complaints: Estimated count.
         - Twitter Mentions: Estimated count.
         - Competitor Count: Count of direct rivals.
      5. Demand Distribution:
         - Identify 3-5 global regions where interest is highest.
         - Provide approximate Latitude/Longitude.
         - Assign an intensity (1-10) for the distribution.

      Return the data strictly as a raw JSON array of objects without any markdown formatting like \`\`\`json. The objects must have these exact keys:
      "opportunity_name", "target_user", "dominant_pain", "pain_score", "demand_score", "momentum_score", "supply_score", "demand_growth", "reddit_complaints", "twitter_mentions", "competitor_count", "build_recommendation", "demand_locations" (array of objects with "city", "country", "lat", "lng", "intensity").
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    let text = response.text;
    if (!text) {
      return [];
    }

    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Invalid response format from AI.");
    }

    text = text.substring(startIndex, endIndex + 1);
    const data = JSON.parse(text);
    
    const processedData = data.map((opp: any) => {
      const demandWeighted = opp.demand_score * 0.35;
      const painWeighted = opp.pain_score * 0.25;
      const momentumWeighted = opp.momentum_score * 0.25;
      const saturationPenalty = opp.supply_score * 0.15;
      
      const rawScore = (demandWeighted + painWeighted + momentumWeighted) - saturationPenalty;
      let finalScore = Math.round(rawScore * 10);
      finalScore = Math.max(0, Math.min(100, finalScore));

      return {
        ...opp,
        opportunity_score: finalScore
      };
    }).sort((a: any, b: any) => b.opportunity_score - a.opportunity_score);

    return processedData;
  } catch (error: any) {
    console.error("Discovery Failed:", error);
    if (error.message && error.message.includes("API key not valid")) {
      throw new Error("Your Gemini API Key is invalid. Please check your API Key configuration in the Settings menu.");
    }
    throw error;
  }
};
