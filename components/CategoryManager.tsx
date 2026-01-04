
import React, { useState } from 'react';
import { CategoryDefinition, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

interface CategoryManagerProps {
  customCategories: CategoryDefinition[];
  onAdd: (name: string, type: TransactionType, color: string) => void;
  onDelete: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ customCategories, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#6366f1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), type, color);
    setName('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Create New Category</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subscriptions"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="w-40 space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="w-20 space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-[50px] p-1 rounded-xl border border-slate-200 cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg h-[50px]"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Income Categories
          </h3>
          <div className="space-y-3">
            {[...DEFAULT_CATEGORIES, ...customCategories].filter(c => c.type === 'income').map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }}></div>
                  <span className="font-medium text-slate-900">{c.name}</span>
                  {!c.isCustom && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100 ml-2">Default</span>}
                </div>
                {c.isCustom && (
                  <button 
                    onClick={() => onDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
            Expense Categories
          </h3>
          <div className="space-y-3">
            {[...DEFAULT_CATEGORIES, ...customCategories].filter(c => c.type === 'expense').map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }}></div>
                  <span className="font-medium text-slate-900">{c.name}</span>
                  {!c.isCustom && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100 ml-2">Default</span>}
                </div>
                {c.isCustom && (
                  <button 
                    onClick={() => onDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
