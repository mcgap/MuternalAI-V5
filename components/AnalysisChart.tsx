import React from 'react';
import { Opportunity } from '../types';

interface Props {
  opportunity: Opportunity;
}

const AnalysisChart: React.FC<Props> = ({ opportunity }) => {
  const getColorClass = (value: number, type: 'standard' | 'inverse') => {
    if (type === 'inverse') {
       // For Saturation/Supply: High score is BAD (Red), Low score is GOOD (Green)
       if (value >= 7) return 'bg-[#F87171]'; 
       if (value >= 4) return 'bg-[#FACC15]';
       return 'bg-[#14F1A0]';
    }
    
    // For Pain/Demand/Momentum: High score is GOOD (Green), Low score is BAD (Red)
    if (value >= 7) return 'bg-[#14F1A0]';
    if (value >= 4) return 'bg-[#FACC15]';
    return 'bg-[#F87171]';
  };

  const metrics = [
    { label: 'Pain', value: opportunity.pain_score, type: 'standard' as const },
    { label: 'Demand', value: opportunity.demand_score, type: 'standard' as const },
    { label: 'Momentum', value: opportunity.momentum_score, type: 'standard' as const },
    { label: 'Supply', value: opportunity.supply_score, type: 'inverse' as const },
  ];

  return (
    <div className="w-full mt-3">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider leading-none">{m.label}</span>
              <span className="text-[10px] font-bold text-gray-400 font-mono leading-none">{m.value}/10</span>
            </div>
            {/* Track */}
            <div className="h-1 w-full bg-dark-border rounded-full overflow-hidden">
              {/* Fill */}
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getColorClass(m.value, m.type)}`} 
                style={{ width: `${m.value * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisChart;