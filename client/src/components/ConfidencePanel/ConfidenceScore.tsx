import { useState } from 'react';
import type { ConfidenceBreakdown } from '../../types/product.types';

interface ConfidenceScoreProps {
  confidence: ConfidenceBreakdown;
}

export function ConfidenceScore({ confidence }: ConfidenceScoreProps) {
  const [expanded, setExpanded] = useState(false);

  const getScoreTheme = (score: number) => {
    if (score >= 85) {
      return {
        gaugeColor: '#C8A96E', // Luxury Gold
        badgeBg: 'bg-[#C8A96E]/20 text-[#E6CD97] border-[#C8A96E]/40',
        barColor: 'from-[#C8A96E] to-[#E6CD97]',
      };
    }
    if (score >= 60) {
      return {
        gaugeColor: '#f59e0b',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        barColor: 'from-amber-500 to-amber-300',
      };
    }
    return {
      gaugeColor: '#ef4444',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      barColor: 'from-red-500 to-red-400',
    };
  };

  const theme = getScoreTheme(confidence.score);
  const strokeDashoffset = 283 - (283 * confidence.score) / 100;

  return (
    <div className="relative bg-[#111111] text-white rounded-2xl p-5 border border-gray-800 shadow-xl overflow-hidden">
      {/* Background Gold Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#C8A96E]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Animated Radial Gold Gauge */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-gray-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={theme.gaugeColor}
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="font-mono font-black text-base text-white block leading-none">
                {confidence.score}
              </span>
              <span className="text-[8px] font-bold tracking-widest uppercase text-[#C8A96E] block mt-0.5">
                /100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A96E] flex items-center gap-1">
                <svg className="w-3.5 h-3.5 fill-current text-[#C8A96E]" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.681-.056-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                Purchase Confidence Index
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${theme.badgeBg}`}>
                {confidence.label}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 mt-1 leading-snug">
              Verified live stock, price stability, express delivery SLA & seller trust rating.
            </p>
          </div>
        </div>

        {/* Expand Breakdown Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 shrink-0 cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors border border-white/10"
        >
          <span>{expanded ? 'Hide' : 'Why this score?'}</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Mathematical Factor Breakdown */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-800 animate-slide-down space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span>Deterministic Scoring Signal</span>
            <span>Weighted Contribution</span>
          </div>

          <div className="space-y-3">
            {confidence.factors.map((factor) => {
              const percentage = Math.round((factor.contribution / factor.maxContribution) * 100);
              return (
                <div key={factor.name} className="text-xs space-y-1">
                  <div className="flex justify-between items-center text-gray-200">
                    <span className="font-medium text-xs">{factor.name}</span>
                    <span className="font-mono text-xs font-bold text-[#C8A96E]">
                      {factor.contribution} <span className="text-gray-500 font-normal">/ {factor.maxContribution} pts</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden p-0.5 border border-gray-700/50">
                    <div
                      className={`h-full bg-gradient-to-r ${theme.barColor} transition-all duration-700 rounded-full`}
                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
