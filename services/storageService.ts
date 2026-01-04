
import { Transaction, User, CategoryDefinition } from '../types';

const USERS_KEY = 'finance_tracker_users';
const TRANSACTIONS_KEY = 'finance_tracker_transactions';
const CATEGORIES_KEY = 'finance_tracker_categories';
const SESSION_KEY = 'finance_tracker_session';

export const storageService = {
  // Auth Simulation
  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  signUp: async (email: string, password: string): Promise<User> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }
    const newUser = { id: Math.random().toString(36).substr(2, 9), email };
    users.push({ ...newUser, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  signIn: async (email: string, password: string): Promise<User> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const { password: _, ...userData } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return userData;
  },

  signOut: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // Categories Management
  getCustomCategories: async (userId: string): Promise<CategoryDefinition[]> => {
    const all = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    return all.filter((c: CategoryDefinition) => c.user_id === userId);
  },

  addCustomCategory: async (userId: string, data: Omit<CategoryDefinition, 'id' | 'user_id' | 'isCustom'>): Promise<CategoryDefinition> => {
    const all = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    const newCat: CategoryDefinition = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      isCustom: true
    };
    all.push(newCat);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(all));
    return newCat;
  },

  deleteCustomCategory: async (id: string): Promise<void> => {
    const all = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    const filtered = all.filter((c: CategoryDefinition) => c.id !== id);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
  },

  // Transaction DB Simulation
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const all = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    return all.filter((t: Transaction) => t.user_id === userId);
  },

  addTransaction: async (userId: string, data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> => {
    const all = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    const newTx: Transaction = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      created_at: new Date().toISOString()
    };
    all.push(newTx);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(all));
    return newTx;
  },

  updateTransaction: async (tx: Transaction): Promise<Transaction> => {
    const all = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    const updated = all.map((t: Transaction) => t.id === tx.id ? tx : t);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
    return tx;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const all = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    const filtered = all.filter((t: Transaction) => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
  }
};
