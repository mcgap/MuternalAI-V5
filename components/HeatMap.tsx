import React from 'react';
import { LocationData } from '../types';

interface Props {
  locations: LocationData[];
}

const HeatMap: React.FC<Props> = ({ locations }) => {
  const mapWidth = 800;
  const mapHeight = 400;

  const getXY = (lat: number, lng: number) => {
    const x = (lng + 180) * (mapWidth / 360);
    const y = ((-1 * lat) + 90) * (mapHeight / 180);
    return { x, y };
  };

  const hasData = locations && locations.length > 0;

  return (
    <div className="w-full mt-8 animate-fade-in-up">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
         Demand Distribution
         {hasData && <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded border border-brand-500/20">Live</span>}
      </h3>
      
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden border border-dark-border group">
        <div className="absolute inset-0 bg-dark-surface z-0"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-dark-bg/20 via-dark-bg/40 to-dark-bg/80 backdrop-blur-[2px] pointer-events-none"></div>
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/5 via-transparent to-transparent opacity-50"></div>

        <div className="relative z-20 w-full h-full flex items-center justify-center">
            {hasData ? (
                <div className="relative w-full h-full p-4">
                    <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-full opacity-20">
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="#333" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        <image href="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" x="0" y="0" width={mapWidth} height={mapHeight} opacity="0.3" className="grayscale invert" />
                    </svg>

                    {locations.map((loc, i) => {
                        const { x, y } = getXY(loc.lat, loc.lng);
                        return (
                            <div 
                                key={i}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group/point"
                                style={{ left: `${(x / mapWidth) * 100}%`, top: `${(y / mapHeight) * 100}%` }}
                            >
                                <div className="absolute w-12 h-12 bg-brand-500/20 rounded-full animate-ping opacity-75"></div>
                                <div 
                                    className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(20,184,166,0.8)] border border-white/20 relative z-10 cursor-pointer"
                                    title={`${loc.city}, ${loc.country} (Intensity: ${loc.intensity})`}
                                ></div>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/90 border border-brand-500/30 px-3 py-1.5 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none z-30 flex flex-col items-center">
                                    <span className="font-bold text-brand-400">{loc.city}</span>
                                    <span className="text-gray-400">Demand: {loc.intensity}/10</span>
                                </div>
                            </div>
                        );
                    })}
                    
                    <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 font-mono">
                        Source: User Interest Analysis
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 border border-dashed border-white/10">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    </div>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">
                        Discover Startup Gaps to reveal demand distribution
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HeatMap;