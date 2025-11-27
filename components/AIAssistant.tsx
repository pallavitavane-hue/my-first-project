import React, { useState } from 'react';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { analyzeFinances } from '../services/geminiService';
import { Transaction } from '../types';

interface FinancialInsightProps {
  transactions: Transaction[];
}

export const FinancialInsight: React.FC<FinancialInsightProps> = ({ transactions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<{ summary: string; tips: string[] } | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeFinances(transactions);
      setInsight(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-900 to-purple-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-300" size={20} />
              AI Financial Advisor
            </h2>
            <p className="text-indigo-200 text-sm mt-1 max-w-sm">
              Get personalized insights on your spending habits and tips to save more.
            </p>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading || transactions.length === 0}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
            {insight ? 'Refresh Analysis' : 'Analyze Finances'}
          </button>
        </div>

        {insight && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
              <h3 className="text-sm font-semibold text-indigo-200 mb-1">Summary</h3>
              <p className="text-white leading-relaxed">{insight.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insight.tips.map((tip, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <span className="block text-xs font-bold text-yellow-300 mb-1">Tip #{idx + 1}</span>
                  <p className="text-sm text-gray-200">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};