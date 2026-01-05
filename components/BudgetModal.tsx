
import React, { useState } from 'react';
import { CategoryDefinition, Budget } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

interface BudgetModalProps {
  customCategories: CategoryDefinition[];
  budgets: Budget[];
  onSave: (categoryName: string, amount: number) => Promise<void>;
  onClose: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ customCategories, budgets, onSave, onClose }) => {
  const expenseCategories = [...DEFAULT_CATEGORIES, ...customCategories].filter(c => c.type === 'expense');
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdate = async (catName: string, amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return;
    
    setLoading(catName);
    try {
      await onSave(catName, amount);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Monthly Budgets</h2>
            <p className="text-slate-400 text-sm">Set limits for your expense categories</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {expenseCategories.map(cat => {
            const currentBudget = budgets.find(b => b.category_name === cat.name)?.amount || 0;
            return (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    defaultValue={currentBudget || ''}
                    placeholder="Set goal"
                    onBlur={(e) => handleUpdate(cat.name, e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  />
                  {loading === cat.name && (
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
