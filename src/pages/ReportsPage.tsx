import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Users, TrendingUp, ShoppingBag, 
  Calendar, Award, ArrowUpRight, 
  Download, Filter, Share2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReportsPage = () => {
  const { members, sales, gradings, attendance } = useApp();

  // Mock data for charts
  const memberGrowthData = [
    { name: 'Aug', members: 45 },
    { name: 'Sep', members: 52 },
    { name: 'Oct', members: 61 },
    { name: 'Nov', members: 68 },
    { name: 'Dec', members: 85 },
    { name: 'Jan', members: members.length },
  ];

  const revenueData = [
    { name: 'Mon', amount: 1200 },
    { name: 'Tue', amount: 1800 },
    { name: 'Wed', amount: 1400 },
    { name: 'Thu', amount: 2200 },
    { name: 'Fri', amount: 1900 },
    { name: 'Sat', amount: 2800 },
    { name: 'Sun', amount: 1500 },
  ];

  const beltDistribution = [
    { name: 'White', value: members.filter(m => m.belt === 'white').length },
    { name: 'Yellow', value: members.filter(m => m.belt === 'yellow').length },
    { name: 'Orange', value: members.filter(m => m.belt === 'orange').length },
    { name: 'Green+', value: members.filter(m => !['white', 'yellow', 'orange'].includes(m.belt)).length },
  ];

  const COLORS = ['#6366f1', '#eab308', '#f97316', '#22c55e', '#ef4444'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleExportCSV = () => {
    const headers = ['Report Metric', 'Current Value', 'Growth/Trend'];
    const data = [
      ['Retention Rate', '94%', '+2.4%'],
      ['Avg. Attendance', '18.5', '+1.2%'],
      ['Conversion', '12.8%', '+0.5%'],
      ['Retail Sales', sales.reduce((s, a) => s + a.total, 0).toString(), '+18%'],
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dojo-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SAQR Dojo Performance Report',
        text: 'Check out our latest performance metrics!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard');
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into your Dojo's performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="glass-button" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button className="btn-cyber" onClick={handleShareReport}>
            <Share2 className="w-4 h-4 mr-2" /> Share Report
          </Button>
        </div>
      </motion.div>

      {/* High-level Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'Retention Rate', value: '94%', icon: Users, color: 'text-emerald-500', trend: '+2.4%' },
            { label: 'Avg. Attendance', value: '18.5', icon: Calendar, color: 'text-blue-500', trend: '+1.2%' },
            { label: 'Conversion', value: '12.8%', icon: TrendingUp, color: 'text-primary', trend: '+0.5%' },
            { label: 'Retail Sales', value: `AED ${sales.reduce((s, a) => s + a.total, 0).toLocaleString()}`, icon: ShoppingBag, color: 'text-amber-500', trend: '+18%' },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-lg font-display">Member Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memberGrowthData}>
                    <defs>
                      <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="members" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Revenue */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-lg font-display">Weekly Revenue Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Belt Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-lg font-display">Belt Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-around gap-4">
              <div className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={beltDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {beltDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {beltDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{Math.round((item.value / members.length) * 100)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Gradings Summary */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Recent Gradings</CardTitle>
              <Award className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gradings.slice(0, 5).map((g, i) => {
                  const member = members.find(m => m.id === g.memberId);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {member?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member?.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(g.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">{g.fromBelt}</span>
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase text-primary">{g.toBelt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;
