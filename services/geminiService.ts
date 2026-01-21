import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Opportunity } from "../types";

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
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Discover startup gaps for: "${niche}" using search to find validation proof (last 90 days).

    Identify top 10 Validated Startup Ideas.
    
    For each opportunity, provide:
    1. Opportunity Name & Target User.
    2. Dominant Pain: A specific problem statement found in user communities.
    3. Proof Strength (0-10):
       - Demand Score: Based on Google Trends search volume/growth.
       - Pain Score: Based on Reddit complaint severity.
       - Momentum Score: Based on velocity.
       - Saturation Score: Based on competitor density.
    4. Metrics:
       - Demand Growth: String (e.g. "+145%").
       - Reddit Complaints: Estimated count.
       - Twitter Mentions: Estimated count.
       - Competitor Count: Count of direct rivals.
    5. Demand Distribution:
       - Identify 3-5 global regions where interest is highest.
       - Provide approximate Latitude/Longitude.
       - Assign an intensity (1-10) for the distribution.

    Return the data strictly as a JSON array.
  `;

  const opportunitySchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        opportunity_name: { type: Type.STRING },
        target_user: { type: Type.STRING },
        dominant_pain: { type: Type.STRING },
        pain_score: { type: Type.NUMBER },
        demand_score: { type: Type.NUMBER },
        momentum_score: { type: Type.NUMBER },
        supply_score: { type: Type.NUMBER },
        demand_growth: { type: Type.STRING },
        reddit_complaints: { type: Type.NUMBER },
        twitter_mentions: { type: Type.NUMBER },
        competitor_count: { type: Type.NUMBER },
        build_recommendation: { type: Type.STRING },
        demand_locations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING },
              country: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              intensity: { type: Type.NUMBER }
            }
          }
        }
      },
      required: [
        "opportunity_name", "target_user", "dominant_pain", 
        "pain_score", "demand_score", "momentum_score", "supply_score",
        "demand_growth", "reddit_complaints", "twitter_mentions", "competitor_count",
        "build_recommendation", "demand_locations"
      ],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: opportunitySchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text) as Omit<Opportunity, 'opportunity_score'>[];
    
    return data.map(opp => {
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
    }).sort((a, b) => b.opportunity_score - a.opportunity_score);

  } catch (error) {
    console.error("Discovery Failed:", error);
    throw error;
  }
};