
import { supabase } from './supabaseClient';
import { Transaction, User, CategoryDefinition, Budget } from '../types';

export const storageService = {
  // Auth Integration
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email || '',
    };
  },

  signUp: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign up failed');
    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  },

  signIn: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed');
    return {
      id: data.user.id,
      email: data.user.email || '',
    };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Categories Management
  getCustomCategories: async (userId: string): Promise<CategoryDefinition[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase fetch error (categories):', error);
      throw error; // Throw so App can detect schema issues
    }
    
    return (data || []).map(cat => ({
      id: cat.id,
      user_id: cat.user_id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      isCustom: cat.is_custom
    }));
  },

  addCustomCategory: async (userId: string, data: Omit<CategoryDefinition, 'id' | 'user_id' | 'isCustom'>): Promise<CategoryDefinition> => {
    const { data: inserted, error } = await supabase
      .from('categories')
      .insert([{
        user_id: userId,
        name: data.name,
        type: data.type,
        color: data.color,
        is_custom: true
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: inserted.id,
      user_id: inserted.user_id,
      name: inserted.name,
      type: inserted.type,
      color: inserted.color,
      isCustom: inserted.is_custom
    };
  },

  deleteCustomCategory: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Budget Management
  getBudgets: async (userId: string): Promise<Budget[]> => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase fetch error (budgets):', error);
      throw error;
    }
    return data || [];
  },

  updateBudget: async (userId: string, categoryName: string, amount: number): Promise<void> => {
    const { data: existing, error: checkError } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category_name', categoryName)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      const { error: updateError } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', existing.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('budgets')
        .insert([{ user_id: userId, category_name: categoryName, amount }]);
      if (insertError) throw insertError;
    }
  },

  // Transaction DB Integration
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase fetch error (transactions):', error);
      throw error;
    }
    return data || [];
  },

  addTransaction: async (userId: string, data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> => {
    const { data: inserted, error } = await supabase
      .from('transactions')
      .insert([{
        ...data,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  },

  updateTransaction: async (tx: Transaction): Promise<Transaction> => {
    const { id, user_id, created_at, ...updateData } = tx;
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
