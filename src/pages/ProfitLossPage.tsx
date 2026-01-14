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

import { StatCard } from '@/components/StatCard';

const ProfitLossPage = () => {
  const { ledger, getTotalIncome, getTotalExpenses, getNetProfit } = useApp();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netProfit = getNetProfit();

  // Group by category
  const incomeByCategory = ledger
    .filter(e => e.type === 'credit')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseByCategory = ledger
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

  // Monthly Profit Data (Mocked from ledger if possible, otherwise trend)
  const monthlyProfitData = [
    { month: 'Aug', income: 12000, expense: 8000, profit: 4000 },
    { month: 'Sep', income: 14000, expense: 8500, profit: 5500 },
    { month: 'Oct', income: 13000, expense: 9000, profit: 4000 },
    { month: 'Nov', income: 15500, expense: 9500, profit: 6000 },
    { month: 'Dec', income: 18000, expense: 10000, profit: 8000 },
    { month: 'Jan', income: totalIncome, expense: totalExpenses, profit: netProfit },
  ];

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
      <div>
        <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Profit & Loss Command</h1>
        <p className="text-muted-foreground mt-1 text-lg">Detailed financial performance analytics</p>
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
              <BarChart data={monthlyProfitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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

