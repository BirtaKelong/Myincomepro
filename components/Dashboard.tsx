
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction, CategoryDefinition } from '../types';
import { getCategoryColor } from '../constants';
import { geminiService } from '../services/geminiService';

interface DashboardProps {
  transactions: Transaction[];
  customCategories: CategoryDefinition[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, customCategories }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach((t) => {
      const txDate = new Date(t.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;

      if (t.type === 'income') {
        totalIncome += t.amount;
        if (isCurrentMonth) monthlyIncome += t.amount;
      } else {
        totalExpense += t.amount;
        if (isCurrentMonth) monthlyExpense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    return {
      balance: totalIncome - totalExpense,
      monthlyIncome,
      monthlyExpense,
      categoryTotals,
      totalIncome,
      totalExpense
    };
  }, [transactions]);

  const pieData = Object.entries(stats.categoryTotals).map(([name, value]) => ({
    name,
    value: value as number
  })).sort((a, b) => (b.value as number) - (a.value as number));

  const barData = useMemo(() => {
    const monthlyData: Record<string, { month: string; income: number; expense: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const lastSix = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (i as number));
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    }).reverse();

    lastSix.forEach(m => monthlyData[m] = { month: m, income: 0, expense: 0 });

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyData[key]) {
        if (t.type === 'income') monthlyData[key].income += t.amount;
        else monthlyData[key].expense += t.amount;
      }
    });

    return Object.values(monthlyData);
  }, [transactions]);

  const handleGetInsight = async () => {
    if (transactions.length === 0) return;
    setIsLoadingInsight(true);
    const insight = await geminiService.analyzeFinances(transactions);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-slate-500 text-sm font-medium">Total Balance</span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-slate-900">₹{stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <div className="flex items-center mt-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full ${stats.balance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {stats.balance >= 0 ? 'Surplus' : 'Deficit'}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-sm font-medium">Monthly Income</span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-emerald-600">+₹{stats.monthlyIncome.toLocaleString()}</span>
            <p className="text-slate-400 text-xs mt-1">This current month</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-slate-500 text-sm font-medium">Monthly Expenses</span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-rose-600">-₹{stats.monthlyExpense.toLocaleString()}</span>
            <p className="text-slate-400 text-xs mt-1">This current month</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Income vs Expense</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Expense Categories</h3>
          <div className="h-64 flex flex-col md:flex-row items-center">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name, customCategories)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 overflow-y-auto max-h-full flex flex-col gap-2 py-4">
              {pieData.slice(0, 5).map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(entry.name, customCategories) }}></div>
                    <span className="text-slate-600">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">₹{entry.value.toLocaleString()}</span>
                </div>
              ))}
              {pieData.length === 0 && (
                <p className="text-slate-400 text-center text-sm italic">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM15.657 14.243a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0z"></path></svg>
              Gemini Financial Advisor
            </h3>
            <p className="text-slate-300">Get personalized AI-powered insights into your spending habits and financial goals.</p>
          </div>
          <button 
            onClick={handleGetInsight}
            disabled={isLoadingInsight || transactions.length === 0}
            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-50"
          >
            {isLoadingInsight ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : 'Get AI Analysis'}
          </button>
        </div>

        {aiInsight && (
          <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10 prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">
              {aiInsight}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
