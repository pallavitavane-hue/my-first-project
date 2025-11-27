import React, { useState } from 'react';
import { Transaction, CATEGORIES, TransactionType } from '../types';
import { X, Loader2, Sparkles } from 'lucide-react';
import { suggestCategory } from '../services/geminiService';

interface TransactionFormProps {
  onSubmit: (t: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
  defaultType?: TransactionType;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, isOpen, defaultType = 'expense' }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [category, setCategory] = useState(CATEGORIES[defaultType][0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      amount: parseFloat(amount),
      type,
      category,
      date,
      description
    });
    // Reset
    setTitle('');
    setAmount('');
    setDescription('');
  };

  const handleAISuggestion = async () => {
    if (!title) return;
    setIsSuggesting(true);
    const suggested = await suggestCategory(title, parseFloat(amount) || 0);
    if (CATEGORIES[type].includes(suggested)) {
        setCategory(suggested);
    }
    setIsSuggesting(false);
  };

  // Update category list when type changes
  React.useEffect(() => {
    setCategory(CATEGORIES[type][0]);
  }, [type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Type Selector */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                >
                    Income
                </button>
                <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                >
                    Expense
                </button>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <div className="relative">
                <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleAISuggestion}
                placeholder="e.g., Grocery Shopping"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
                {isSuggesting && <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-indigo-500"/>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    Category 
                    {title && !isSuggesting && <Sparkles size={12} className="text-indigo-500 cursor-pointer" onClick={handleAISuggestion}/>}
                </label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                >
                    {CATEGORIES[type].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all ${type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Save {type === 'income' ? 'Income' : 'Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};