import React, { useEffect, useState } from 'react';

const SIGNALS = [
  "Gathering proof from r/SaaS complaints...",
  "Validating 'How to automate' queries...",
  "Analyzing startup launches...",
  "Detecting market gaps in 'Copywriting AI'...",
  "High demand validation: 'AI Legal Compliance'...",
  "User pain point confirmed: 'QuickBooks API integration'...",
  "Calculating strength for startup ideas...",
  "Indexing user feedback from G2 Crowd...",
  "Synthesizing startup validation proof..."
];

const SignalStream: React.FC<{ active: boolean }> = ({ active }) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!active) {
      setLines([]);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      setLines(prev => {
        const newLine = `[${new Date().toISOString().split('T')[1].slice(0,8)}] > ${SIGNALS[index % SIGNALS.length]}`;
        const newLines = [...prev, newLine];
        if (newLines.length > 5) newLines.shift();
        return newLines;
      });
      index++;
    }, 600);

    return () => clearInterval(interval);
  }, [active]);

  if (!active && lines.length === 0) return null;

  return (
    <div className="w-full bg-dark-bg/50 border-y border-brand-900/30 p-4 font-mono text-xs text-brand-400/80 overflow-hidden h-32 relative">
      <div className="absolute top-0 right-0 p-2 text-[10px] text-brand-600 uppercase">Live Proof</div>
      <div className="flex flex-col justify-end h-full space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="animate-pulse">{line}</div>
        ))}
      </div>
    </div>
  );
};

export default SignalStream;