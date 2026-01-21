export interface LocationData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  intensity: number; // 1-10 scale representing heat
}

export interface Opportunity {
  opportunity_name: string;
  target_user: string;
  pain_score: number;
  demand_score: number;
  supply_score: number;
  momentum_score: number; // New metric
  opportunity_score: number;
  build_recommendation: string;
  
  // Live Signal Data
  dominant_pain: string;
  demand_growth: string;      // e.g., "+132%"
  reddit_complaints: number;  // Estimated count
  twitter_mentions: number;   // Estimated count
  competitor_count: number;   // Estimated count
  
  // Geolocation for Heat Map
  demand_locations: LocationData[];
}

export interface GenerationParams {
  niche?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}