
import { CategoryDefinition } from './types';

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: 'cat_salary', user_id: null, name: 'Salary', type: 'income', color: '#10b981', isCustom: false },
  { id: 'cat_freelance', user_id: null, name: 'Freelance', type: 'income', color: '#3b82f6', isCustom: false },
  { id: 'cat_food', user_id: null, name: 'Food', type: 'expense', color: '#f59e0b', isCustom: false },
  { id: 'cat_transport', user_id: null, name: 'Transport', type: 'expense', color: '#6366f1', isCustom: false },
  { id: 'cat_bills', user_id: null, name: 'Bills', type: 'expense', color: '#ef4444', isCustom: false },
  { id: 'cat_entertainment', user_id: null, name: 'Entertainment', type: 'expense', color: '#ec4899', isCustom: false },
  { id: 'cat_healthcare', user_id: null, name: 'Healthcare', type: 'expense', color: '#14b8a6', isCustom: false },
  { id: 'cat_shopping', user_id: null, name: 'Shopping', type: 'expense', color: '#8b5cf6', isCustom: false },
  { id: 'cat_other_in', user_id: null, name: 'Other Income', type: 'income', color: '#64748b', isCustom: false },
  { id: 'cat_other_ex', user_id: null, name: 'Other Expense', type: 'expense', color: '#64748b', isCustom: false },
];

export const getCategoryColor = (name: string, customCategories: CategoryDefinition[] = []): string => {
  const all = [...DEFAULT_CATEGORIES, ...customCategories];
  const cat = all.find(c => c.name === name);
  return cat ? cat.color : '#64748b';
};
