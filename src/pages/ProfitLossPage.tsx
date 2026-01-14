import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Receipt, 
  Building, Users, ShoppingBag, Megaphone, Zap, PieChart as PieIcon, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { format, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';

import { StatCard } from '@/components/StatCard';

const ProfitLossPage = () => {
  const { ledger, sales, members, plans } = useApp();
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  // Calculate filtered income and expenses for the range
  const financialData = useMemo(() => {
    const posIncome = sales.map(sale => ({
      date: sale.date,
      description: `POS Sale: ${sale.items.map(i => i.name).join(', ')}`,
      category: 'Sales',
      amount: sale.total,
      type: 'credit'
    }));

    const membershipIncome = members
      .filter(m => m.status === 'active')
      .map(m => {
        const plan = plans.find(p => p.id === m.planId);
        return {
          date: m.joinDate,
          description: `Membership: ${m.name} (${plan?.name || 'Standard'})`,
          category: 'Membership',
          amount: plan?.price || 0,
          type: 'credit'
        };
      });

    const ledgerEntries = ledger.map(e => ({
      date: e.date,
      description: e.description,
      category: e.category,
      amount: e.amount,
      type: e.type
    }));

    const allEntries = [...posIncome, ...membershipIncome, ...ledgerEntries]
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return isWithinInterval(entryDate, { 
          start: dateRange.start, 
          end: dateRange.end 
        });
      });

    const income = allEntries
      .filter(e => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    const expenses = allEntries
      .filter(e => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      entries: allEntries,
      income,
      expenses,
      profit: income - expenses
    };
  }, [sales, members, plans, ledger, dateRange]);

  const totalIncome = financialData.income;
  const totalExpenses = financialData.expenses;
  const netProfit = financialData.profit;

  // Group by category for the selected range
  const incomeByCategory = financialData.entries
    .filter(e => e.type === 'credit')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseByCategory = financialData.entries
    .filter(e => e.type === 'debit')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomePieData = Object.entries(incomeByCategory).map(([name, value]) => ({ name, value }));
  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const waterfallData = [
    { name: 'Sales', value: incomeByCategory.sales || 0, type: 'income' },
    { name: 'Memberships', value: incomeByCategory.membership || 0, type: 'income' },
    { name: 'Rent', value: -(expenseByCategory.rent || 0), type: 'expense' },
    { name: 'Salaries', value: -(expenseByCategory.salary || 0), type: 'expense' },
    { name: 'Utilities', value: -(expenseByCategory.utilities || 0), type: 'expense' },
    { name: 'Equipment', value: -(expenseByCategory.equipment || 0), type: 'expense' },
    { name: 'Marketing', value: -(expenseByCategory.marketing || 0), type: 'expense' },
    { name: 'Net Profit', value: netProfit, type: netProfit >= 0 ? 'profit' : 'loss' },
  ];

  // Chart Data: Dynamic Trend
  const trendData = useMemo(() => {
    const daysCount = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysCount <= 31) {
      // Show daily data
      const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      return days.map(day => {
        const income = financialData.entries
          .filter(e => e.type === 'credit' && isSameDay(new Date(e.date), day))
          .reduce((sum, e) => sum + e.amount, 0);
        const expense = financialData.entries
          .filter(e => e.type === 'debit' && isSameDay(new Date(e.date), day))
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          label: format(day, 'MMM d'),
          income,
          expense,
          profit: income - expense
        };
      });
    } else {
      // Show monthly data
      const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
      return months.map(month => {
        const income = financialData.entries
          .filter(e => e.type === 'credit' && isSameMonth(new Date(e.date), month))
          .reduce((sum, e) => sum + e.amount, 0);
        const expense = financialData.entries
          .filter(e => e.type === 'debit' && isSameMonth(new Date(e.date), month))
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          label: format(month, 'MMM yyyy'),
          income,
          expense,
          profit: income - expense
        };
      });
    }
  }, [financialData, dateRange]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Profit & Loss Command</h1>
          <p className="text-muted-foreground mt-1 text-lg">Detailed financial performance analytics</p>
        </div>
        <DateRangeFilter onRangeChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Income" 
          value={`AED ${totalIncome.toLocaleString()}`}
          icon={TrendingUp}
          variant="green"
        />
        <StatCard 
          title="Total Expenses" 
          value={`AED ${totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          variant="red"
        />
        <StatCard 
          title="Net Profit" 
          value={`AED ${netProfit.toLocaleString()}`}
          icon={DollarSign}
          variant={netProfit >= 0 ? "gold" : "red"}
        />
      </div>

      {/* Primary Financial Visualization */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold uppercase">Profit Waterfall</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={entry.type === 'income' ? '#22c55e' : entry.type === 'expense' ? '#ef4444' : entry.value >= 0 ? '#eab308' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-neon-green" />
            <h3 className="text-lg font-display font-semibold uppercase">Monthly Profit Trend</h3>
          </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

        </div>
      </motion.div>

      {/* Distribution Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-success" />
            <h3 className="text-lg font-display font-semibold uppercase">Income Distribution</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-dojo-red" />
            <h3 className="text-lg font-display font-semibold uppercase">Expense Distribution</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfitLossPage;

