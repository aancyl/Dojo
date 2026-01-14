import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Plus, Search, Download, 
  ArrowUpCircle, Calendar, MoreVertical, FileText,
  TrendingUp, PieChart as PieIcon, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/StatCard';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { format, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { toast } from 'sonner';

const IncomePage = () => {
  const { sales, members, plans, ledger, addLedgerEntry, branches } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: 'sales',
    branchId: branches[0]?.id || 'branch-1'
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...incomeEntries.map(e => [
        e.date,
        `"${e.description.replace(/"/g, '""')}"`,
        e.category,
        e.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.body.appendChild(document.createElement('a'));
    link.href = URL.createObjectURL(blob);
    link.download = `income-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    document.body.removeChild(link);
    toast.success('Income data exported');
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    addLedgerEntry({
      date: formData.date,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      type: 'credit',
      branchId: formData.branchId,
      reference: `MANUAL-INC-${Date.now()}`
    });

    toast.success('Income recorded successfully');
    setIsAddDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: 'sales',
      branchId: branches[0]?.id || 'branch-1'
    });
  };

  const incomeEntries = useMemo(() => {
    const posIncome = sales.map(sale => ({
      id: sale.id,
      date: sale.date,
      description: `POS Sale: ${sale.items.map(i => i.name).join(', ')}`,
      category: 'Sales',
      amount: sale.total,
    }));

    const membershipIncome = members
      .filter(m => m.status === 'active')
      .map(m => {
        const plan = plans.find(p => p.id === m.planId);
        return {
          id: `mem-${m.id}`,
          date: m.joinDate,
          description: `Membership: ${m.name} (${plan?.name || 'Standard'})`,
          category: 'Membership',
          amount: plan?.price || 0,
        };
      });

    // Add other income from ledger that isn't already covered
    const ledgerIncome = ledger
      .filter(e => e.type === 'credit' && e.category !== 'sales' && e.category !== 'membership')
      .map(e => ({
        id: e.id,
        date: e.date,
        description: e.description,
        category: e.category,
        amount: e.amount,
      }));

    return [...posIncome, ...membershipIncome, ...ledgerIncome]
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const isInRange = isWithinInterval(entryDate, { 
          start: dateRange.start, 
          end: dateRange.end 
        });
        
        const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               entry.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        return isInRange && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, members, plans, ledger, searchTerm, dateRange]);

  const totalIncome = useMemo(() => 
    incomeEntries.reduce((sum, e) => sum + e.amount, 0), 
  [incomeEntries]);

  // Chart Data: Dynamic Trend
  const trendData = useMemo(() => {
    const daysCount = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysCount <= 31) {
      // Show daily data
      const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      return days.map(day => {
        const amount = incomeEntries
          .filter(e => isSameDay(new Date(e.date), day))
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          label: format(day, 'MMM d'),
          amount
        };
      });
    } else {
      // Show monthly data
      const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
      return months.map(month => {
        const amount = incomeEntries
          .filter(e => isSameMonth(new Date(e.date), month))
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          label: format(month, 'MMM yyyy'),
          amount
        };
      });
    }
  }, [incomeEntries, dateRange]);

  // Chart Data: Distribution
  const distributionData = useMemo(() => {
    const categories = incomeEntries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [incomeEntries]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];

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
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary uppercase tracking-wider">Income Command</h1>
            <p className="text-muted-foreground mt-1 text-lg">Revenue streams and membership fees</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangeFilter onRangeChange={setDateRange} />
            <Button variant="outline" className="glass-button" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>

            <DialogTrigger asChild>
              <Button className="btn-cyber">
                <Plus className="w-4 h-4 mr-2" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-display font-bold">Record Manual Income</DialogTitle>
                <DialogDescription>Add income that wasn't processed through POS or Membership systems.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddIncome} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</Label>
                    <Input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount (AED)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-slate-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
                  <Input
                    required
                    placeholder="e.g. Personal Training Session"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="membership">Membership</SelectItem>
                      <SelectItem value="other">Other Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-6 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="btn-cyber min-w-[140px]">
                    Confirm Income
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`AED ${totalIncome.toLocaleString()}`}
          icon={ArrowUpCircle}
          variant="green"
          trend="+12% from last month"
        />
        <StatCard 
          title="Membership Fees" 
          value={`AED ${incomeEntries.filter(e => e.category === 'Membership').reduce((s, e) => s + e.amount, 0).toLocaleString()}`}
          icon={FileText}
          variant="blue"
        />
        <StatCard 
          title="Product Sales" 
          value={`AED ${incomeEntries.filter(e => e.category === 'Sales').reduce((s, e) => s + e.amount, 0).toLocaleString()}`}
          icon={Search}
          variant="gold"
        />
      </motion.div>

      {/* Visualizations */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-neon-green" />
            <h3 className="text-lg font-display font-semibold uppercase">Revenue Trend</h3>
          </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#22c55e' }}
                  />
                  <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold uppercase">Income Distribution</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search income..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden md:block glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-cyber">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[120px] whitespace-nowrap uppercase text-xs font-bold">Date</TableHead>
                  <TableHead className="whitespace-nowrap uppercase text-xs font-bold">Description</TableHead>
                  <TableHead className="whitespace-nowrap uppercase text-xs font-bold">Category</TableHead>
                  <TableHead className="text-right whitespace-nowrap uppercase text-xs font-bold">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium min-w-[200px]">{entry.description}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className="capitalize font-sans border-primary/20 text-primary">{entry.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-500 whitespace-nowrap">
                      +AED {entry.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {incomeEntries.map((entry) => (
            <motion.div
              key={entry.id}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-4 space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                  <h3 className="font-bold text-sm leading-tight pr-8">{entry.description}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <Badge variant="outline" className="text-[10px] uppercase font-sans border-primary/20 text-primary">
                    {entry.category}
                  </Badge>
                  <p className="font-bold text-lg text-emerald-500">
                    +AED {entry.amount.toFixed(2)}
                  </p>
                </div>
            </motion.div>
          ))}
        </div>

        {incomeEntries.length === 0 && (
          <div className="glass-card h-32 flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="w-8 h-8 opacity-20 mb-2" />
            <p>No income records found</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default IncomePage;
