
import React, { useState, useEffect } from 'react';
import { User, Transaction, CategoryDefinition, TransactionType } from './types';
import { storageService } from './services/storageService';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import CategoryManager from './components/CategoryManager';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<CategoryDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'categories'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Auth States
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  const FULL_SQL_SCRIPT = `-- Copy and run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(15, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    UNIQUE(user_id, name)
);
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    UNIQUE(user_id, category_name)
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can manage their own budgets" ON public.budgets;
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);`;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await storageService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await initUserData(currentUser.id);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const initUserData = async (userId: string) => {
    try {
      const [txData, catData] = await Promise.all([
        storageService.getTransactions(userId),
        storageService.getCustomCategories(userId)
      ]);
      setTransactions(txData);
      setCustomCategories(catData);
      setDbError(null);
    } catch (err: any) {
      if (err.message?.includes('schema cache') || err.message?.includes('relation') || err.message?.includes('not found')) {
        setDbError('DATABASE_SETUP_REQUIRED');
      } else {
        console.error("Data fetch error", err);
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      let loggedUser;
      if (isSignUp) {
        loggedUser = await storageService.signUp(authEmail, authPassword);
      } else {
        loggedUser = await storageService.signIn(authEmail, authPassword);
      }
      setUser(loggedUser);
      await initUserData(loggedUser.id);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await storageService.signOut();
    setUser(null);
    setTransactions([]);
    setCustomCategories([]);
    setDbError(null);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-white">
        <div className="flex-1 bg-slate-900 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mb-32 -mr-32 blur-3xl"></div>
          <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-bold mb-6 tracking-tight">Financial freedom starts with clarity.</h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Track every dollar, analyze spending trends, and receive AI-powered guidance to help you reach your goals faster.
            </p>
            <div className="flex gap-8">
              <div>
                <span className="block text-2xl font-bold">Cloud</span>
                <span className="text-slate-500 text-sm uppercase font-semibold">Supabase Sync</span>
              </div>
              <div>
                <span className="block text-2xl font-bold">AI</span>
                <span className="text-slate-500 text-sm uppercase font-semibold">Native Insights</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-12 flex flex-col justify-center max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-slate-500 mt-2">Manage your wealth with FinancePulse AI</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authError && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm">
                {authError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg mt-4 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (isSignUp ? 'Sign Up' : 'Log In')}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-900 font-bold hover:underline"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (dbError === 'DATABASE_SETUP_REQUIRED') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-rose-600 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Database Setup Required</h2>
            <p className="text-rose-100 opacity-90">Tables are missing in your Supabase project. Please follow the steps below to initialize your database.</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
                Open Supabase SQL Editor
              </h3>
              <p className="text-sm text-slate-500 pl-8">
                Go to your Supabase dashboard and click on the **SQL Editor** in the sidebar.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
                Paste and Run this SQL
              </h3>
              <p className="text-sm text-slate-500 pl-8 mb-2">
                Copy the entire script below, paste it into a new query, and click **Run**.
              </p>
              <div className="relative group pl-8">
                <pre className="text-[10px] bg-slate-900 text-indigo-300 p-4 rounded-xl overflow-x-auto whitespace-pre font-mono leading-relaxed max-h-60">
                  {FULL_SQL_SCRIPT}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(FULL_SQL_SCRIPT);
                    alert('SQL copied to clipboard!');
                  }}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white text-[10px] px-2 py-1 rounded border border-white/20 transition-all"
                >
                  Copy Script
                </button>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                I've Run the SQL, Refresh App
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-slate-500 text-sm font-medium hover:text-slate-900"
              >
                Logout and Try Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-64">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-40">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <span className="font-bold text-xl tracking-tight">FinancePulse</span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'transactions' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'categories' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01M19 7h.01M19 11h.01M19 15h.01M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2-2v10a2 2 0 002 2z"></path></svg>
              Categories
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
              <p className="text-xs text-slate-400">Cloud Account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Log Out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/50">
        <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab}</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Transaction
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' ? (
          <Dashboard transactions={transactions} customCategories={customCategories} />
        ) : activeTab === 'transactions' ? (
          <TransactionList 
            transactions={transactions} 
            customCategories={customCategories}
            onEdit={(tx) => { setEditingTransaction(tx); setIsFormOpen(true); }}
            onDelete={(id) => { storageService.deleteTransaction(id).then(() => initUserData(user.id)) }}
          />
        ) : (
          <CategoryManager 
            customCategories={customCategories}
            onAdd={(n, t, c) => { storageService.addCustomCategory(user.id, {name: n, type: t, color: c}).then(() => initUserData(user.id)) }}
            onDelete={(id) => { storageService.deleteCustomCategory(id).then(() => initUserData(user.id)) }}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around md:hidden z-40">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          <span className="text-[10px] font-bold">Dash</span>
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center gap-1 ${activeTab === 'transactions' ? 'text-slate-900' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <span className="text-[10px] font-bold">Logs</span>
        </button>
        <button onClick={() => setIsFormOpen(true)} className="flex flex-col items-center gap-1 text-slate-400">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center -mt-6 shadow-xl border-4 border-slate-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </div>
          <span className="text-[10px] font-bold">Add</span>
        </button>
        <button onClick={() => setActiveTab('categories')} className={`flex flex-col items-center gap-1 ${activeTab === 'categories' ? 'text-slate-900' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01M19 7h.01M19 11h.01M19 15h.01M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <span className="text-[10px] font-bold">Cats</span>
        </button>
      </nav>

      {isFormOpen && (
        <TransactionForm 
          onSave={(data) => {
            const saveOp = data.id ? storageService.updateTransaction(data) : storageService.addTransaction(user.id, data);
            saveOp.then(() => {
              initUserData(user.id);
              setIsFormOpen(false);
              setEditingTransaction(null);
            });
          }}
          onCancel={() => { setIsFormOpen(false); setEditingTransaction(null); }}
          initialData={editingTransaction}
          customCategories={customCategories}
        />
      )}
    </div>
  );
};

export default App;
