import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Users, DollarSign, TrendingUp, Calendar, ShoppingCart, 
  Award, Wallet, BarChart3, Activity, AlertTriangle, TrendingDown, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

const Dashboard = () => {
  const { 
    getActiveMembers, getTodayIncome, getNetProfit, getTotalIncome, 
    getTotalExpenses, members, sales, ledger, inventory, classes, attendance, pettyCash
  } = useApp();

  const activeMembers = getActiveMembers();
  const todayIncome = getTodayIncome();
  const netProfit = getNetProfit();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();

  // Calculate expiring soon (within 7 days)
  const today = new Date();
  const expiringSoon = members.filter(m => {
    const expiry = new Date(m.expiryDate);
    const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && m.status === 'active';
  });

  // Low stock items
  const lowStockItems = inventory.filter(i => i.stock <= i.minStock);

    // Stats cards data
    const statsCards = [
      { 
        title: 'Active Members', 
        value: activeMembers.length, 
        icon: Users, 
        color: 'blue',
        change: '+12%',
        positive: true 
      },
      { 
        title: "Today's Income", 
        value: `AED ${todayIncome.toLocaleString()}`, 
        icon: DollarSign, 
        change: "+12.5%", 
        positive: true,
        color: "green"
      },
      { 
        title: "Net Profit", 
        value: `AED ${netProfit.toLocaleString()}`, 
        icon: TrendingUp, 
        color: netProfit >= 0 ? 'gold' : 'red',
        change: netProfit >= 0 ? '+15%' : '-5%',
        positive: netProfit >= 0 
      },
      { 
        title: 'Classes Today', 
        value: classes.filter(c => c.dayOfWeek === today.getDay()).length, 
        icon: Calendar, 
        color: 'blue',
        change: 'On Schedule',
        positive: true 
      },
    ];

  // Generate income/expense chart data (last 7 days)
  const last7DaysData = [...Array(7)].map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const income = ledger
      .filter(e => e.date === dateStr && e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const expense = ledger
      .filter(e => e.date === dateStr && e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);

    const attendanceCount = attendance.filter(a => a.date === dateStr).length;
    
    const pettyCashTotal = pettyCash
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const netProfit = income - expense - pettyCashTotal;
      
      return { day: dayName, income, expense, attendance: attendanceCount, pettyCash: pettyCashTotal, profit: netProfit };
    });

    // Cumulative Profit Data
    let cumulativeProfit = 0;
    const cumulativeProfitData = last7DaysData.map(d => {
      cumulativeProfit += d.profit;
      return { day: d.day, cumulative: cumulativeProfit };
    });

    // Expense breakdown for pie chart
    const expenseCategories = ledger
      .filter(e => e.type === 'debit')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

    const expensePieData = Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));
    const EXPENSE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];

    // Income breakdown for pie chart
    const incomeCategories = ledger
      .filter(e => e.type === 'credit')
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>);

    const incomePieData = Object.entries(incomeCategories).map(([name, value]) => ({ name, value }));
    const INCOME_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'];


  // Belt distribution
  const beltDistribution = [
    { belt: 'White', count: members.filter(m => m.belt === 'white').length, color: '#f1f5f9' },
    { belt: 'Yellow', count: members.filter(m => m.belt === 'yellow').length, color: '#facc15' },
    { belt: 'Orange', count: members.filter(m => m.belt === 'orange').length, color: '#f97316' },
    { belt: 'Green', count: members.filter(m => m.belt === 'green').length, color: '#22c55e' },
      { belt: 'Blue', count: members.filter(m => m.belt === 'blue').length, color: '#3b82f6' },
      { belt: 'Purple', count: members.filter(m => m.belt === 'purple').length, color: '#eab308' },
      { belt: 'Brown', count: members.filter(m => m.belt === 'brown').length, color: '#92400e' },
    { belt: 'Red', count: members.filter(m => m.belt === 'red').length, color: '#ef4444' },
    { belt: 'Black', count: members.filter(m => m.belt === 'black').length, color: '#1f2937' },
  ].filter(b => b.count > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'stat-card-blue text-secondary neon-text-blue';
      case 'green': return 'stat-card-green text-success neon-text-green';
      case 'red': return 'stat-card-red text-dojo-red neon-text-red';
      case 'gold': return 'stat-card-gold text-neon-gold neon-text-gold';
      case 'orange': return 'stat-card-orange text-neon-orange neon-text-orange';
      default: return 'text-primary';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold gradient-text-vibrant tracking-tighter">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Welcome back, Sensei. Here's your dojo's vibrant pulse.</p>
          </div>
          <div 
            onClick={() => {
              const activeCount = attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
              toast.info(`Dojo Status: ${activeCount} active participants currently checked in.`);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary text-white font-bold shadow-[0_0_20px_rgba(var(--primary),0.4)] flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-5 h-5" />
            LIVE STATUS
          </div>
        </div>


      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`stat-card ${getColorClasses(stat.color).split(' ')[0]}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-display font-bold mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.positive ? 'text-neon-green' : 'text-dojo-red'}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5`}>
                <stat.icon className={`w-6 h-6 ${getColorClasses(stat.color).split(' ')[1]}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

        {/* Charts Row 1 */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Chart */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-display font-semibold">Revenue Overview</h3>
            </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last7DaysData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(var(--primary), 0.2)',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="hsl(var(--success))" 
                      fill="url(#incomeGradient)" 
                      strokeWidth={4}
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#expenseGradient)" 
                      strokeWidth={4}
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
  
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neon-green" />
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-dojo-red" />
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
            </div>
          </motion.div>
  
          {/* Belt Distribution */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-neon-gold" />
              <h3 className="text-lg font-display font-semibold">Belt Distribution</h3>
            </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={beltDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      animationBegin={0}
                      animationDuration={2000}
                    >
                      {beltDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="rgba(255,255,255,0.2)" 
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(var(--primary), 0.2)',
                        borderRadius: '16px',
                      }} 
                      formatter={(value: number, name: string, props: any) => [
                        `${value} members`,
                        props.payload.belt
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
  
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {beltDistribution.slice(0, 5).map(belt => (
                <div key={belt.belt} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: belt.color }} />
                  <span className="text-xs text-muted-foreground">{belt.belt}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Row 2: Advanced Financials */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income Breakdown */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="text-lg font-display font-semibold">Income Sources</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="w-5 h-5 text-dojo-red" />
              <h3 className="text-lg font-display font-semibold">Expense Categories</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cumulative Profit */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-neon-gold" />
              <h3 className="text-lg font-display font-semibold">Net Profit Growth</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeProfitData}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Area type="monotone" dataKey="cumulative" stroke="#eab308" fill="url(#profitGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Row 3 */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-display font-semibold">Attendance Trend (7d)</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(var(--primary), 0.2)',
                      borderRadius: '16px',
                    }} 
                  />
                  <Bar 
                    dataKey="attendance" 
                    fill="hsl(var(--secondary))" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Petty Cash Usage */}
          <motion.div variants={itemVariants} className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="w-5 h-5 text-neon-orange" />
              <h3 className="text-lg font-display font-semibold">Petty Cash Trends</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(var(--primary), 0.2)',
                      borderRadius: '16px',
                    }} 
                  />
                  <Bar 
                    dataKey="pettyCash" 
                    fill="hsl(var(--neon-orange))" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={2000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

      {/* Bottom Row - Alerts & Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring Memberships */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-neon-gold" />
            <h3 className="text-lg font-display font-semibold">Expiring Soon</h3>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-cyber">
            {expiringSoon.length > 0 ? (
              expiringSoon.map(member => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20"
                >
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">Expires: {member.expiryDate}</p>
                  </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider",
                      "belt-" + member.belt.toLowerCase().replace(/\//g, '-')
                    )}>
                      {member.belt}
                    </span>
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No memberships expiring soon 🎉</p>
            )}
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-dojo-red" />
            <h3 className="text-lg font-display font-semibold">Low Stock Alert</h3>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-cyber">
            {lowStockItems.length > 0 ? (
              lowStockItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                  </div>
                  <span className="text-sm font-bold text-dojo-red">{item.stock} left</span>
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">All items well stocked ✓</p>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold">Recent Sales</h3>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-cyber">
            {sales.slice(0, 5).map(sale => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium text-sm">
                    {sale.items.map(i => i.name).join(', ').slice(0, 25)}...
                  </p>
                  <p className="text-xs text-muted-foreground">{sale.date}</p>
                </div>
                  <span className="text-sm font-bold text-neon-green">AED {sale.total}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
