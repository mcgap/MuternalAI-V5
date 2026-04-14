import { Opportunity } from "../types";

export const generateOpportunities = async (niche: string = "General"): Promise<Opportunity[]> => {
  try {
    const response = await fetch('/api/opportunities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ niche }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Discovery Failed:", error);
    throw error;
  }
};