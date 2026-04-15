import express from "express";
import path from "path";
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

async function startServer() {
  console.log("Starting server. GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/opportunities", async (req, res) => {
    try {
      const { niche } = req.body;
      const query = niche || "General";

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "API Key is missing on the server. Available keys: " + Object.keys(process.env).join(", ") 
        });
      }
      
      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "undefined" || apiKey === '""' || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(500).json({ 
          error: "Your Gemini API Key is invalid or set to a placeholder. Please generate a real API key from Google AI Studio and paste it in the Settings menu." 
        });
      }
      
      // Clean up the API key just in case it has quotes or whitespace
      apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
      
      console.log("API Key length:", apiKey.length, "Starts with:", apiKey.substring(0, 5));

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Discover startup gaps for: "${query}" using search to find validation proof (last 90 days).

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
        return res.json([]);
      }

      // Extract the JSON array from the response, ignoring any conversational text
      const startIndex = text.indexOf('[');
      const endIndex = text.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        console.error("Could not find JSON array in response:", text);
        return res.status(500).json({ error: "Invalid response format from AI." });
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

      res.json(processedData);
    } catch (error: any) {
      console.error("Discovery Failed:", error);
      
      // Check for invalid API key error from Gemini
      if (error.message && error.message.includes("API key not valid")) {
        return res.status(500).json({ 
          error: "Your Gemini API Key is invalid. Please check your API Key configuration in the Settings menu." 
        });
      }
      
      res.status(500).json({ error: error.message || "An error occurred during discovery" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
