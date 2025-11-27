
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  LogOut, 
  Plus, 
  Download,
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { Transaction, User, CATEGORIES } from './types';
import { TransactionItem } from './components/TaskItem';
import { TransactionForm } from './components/TaskForm';
import { FinancialInsight } from './components/AIAssistant';
import { Auth } from './components/Auth';
import { DonutChart, BarChart, PieChart } from './components/Charts';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      if (saved) return JSON.parse(saved);
      
      // Helper to generate dates relative to today for initial mock data
      const getDate = (daysAgo: number) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
      };

      return [
        { id: '1', title: 'Salary', amount: 5000, type: 'income', category: 'Salary', date: getDate(0) },
        { id: '2', title: 'Rent', amount: 1200, type: 'expense', category: 'Rent', date: getDate(2) },
        { id: '3', title: 'Groceries', amount: 350, type: 'expense', category: 'Food', date: getDate(5) },
        { id: '4', title: 'Freelance Project', amount: 800, type: 'income', category: 'Freelance', date: getDate(8) },
        { id: '5', title: 'Utilities', amount: 150, type: 'expense', category: 'Utilities', date: getDate(12) },
        { id: '6', title: 'Dining Out', amount: 85, type: 'expense', category: 'Food', date: getDate(1) },
        { id: '7', title: 'Internet', amount: 60, type: 'expense', category: 'Utilities', date: getDate(15) },
        { id: '8', title: 'Gas', amount: 45, type: 'expense', category: 'Transport', date: getDate(4) },
        { id: '9', title: 'Bonus', amount: 1000, type: 'income', category: 'Business', date: getDate(45) }, // Older income
        { id: '10', title: 'Old Freelance', amount: 300, type: 'income', category: 'Freelance', date: getDate(55) }, // Older income
      ];
    } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'expenses'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  // --- Charts Data Preparation ---
  const expenseChartData = useMemo(() => {
      const cats: Record<string, number> = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
          cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
      return Object.entries(cats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([label, value], i) => ({ 
            label, 
            value, 
            color: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'][i % 5] 
        }));
  }, [transactions]);

  const incomeChartData = useMemo(() => {
      const cats: Record<string, number> = {};
      transactions.filter(t => t.type === 'income').forEach(t => {
          cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
      return Object.entries(cats)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], i) => ({ 
            label, 
            value, 
            color: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'][i % 5] 
        }));
  }, [transactions]);

  // Calculate Last 30 Days Expenses
  const last30DaysExpenses = useMemo(() => {
     const today = new Date();
     const data: { label: string; value: number; color: string }[] = [];
     const expensesMap = new Map<string, number>();

     // Aggregate expenses by date
     transactions.filter(t => t.type === 'expense').forEach(t => {
         expensesMap.set(t.date, (expensesMap.get(t.date) || 0) + t.amount);
     });

     // Generate data for the last 30 days
     for (let i = 29; i >= 0; i--) {
         const d = new Date();
         d.setDate(today.getDate() - i);
         const dateStr = d.toISOString().split('T')[0];
         // Label format: "MMM DD" (e.g., "Aug 24")
         const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
         
         data.push({
             label: dayLabel,
             value: expensesMap.get(dateStr) || 0,
             color: '#6366F1' // Indigo-500
         });
     }
     return data;
  }, [transactions]);

  // Calculate Last 60 Days Income
  const last60DaysIncome = useMemo(() => {
    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - 60);

    const cats: Record<string, number> = {};
    transactions
       .filter(t => t.type === 'income' && new Date(t.date) >= cutoffDate)
       .forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.amount;
       });
    
    return Object.entries(cats)
       .sort((a, b) => b[1] - a[1])
       .map(([label, value], i) => ({ 
           label, 
           value, 
           color: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'][i % 5] 
       }));
 }, [transactions]);

  // Financial Overview (Income vs Expense)
  const financialOverviewData = useMemo(() => {
    return [
      { label: 'Income', value: stats.income, color: '#10B981' }, // emerald-500
      { label: 'Expense', value: stats.expense, color: '#EF4444' }, // red-500
    ];
  }, [stats]);

  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...data, id: crypto.randomUUID() };
    setTransactions(prev => [newTx, ...prev]);
    setIsFormOpen(false);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const exportToCSV = () => {
    const filtered = activeTab === 'dashboard' ? transactions : transactions.filter(t => t.type === activeTab);
    const headers = ['Date', 'Type', 'Category', 'Title', 'Amount', 'Description'];
    const rows = filtered.map(t => [
      t.date,
      t.type,
      t.category,
      `"${t.title}"`,
      t.amount,
      `"${t.description || ''}"`
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_data_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const filteredTransactions = activeTab === 'dashboard' 
    ? transactions.slice(0, 5) 
    : transactions.filter(t => t.type === activeTab);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 md:flex md:flex-col
      `}>
        <div className="p-6 flex items-center justify-between text-indigo-600">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('income'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'income' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <TrendingUp size={20} />
            Incomes
          </button>
          <button 
            onClick={() => { setActiveTab('expenses'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'expenses' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <TrendingDown size={20} />
            Expenses
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="profile" 
                className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50" 
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 text-indigo-600">
             <Wallet size={24} />
             <span className="font-bold text-gray-900">Expense Tracker</span>
          </div>
          <div className="w-6" /> {/* Spacer for centering */}
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
               <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab} Overview</h2>
               <p className="text-gray-500 text-sm mt-1">
                 {activeTab === 'dashboard' ? 'Track your financial health' : `Manage your ${activeTab} records`}
               </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                <Plus size={16} />
                Add {activeTab === 'dashboard' ? 'Transaction' : activeTab === 'income' ? 'Income' : 'Expense'}
              </button>
            </div>
          </div>

          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                   <p className="text-sm font-medium text-gray-500 mb-1 relative z-10">Total Balance</p>
                   <h3 className="text-3xl font-bold text-gray-900 relative z-10">${stats.balance.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                   <p className="text-sm font-medium text-gray-500 mb-1 relative z-10">Total Income</p>
                   <h3 className="text-3xl font-bold text-green-600 relative z-10">+${stats.income.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                   <p className="text-sm font-medium text-gray-500 mb-1 relative z-10">Total Expenses</p>
                   <h3 className="text-3xl font-bold text-red-600 relative z-10">-${stats.expense.toLocaleString()}</h3>
                </div>
              </div>

              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                      {/* Last 30 Days Expenses */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                          <h3 className="font-semibold text-gray-900 mb-6">Last 30 Days Expenses</h3>
                          <div className="flex-1 min-h-[250px]">
                            <BarChart data={last30DaysExpenses} />
                          </div>
                      </div>

                      {/* Last 60 Days Income */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                          <h3 className="font-semibold text-gray-900 mb-6">Last 60 Days Income</h3>
                          <div className="h-[250px]">
                            <PieChart data={last60DaysIncome} />
                          </div>
                      </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Financial Overview (Income vs Expense) */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                        <h3 className="font-semibold text-gray-900 mb-6">Financial Overview</h3>
                        <div className="h-[250px]">
                            <PieChart data={financialOverviewData} />
                        </div>
                    </div>

                    {/* AI Insight */}
                    <FinancialInsight transactions={transactions} />
                    
                    {/* Expense Breakdown */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
                        <div className="h-[250px]">
                           <DonutChart data={expenseChartData} />
                        </div>
                    </div>
                  </div>
              </div>
            </div>
          )}

          {/* INCOME / EXPENSE VIEWS */}
          {activeTab !== 'dashboard' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 {/* Chart Card */}
                 <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-6 text-center">{activeTab === 'income' ? 'Income Sources' : 'Expense Categories'}</h3>
                    <div className="h-[300px]">
                      <DonutChart data={activeTab === 'income' ? incomeChartData : expenseChartData} />
                    </div>
                 </div>

                 {/* Stats Summary */}
                 <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className={`p-4 rounded-full mb-4 ${activeTab === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {activeTab === 'income' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-1">
                        ${(activeTab === 'income' ? stats.income : stats.expense).toLocaleString()}
                    </h2>
                    <p className="text-gray-500">Total {activeTab} this period</p>
                 </div>
             </div>
          )}

          {/* Transaction List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">
                    {activeTab === 'dashboard' ? 'Recent Transactions' : `All ${activeTab} Records`}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {filteredTransactions.length} records
                </span>
             </div>
             
             <div className="p-4 space-y-3">
               {filteredTransactions.length === 0 ? (
                 <div className="text-center py-12 text-gray-400">
                    No transactions found. <br/> Click "Add Transaction" to get started.
                 </div>
               ) : (
                 filteredTransactions.map(tx => (
                   <TransactionItem 
                     key={tx.id} 
                     transaction={tx} 
                     onDelete={deleteTransaction} 
                   />
                 ))
               )}
             </div>
          </div>

        </div>
      </main>

      <TransactionForm 
        isOpen={isFormOpen} 
        onCancel={() => setIsFormOpen(false)} 
        onSubmit={addTransaction}
        defaultType={activeTab === 'income' ? 'income' : 'expense'} 
      />
    </div>
  );
}

export default App;
