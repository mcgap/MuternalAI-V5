import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight,
  Terminal,
  Layers,
  Zap,
  Activity,
  LayoutDashboard,
  Hammer,
  ChevronLeft,
  MessageCircle,
  Hash,
  Package,
  Globe,
  FileText,
  Copy,
  Check,
  Megaphone,
  CreditCard,
  Lightbulb,
  Cpu,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Users
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { Opportunity, AppState } from './types';
import { generateOpportunities } from './services/geminiService';
import SignalStream from './components/SignalStream';
import ScoreBadge from './components/ScoreBadge';
import HeatMap from './components/HeatMap';

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    opportunity_name: "AI Legal Automation",
    target_user: "Small Law Firms",
    pain_score: 9,
    demand_score: 8,
    momentum_score: 7,
    supply_score: 3,
    opportunity_score: 79, 
    dominant_pain: "Manual contract review costs $200/hr + high error risk",
    demand_growth: "+132%",
    reddit_complaints: 67,
    twitter_mentions: 1240,
    competitor_count: 5,
    build_recommendation: "Automate contract review and clause extraction specifically for boutique firms who cannot afford enterprise tools.",
    demand_locations: [
      { city: "New York", country: "USA", lat: 40.7128, lng: -74.0060, intensity: 9 },
      { city: "London", country: "UK", lat: 51.5074, lng: -0.1278, intensity: 8 },
      { city: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, intensity: 7 }
    ]
  },
  {
    opportunity_name: "Vertical SaaS CRM for Plumbers",
    target_user: "Plumbing Businesses",
    pain_score: 8,
    demand_score: 7,
    momentum_score: 5,
    supply_score: 2,
    opportunity_score: 74,
    dominant_pain: "Generic CRMs are too complex and lack dispatch features",
    demand_growth: "+85%",
    reddit_complaints: 42,
    twitter_mentions: 150,
    competitor_count: 3,
    build_recommendation: "Mobile-first CRM with offline mode and automated dispatching.",
    demand_locations: [
        { city: "Dallas", country: "USA", lat: 32.7767, lng: -96.7970, intensity: 8 },
        { city: "Phoenix", country: "USA", lat: 33.4484, lng: -112.0740, intensity: 7 }
    ]
  },
  {
    opportunity_name: "AI Grant Writer for Non-Profits",
    target_user: "Non-Profit Directors",
    pain_score: 9,
    demand_score: 6,
    momentum_score: 6,
    supply_score: 3,
    opportunity_score: 72,
    dominant_pain: "Writing grants takes 40+ hours with low success rate",
    demand_growth: "+60%",
    reddit_complaints: 89,
    twitter_mentions: 340,
    competitor_count: 4,
    build_recommendation: "Fine-tune LLM on successful grant applications for specific sectors.",
    demand_locations: [
          { city: "Washington", country: "USA", lat: 38.9072, lng: -77.0369, intensity: 9 },
          { city: "Brussels", country: "Belgium", lat: 50.8503, lng: 4.3517, intensity: 7 }
    ]
  },
  {
    opportunity_name: "E-commerce Returns Optimizer",
    target_user: "Shopify Store Owners",
    pain_score: 7,
    demand_score: 9,
    momentum_score: 8,
    supply_score: 6,
    opportunity_score: 70,
    dominant_pain: "Returns are eating 20% of profit margins",
    demand_growth: "+110%",
    reddit_complaints: 210,
    twitter_mentions: 890,
    competitor_count: 12,
    build_recommendation: "Predict high-risk returns before checkout using behavioral analysis.",
    demand_locations: [
        { city: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437, intensity: 9 },
        { city: "Shenzhen", country: "China", lat: 22.5431, lng: 114.0579, intensity: 8 }
    ]
  },
  {
    opportunity_name: "AI Procurement Negotiator",
    target_user: "SME Operations Managers",
    pain_score: 8,
    demand_score: 5,
    momentum_score: 4,
    supply_score: 2,
    opportunity_score: 69,
    dominant_pain: "Overpaying for vendor supplies due to lack of negotiation time",
    demand_growth: "+35%",
    reddit_complaints: 28,
    twitter_mentions: 90,
    competitor_count: 2,
    build_recommendation: "Email bot that auto-negotiates renewal contracts with vendors.",
    demand_locations: [
        { city: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298, intensity: 7 },
        { city: "Frankfurt", country: "Germany", lat: 50.1109, lng: 8.6821, intensity: 6 }
    ]
  },
  {
    opportunity_name: "AI Video Editing for Reels",
    target_user: "Content Creators",
    pain_score: 8,
    demand_score: 10,
    momentum_score: 9,
    supply_score: 8,
    opportunity_score: 68,
    dominant_pain: "Hours spent editing subtitles and jump-cuts for 30s clips",
    demand_growth: "+210%",
    reddit_complaints: 145,
    twitter_mentions: 5400,
    competitor_count: 22,
    build_recommendation: "Auto-captioning is saturated. Focus on 'retention editing'—AI that suggests visual hooks.",
    demand_locations: [
      { city: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437, intensity: 10 },
      { city: "Austin", country: "USA", lat: 30.2672, lng: -97.7431, intensity: 8 },
      { city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, intensity: 7 }
    ]
  },
  {
    opportunity_name: "Automated Code Documentation",
    target_user: "Dev Agencies",
    pain_score: 6,
    demand_score: 8,
    momentum_score: 7,
    supply_score: 5,
    opportunity_score: 66,
    dominant_pain: "Legacy codebases are undocumented and hard to hand off",
    demand_growth: "+95%",
    reddit_complaints: 156,
    twitter_mentions: 1100,
    competitor_count: 9,
    build_recommendation: "Generate visual system architecture diagrams from repo URL.",
    demand_locations: [
        { city: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194, intensity: 10 },
        { city: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946, intensity: 9 }
    ]
  },
  {
    opportunity_name: "AI Local SEO Assistant",
    target_user: "Small Business Owners",
    pain_score: 7,
    demand_score: 8,
    momentum_score: 6,
    supply_score: 4,
    opportunity_score: 65,
    dominant_pain: "Ignoring Google Reviews leads to revenue drop",
    demand_growth: "+45%",
    reddit_complaints: 34,
    twitter_mentions: 210,
    competitor_count: 8,
    build_recommendation: "Focus on Google Business Profile auto-updates and review response automation.",
    demand_locations: [
      { city: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298, intensity: 8 },
      { city: "Miami", country: "USA", lat: 25.7617, lng: -80.1918, intensity: 7 },
      { city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, intensity: 6 }
    ]
  },
  {
    opportunity_name: "Personalized Study Plan AI",
    target_user: "University Students",
    pain_score: 9,
    demand_score: 9,
    momentum_score: 8,
    supply_score: 7,
    opportunity_score: 64,
    dominant_pain: "Overwhelmed by syllabus and procrastination",
    demand_growth: "+180%",
    reddit_complaints: 450,
    twitter_mentions: 3200,
    competitor_count: 15,
    build_recommendation: "Dynamic calendar that adapts to student's energy levels and grades.",
    demand_locations: [
        { city: "Boston", country: "USA", lat: 42.3601, lng: -71.0589, intensity: 9 },
        { city: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780, intensity: 9 }
    ]
  }
];

const getBlueprint = (opp: Opportunity) => {
  const name = opp.opportunity_name.toLowerCase();
  const isLegal = name.includes("legal") || name.includes("compliance") || name.includes("procurement");
  const isVideo = name.includes("video") || name.includes("reel") || name.includes("content");
  const isSeo = name.includes("seo") || name.includes("marketing");
  const isCrm = name.includes("crm") || name.includes("manage");
  const isEdu = name.includes("study") || name.includes("learning");
  const isDev = name.includes("code") || name.includes("dev");

  if (isLegal) {
    return {
      mvp: ["PDF Contract/Doc Parser", "Risk Score Highlight", "Clause Comparison Engine"],
      stack: ["Gemini 1.5 Pro (Long Context)", "Pinecone (Vector DB)", "React / Node.js"],
      monetization: ["Freemium (<5 docs/mo)", "$49/mo Pro Plan", "Enterprise API Access"],
      channel: "LinkedIn Cold Outreach",
      pricing: "Tiered Subscription"
    };
  }
  if (isVideo) {
    return {
      mvp: ["Auto-Caption Generation", "Silence Removal", "Viral Hook Suggestion"],
      stack: ["Gemini Flash (Multimodal)", "FFmpeg (Processing)", "Next.js"],
      monetization: ["Watermarked Free Tier", "$29/mo Creator Plan", "Pay-per-video"],
      channel: "TikTok/Reels Organic",
      pricing: "Freemium SaaS"
    };
  }
  if (isSeo) {
    return {
      mvp: ["GMB Auto-Poster", "Review Responder Bot", "Keyword Tracker"],
      stack: ["Gemini Flash", "Google Maps API", "Vercel Edge Functions"],
      monetization: ["7-Day Free Trial", "$19/mo per Location", "Agency Whitelabel"],
      channel: "Local Business Directories",
      pricing: "Per Location"
    };
  }
  if (isCrm) {
    return {
      mvp: ["Contact Management", "Automated Dispatch SMS", "Offline Mode Sync"],
      stack: ["React Native (Mobile)", "Firebase (Real-time DB)", "Twilio API"],
      monetization: ["$39/mo per User", "Setup Fee for Data Import", "SMS Usage Fees"],
      channel: "Industry Trade Shows & Forums",
      pricing: "Per Seat + Usage"
    };
  }
  if (isEdu) {
    return {
      mvp: ["Syllabus Scanner", "Calendar Auto-Scheduling", "Pomodoro Timer"],
      stack: ["Gemini Flash", "React / Next.js", "Cal.com API"],
      monetization: ["Freemium (Basic)", "$5/mo Student Plan", "University Licensing"],
      channel: "Campus Ambassadors",
      pricing: "Low-cost Subscription"
    };
  }
  if (isDev) {
    return {
      mvp: ["Repo Scanner", "Architecture Diagram Gen", "Doc Site Builder"],
      stack: ["Gemini 1.5 Pro", "Mermaid.js (Visuals)", "Astro (Docs)"],
      monetization: ["Free for Public Repos", "$29/mo Private Repos", "Team Plan"],
      channel: "GitHub Marketplace",
      pricing: "Per Repository / Seat"
    };
  }
  
  return {
    mvp: ["Core Workflow Automation", "AI Insight Dashboard", "One-click Report Gen"],
    stack: ["Gemini Flash (Speed)", "Supabase (Auth/DB)", "Vercel"],
    monetization: ["7-day Free Trial", "$29/mo Seat", "Usage-based tokens"],
    channel: "Niche Communities & SEO",
    pricing: "Per Seat / Usage"
  };
};

const App: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.COMPLETE);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const dashboardScrollRef = useRef<HTMLDivElement>(null);
  const signalsScrollRef = useRef<HTMLDivElement>(null);
  const builderScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCopiedPrompt(false);
  }, [selectedOpp]);

  const executeMarketAnalysis = async (query: string) => {
    setAppState(AppState.SCANNING);
    setError(null);
    setSelectedOpp(null);
    setOpportunities([]);
    setActiveTab('dashboard');
    if (dashboardScrollRef.current) dashboardScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(async () => {
      try {
        setAppState(AppState.ANALYZING);
        const results = await generateOpportunities(query);
        setOpportunities(results.slice(0, 10));
        setAppState(AppState.COMPLETE);
        setLastSyncTime(new Date());
      } catch (err) {
        setAppState(AppState.ERROR);
        setError("Startup intelligence feed interrupted. Please check your API Key configuration.");
      }
    }, 2500);
  };

  const handleGlobalScan = () => {
    executeMarketAnalysis("High Growth SaaS Opportunities");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;
    executeMarketAnalysis(niche);
  };

  const handleViewSignals = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setActiveTab('signals');
    if (signalsScrollRef.current) signalsScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateBuildPrompt = (opp: Opportunity) => {
    const blueprint = getBlueprint(opp);
    return `You are a senior full-stack engineer. Build a MVP for "${opp.opportunity_name}" targeting "${opp.target_user}".
  
Context:
- Problem: ${opp.dominant_pain}
- Solution: ${opp.build_recommendation}

Tech Stack:
${blueprint.stack.map(s => `- ${s}`).join('\n')}

Core Features (MVP):
${blueprint.mvp.map(f => `- ${f}`).join('\n')}

Monetization Strategy:
${blueprint.monetization.map(m => `- ${m}`).join('\n')}

Please create a project structure and the initial configuration files.`;
  };

  const handleDownloadBlueprint = () => {
    if (!selectedOpp) return;
    
    const blueprint = getBlueprint(selectedOpp);
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("MUTERNAL AI", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`STARTUP BLUEPRINT`, 20, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 31);
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    let y = 45;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`1. OPPORTUNITY: ${selectedOpp.opportunity_name}`, 20, y);
    y += 7;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Target User: ${selectedOpp.target_user}`, 20, y);
    y += 7;
    doc.text(`Dominant Pain: ${selectedOpp.dominant_pain}`, 20, y, { maxWidth: 170 });
    y += 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. STARTUP INTELLIGENCE (LIVE)", 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Demand Growth: ${selectedOpp.demand_growth}`, 20, y);
    doc.text(`Pain/Complaints: ${selectedOpp.reddit_complaints} active threads`, 100, y);
    y += 6;
    doc.text(`Momentum: ${selectedOpp.momentum_score}/10 (Twitter)`, 20, y);
    doc.text(`Saturation: ${selectedOpp.supply_score}/10 (Product Hunt)`, 100, y);
    y += 6;
    doc.text(`FINAL OPPORTUNITY STRENGTH: ${selectedOpp.opportunity_score}/100`, 20, y);
    y += 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. MVP FEATURE SET", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    blueprint.mvp.forEach(item => {
        doc.text(`• ${item}`, 25, y);
        y += 6;
    });
    y += 8;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. TECH STACK", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    blueprint.stack.forEach(item => {
        doc.text(`• ${item}`, 25, y);
        y += 6;
    });
    y += 8;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5. GO-TO-MARKET", 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Channel: ${blueprint.channel}`, 25, y);
    y += 6;
    doc.text(`Pricing: ${blueprint.pricing}`, 25, y);
    y += 6;
    blueprint.monetization.forEach(item => {
        doc.text(`• ${item}`, 25, y);
        y += 6;
    });

    doc.save(`${selectedOpp.opportunity_name.replace(/\s+/g, '_')}_Blueprint.pdf`);
  };

  const handleCopyPrompt = () => {
    if (!selectedOpp) return;
    navigator.clipboard.writeText(generateBuildPrompt(selectedOpp));
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const formatSyncTime = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year} • ${time}`;
  };

  const getMomentum = (score: number) => {
    if (score >= 8) return { text: "Surging", color: "text-[#14F1A0]" };
    if (score >= 5) return { text: "Rising", color: "text-[#FACC15]" };
    return { text: "Stable", color: "text-gray-400" };
  };

  const getSupplyDensity = (supplyScore: number) => {
    if (supplyScore <= 3) return { text: "Low", color: "text-[#14F1A0]" };
    if (supplyScore <= 6) return { text: "Medium", color: "text-[#FACC15]" };
    return { text: "High", color: "text-[#F87171]" };
  };

  const getSignalText = (score: number, inverse = false) => {
    if (inverse) {
        if (score >= 7) return 'High'; 
        if (score >= 4) return 'Medium';
        return 'Low'; 
    }
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  const getSignalHex = (score: number, inverse = false) => {
    if (inverse) {
       if (score >= 7) return '#F87171';
       if (score >= 4) return '#FACC15';
       return '#14F1A0';
    }
    if (score >= 7) return '#14F1A0';
    if (score >= 4) return '#FACC15';
    return '#F87171';
  };

  const getScoreColorHex = (score: number) => {
    if (score >= 80) return '#14F1A0';
    if (score >= 60) return '#FACC15';
    return '#F87171';
  };

  return (
    <div className="fixed inset-0 bg-dark-bg text-white font-sans selection:bg-brand-500/30 overflow-hidden">
      
      <header className="absolute top-0 left-0 right-0 z-50 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-[0_0_10px_rgba(45,212,191,0.1)]">
             <Cpu size={24} />
           </div>
           <div className="flex flex-col justify-center">
             <h1 className="font-bold text-lg tracking-tight leading-none text-white">Muternal<span className="text-brand-400">AI</span></h1>
             <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-1">Startup Intelligence</span>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono uppercase text-gray-600">
           <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
           Live Proof Active
        </div>
      </header>

      <main className="absolute inset-0 w-full h-full">
        
        {/* DASHBOARD PANEL */}
        <div 
          ref={dashboardScrollRef}
          className={`absolute inset-0 overflow-y-auto overflow-x-hidden pt-28 pb-40 px-4 scrollbar-hide transition-opacity duration-300 ${activeTab === 'dashboard' ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible'}`}
        >
          <div className="max-w-3xl mx-auto">
            
            <div className="text-center mb-12 animate-fade-in-down">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 text-center">
                Explore User Demand & <span className="text-[#14b8a6]">Build Your Startups</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base font-light mb-8 max-w-lg mx-auto leading-relaxed">
                Validate real startup ideas using live demand, pain, and competition data.
              </p>

              <form onSubmit={handleSearch} className="relative w-full max-w-lg mx-auto group z-20">
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Enter keyword to search your startup idea"
                  className="w-full bg-dark-surface border border-dark-border rounded-full py-4 pl-6 pr-32 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all shadow-2xl"
                  disabled={appState === AppState.SCANNING || appState === AppState.ANALYZING}
                />
                <button
                  type="submit"
                  disabled={appState === AppState.SCANNING || appState === AppState.ANALYZING}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-brand-600 hover:bg-brand-500 text-black font-semibold px-6 rounded-full transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {appState === AppState.SCANNING || appState === AppState.ANALYZING ? (
                     <span className="animate-spin"><Zap size={16} /></span>
                  ) : (
                    <>Search <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8">
                 {lastSyncTime && (
                   <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest animate-fade-in flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      Last Sync: {formatSyncTime(lastSyncTime)}
                   </span>
                 )}
                 <button
                    onClick={handleGlobalScan}
                    disabled={appState === AppState.SCANNING || appState === AppState.ANALYZING}
                    className="flex items-center gap-2 bg-dark-surface hover:bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold px-5 py-2.5 rounded-lg transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-brand-500/10 hover:border-brand-500/50"
                  >
                    <RefreshCw size={14} className={appState === AppState.SCANNING || appState === AppState.ANALYZING ? "animate-spin" : ""} />
                    {lastSyncTime ? "Refresh Startup Gaps" : "Discover Startup Gaps"}
                  </button>
              </div>
            </div>

            {(appState === AppState.SCANNING || appState === AppState.ANALYZING) && (
              <div className="mb-8 rounded-xl overflow-hidden border border-brand-500/20 shadow-[0_0_50px_rgba(20,184,166,0.1)]">
                <SignalStream active={true} />
              </div>
            )}

            {appState === AppState.COMPLETE && (
              <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-lg font-medium text-white">Top Validated Startup Ideas</h3>
                  <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                    {opportunities.length} Results
                  </span>
                </div>

                <div className="space-y-4">
                  {opportunities.map((opp, idx) => {
                    const scoreColorHex = getScoreColorHex(opp.opportunity_score);
                    
                    return (
                    <div 
                      key={idx}
                      onClick={() => handleViewSignals(opp)}
                      className="group relative bg-dark-surface border border-dark-border hover:border-brand-500 shadow-[0_0_20px_rgba(20,184,166,0.1)] hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] rounded-xl p-6 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="flex-1">
                          <div className="inline-block text-[10px] font-mono uppercase tracking-wider text-brand-400 mb-2">
                            {opp.target_user}
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-50 transition-colors">
                            {opp.opportunity_name}
                          </h3>

                          <div className="mb-3">
                             <div className="text-sm text-gray-400 leading-snug mb-3">
                               {opp.dominant_pain}
                             </div>
                             
                             <div className="flex items-center gap-6 text-xs font-mono tracking-wide text-gray-500">
                                <div>
                                    PAIN: <span className="text-white font-bold ml-1">{opp.pain_score}/10</span>
                                </div>
                                <div>
                                    MOMENTUM: <span className={`font-bold ml-1 ${getMomentum(opp.momentum_score).color}`}>{getMomentum(opp.momentum_score).text.toUpperCase()}</span>
                                </div>
                                <div>
                                    GROWTH: <span className="text-[#14F1A0] font-bold ml-1">{opp.demand_growth}</span>
                                </div>
                             </div>
                          </div>

                          <div className="w-full h-px bg-white/10 mt-2 relative overflow-hidden">
                             <div 
                                className="absolute top-0 left-0 h-full shadow-[0_0_8px_currentColor]" 
                                style={{ 
                                    width: `${opp.opportunity_score}%`,
                                    backgroundColor: scoreColorHex,
                                    color: scoreColorHex
                                }}
                             ></div>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-white/5 pt-4 md:pt-0 gap-4 min-w-[140px]">
                          <ScoreBadge score={opp.opportunity_score} />
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSignals(opp);
                            }}
                            className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors group/btn bg-brand-500/10 px-4 py-2 rounded-full border border-brand-500/20 hover:bg-brand-500/20 whitespace-nowrap mt-2"
                          >
                            View Validation <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* VALIDATION PANEL */}
        <div 
          ref={signalsScrollRef}
          className={`absolute inset-0 overflow-y-auto overflow-x-hidden pt-28 pb-40 px-4 scrollbar-hide transition-opacity duration-300 ${activeTab === 'signals' ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible'}`}
        >
          <div className="max-w-3xl mx-auto">
            {!selectedOpp ? (
              <div className="text-center py-20 border border-dashed border-dark-border rounded-2xl bg-dark-surface">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                   <Activity size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">No Opportunity Selected</h3>
                 <p className="text-gray-500 mb-6 max-sm mx-auto">Select a startup idea from the Dashboard to view detailed validation data.</p>
                 <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className="bg-white text-black font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
                 >
                   Go to Dashboard
                 </button>
              </div>
            ) : (
              <div>
                 <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-medium transition-colors"
                 >
                    <ChevronLeft size={16} /> Back to Dashboard
                 </button>

                 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                       <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedOpp.opportunity_name}</h1>
                       <p className="text-brand-400 font-mono text-sm uppercase tracking-wide flex items-center gap-2">
                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                         LIVE DEMAND VALIDATION
                       </p>
                    </div>
                 </div>

                 <div className="bg-brand-500/5 border-l-2 border-brand-500 p-6 mb-8 rounded-r-xl">
                    <div className="flex items-center gap-2 mb-2">
                       <Lightbulb className="text-brand-400" size={16} />
                       <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Founder Insight</span>
                    </div>
                    <p className="text-lg text-white leading-relaxed font-light">
                      {selectedOpp.build_recommendation}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-dark-surface border border-dark-border rounded-xl p-5 flex-1 text-center flex flex-col justify-center">
                         <div className="text-[10px] text-gray-500 uppercase font-mono mb-1 flex items-center justify-center gap-2"><TrendingUp size={12}/> Demand Growth</div>
                         <div className="font-bold text-[#14F1A0] text-xl md:text-2xl">{selectedOpp.demand_growth}</div>
                      </div>
                      <div className="bg-dark-surface border border-dark-border rounded-xl p-5 flex-1 text-center flex flex-col justify-center">
                         <div className="text-[10px] text-gray-500 uppercase font-mono mb-1 flex items-center justify-center gap-2"><AlertCircle size={12}/> Pain Proof</div>
                         <div className="font-bold text-white text-xl md:text-2xl">{selectedOpp.pain_score}/10</div>
                      </div>
                      <div className="bg-dark-surface border border-dark-border rounded-xl p-5 flex-1 text-center flex flex-col justify-center">
                         <div className="text-[10px] text-gray-500 uppercase font-mono mb-1 flex items-center justify-center gap-2"><Users size={12}/> Competitor Density</div>
                         <div className={`font-bold text-xl md:text-2xl ${getSupplyDensity(selectedOpp.supply_score).color}`}>{getSupplyDensity(selectedOpp.supply_score).text} ({selectedOpp.competitor_count})</div>
                      </div>
                 </div>

                 <div className="bg-dark-surface border border-dark-border rounded-xl p-6 mb-8 space-y-6">
                    <h3 className="text-sm font-mono uppercase text-gray-500 mb-4">Validation Sources</h3>
                    {[
                      { label: 'Google Trends (Volume)', value: selectedOpp.demand_score, type: 'standard' },
                      { label: 'Reddit (Complaint Intensity)', value: selectedOpp.pain_score, type: 'standard' },
                      { label: 'Twitter/X (Viral Velocity)', value: selectedOpp.momentum_score, type: 'standard' },
                      { label: 'Product Hunt (Saturation)', value: selectedOpp.supply_score, type: 'inverse' }
                    ].map((signal, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-medium text-gray-300">{signal.label}</span>
                          <span className="font-mono text-xs" style={{ color: getSignalHex(signal.value, signal.type === 'inverse') }}>
                            {getSignalText(signal.value, signal.type === 'inverse')}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${signal.value * 10}%`,
                              backgroundColor: getSignalHex(signal.value, signal.type === 'inverse')
                            }}
                          />
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 <HeatMap locations={selectedOpp.demand_locations || []} />

                 <div className="bg-gradient-to-b from-brand-900/10 to-dark-surface border border-brand-500/20 rounded-2xl p-8 text-center relative overflow-hidden mb-10 mt-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
                    
                    <button 
                      onClick={() => setActiveTab('builder')}
                      className="group relative z-20 inline-flex items-center gap-2 bg-brand-500 text-black font-bold px-8 py-4 rounded-full text-lg hover:bg-brand-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transform hover:-translate-y-1"
                    >
                      Turn This Into a Startup <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-xs text-brand-400/60 mt-4 uppercase tracking-wider font-mono">Turn this validated opportunity into a real startup</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* BUILDER PANEL */}
        <div 
          ref={builderScrollRef}
          className={`absolute inset-0 overflow-y-auto overflow-x-hidden pt-28 pb-40 px-4 scrollbar-hide transition-opacity duration-300 ${activeTab === 'builder' ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible'}`}
        >
          <div className="max-w-5xl mx-auto">
            {!selectedOpp ? (
              <div className="text-center py-20 border border-dashed border-dark-border rounded-2xl bg-dark-surface">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                  <Hammer size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Opportunity Selected</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Select a startup idea from the Dashboard to start building your plan.</p>
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className="bg-white text-black font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div>
                 <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Execution <span className="text-brand-400">Blueprint</span></h1>
                    <p className="text-gray-400 text-lg font-light">
                       Step-by-step execution plan to build and launch this startup.
                    </p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6 mb-12">
                      
                      <div className="bg-dark-surface border border-dark-border rounded-xl p-8 hover:border-brand-500/20 transition-colors">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs">1</div>
                             What to Build (MVP)
                          </h3>
                          <ul className="space-y-4">
                              {getBlueprint(selectedOpp).mvp.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></div>
                                    <span className="text-gray-300 leading-snug">{item}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="bg-dark-surface border border-dark-border rounded-xl p-8 hover:border-brand-500/20 transition-colors">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs">2</div>
                             How to Build (Stack)
                          </h3>
                          <ul className="space-y-4">
                              {getBlueprint(selectedOpp).stack.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                                    <span className="text-gray-300 leading-snug">{item}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="bg-dark-surface border border-dark-border rounded-xl p-8 hover:border-brand-500/20 transition-colors">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs">3</div>
                             HOW THIS MAKES MONEY
                          </h3>
                          <ul className="space-y-4">
                              {getBlueprint(selectedOpp).monetization.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                                    <span className="text-gray-300 leading-snug">{item}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="bg-dark-surface border border-dark-border rounded-xl p-8 hover:border-brand-500/20 transition-colors">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs">4</div>
                             HOW TO ACQUIRE USERS
                          </h3>
                          <ul className="space-y-4">
                              <li className="flex items-start gap-3">
                                 <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                 <span className="text-gray-300 leading-snug">Channel: {getBlueprint(selectedOpp).channel}</span>
                              </li>
                              <li className="flex items-start gap-3">
                                 <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                 <span className="text-gray-300 leading-snug">Pricing: {getBlueprint(selectedOpp).pricing}</span>
                              </li>
                          </ul>
                      </div>
                 </div>

                 <div className="relative bg-dark-surface border border-dark-border rounded-xl overflow-hidden group mb-12">
                     <div className="absolute top-3 right-3 z-10">
                        <button 
                          onClick={handleCopyPrompt}
                          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-md transition-colors backdrop-blur-md"
                          title="Copy to clipboard"
                        >
                          {copiedPrompt ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                     </div>
                     <div className="p-4 bg-dark-bg/50 border-b border-dark-border flex items-center gap-2">
                        <Terminal size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-500 font-mono">Startup Build Prompt</span>
                     </div>
                     <pre className="p-6 overflow-x-auto text-xs md:text-sm font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {generateBuildPrompt(selectedOpp)}
                     </pre>
                 </div>

                 <div className="pt-4 pb-20 flex flex-col items-center justify-center">
                    <button 
                      onClick={handleDownloadBlueprint}
                      className="group relative inline-flex items-center gap-2 bg-brand-500 text-black font-bold px-8 py-4 rounded-full text-lg hover:bg-brand-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transform hover:-translate-y-1"
                    >
                      <FileText size={20} /> Download Startup Blueprint <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="mt-3 text-xs font-mono text-brand-400/60 uppercase tracking-wider">(Launch-Ready PDF)</span>
                 </div>
              </div>
            )}
          </div>
        </div>

      </main>

      {activeTab !== 'dashboard' && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-dark-surface/90 backdrop-blur-xl border border-dark-border rounded-full p-1 flex items-center shadow-2xl shadow-black/50">
           <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
           >
             <LayoutDashboard size={16} /> Dashboard
           </button>
           <button 
            onClick={() => setActiveTab('signals')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'signals' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
           >
             <Activity size={16} /> Validation
           </button>
           <button 
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === 'builder' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
           >
             <Hammer size={16} /> Builder
           </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default App;