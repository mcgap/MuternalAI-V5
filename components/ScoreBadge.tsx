import React from 'react';

interface Props {
  score: number;
}

const ScoreBadge: React.FC<Props> = ({ score }) => {
  let scoreColor = 'text-white';
  if (score >= 80) scoreColor = 'text-[#14F1A0]';
  else if (score >= 60) scoreColor = 'text-[#FACC15]';
  else scoreColor = 'text-[#F87171]';

  return (
    <div className="text-right">
      <div className="flex items-center justify-end gap-3">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wide">Strength</span>
        <span className={`text-4xl md:text-5xl font-bold ${scoreColor} tracking-tighter leading-none`}>
          {score}%
        </span>
      </div>
    </div>
  );
};

export default ScoreBadge;