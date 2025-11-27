
import React from 'react';
import { Transaction } from '../types';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Calendar, Tag } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === 'income';

  return (
    <div className="group relative flex items-center justify-between gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`p-2.5 rounded-full shrink-0 ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isIncome ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
        </div>
        
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{transaction.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1 shrink-0">
              <Calendar size={12} />
              {new Date(transaction.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 shrink-0">
              <Tag size={12} />
              {transaction.category}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`font-bold text-base md:text-lg whitespace-nowrap ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
          {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
        </span>
        
        {/* Delete button: Visible on hover for desktop, always visible (but subtle) on mobile if needed, or stick to standard pattern */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(transaction.id); }}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-all focus:opacity-100"
          title="Delete Transaction"
          aria-label="Delete transaction"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
