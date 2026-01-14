import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Plus, Search, Download, 
  ArrowDownCircle, Calendar, MoreVertical, FileText, ShoppingBag, Landmark,
  TrendingDown, PieChart as PieIcon, X
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
import { toast } from 'sonner';

const ExpensePage = () => {
  const { pettyCash, ledger, addLedgerEntry, branches } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: 'other',
    branchId: branches[0]?.id || 'branch-1'
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Source'];
    const csvContent = [
      headers.join(','),
      ...expenseEntries.map(e => [
        e.date,
        `"${e.description.replace(/"/g, '""')}"`,
        e.category,
        e.amount,
        e.source
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.body.appendChild(document.createElement('a'));
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    document.body.removeChild(link);
    toast.success('Expense data exported');
  };

  const handleAddExpense = (e: React.FormEvent) => {
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
      type: 'debit',
      branchId: formData.branchId,
      reference: `MANUAL-EXP-${Date.now()}`
    });

    toast.success('Expense recorded successfully');
    setIsAddDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: 'other',
      branchId: branches[0]?.id || 'branch-1'
    });
  };

  const expenseEntries = useMemo(() => {
    const pettyCashExpenses = pettyCash.map(expense => ({
      id: expense.id,
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      source: 'Petty Cash'
    }));

    const ledgerExpenses = ledger
      .filter(entry => entry.type === 'debit')
      .map(entry => ({
        id: entry.id,
        date: entry.date,
        description: entry.description,
        category: entry.category,
        amount: entry.amount,
        source: 'Ledger'
      }));

    return [...pettyCashExpenses, ...ledgerExpenses]
      .filter(entry => {
        return entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               entry.category.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [pettyCash, ledger, searchTerm]);

  const totalExpense = useMemo(() => 
    expenseEntries.reduce((sum, e) => sum + e.amount, 0), 
  [expenseEntries]);

  // Chart Data: Monthly Trend
  const monthlyTrendData = useMemo(() => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    // Mocking historical data for trend
    return [
      { month: 'Aug', amount: 7500 },
      { month: 'Sep', amount: 8200 },
      { month: 'Oct', amount: 8000 },
      { month: 'Nov', amount: 9100 },
      { month: 'Dec', amount: 10500 },
      { month: 'Jan', amount: totalExpense },
    ];
  }, [totalExpense]);

  // Chart Data: Distribution
  const distributionData = useMemo(() => {
    const categories = expenseEntries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenseEntries]);

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#8b5cf6', '#ec4899'];

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
          <h1 className="text-3xl font-display font-bold text-dojo-red uppercase tracking-wider">Expense Command</h1>
          <p className="text-muted-foreground mt-1 text-lg">Operational costs and petty cash tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="glass-button" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-cyber bg-dojo-red hover:bg-dojo-red/90 border-red-500/50">
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-display font-bold">Record Manual Expense</DialogTitle>
                <DialogDescription>Add an expense that wasn't processed via Petty Cash or Ledger.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
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
                    placeholder="e.g. Office Equipment Repair"
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
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="other">Other Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-6 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="btn-cyber bg-dojo-red min-w-[140px]">
                    Confirm Expense
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Expenses" 
          value={`AED ${totalExpense.toLocaleString()}`}
          icon={ArrowDownCircle}
          variant="red"
          trend="-5% from last month"
        />
        <StatCard 
          title="Petty Cash Spent" 
          value={`AED ${pettyCash.reduce((s, e) => s + e.amount, 0).toLocaleString()}`}
          icon={ShoppingBag}
          variant="blue"
        />
        <StatCard 
          title="Operational Costs" 
          value={`AED ${ledger.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0).toLocaleString()}`}
          icon={Landmark}
          variant="gold"
        />
      </motion.div>

      {/* Visualizations */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-5 h-5 text-dojo-red" />
            <h3 className="text-lg font-display font-semibold uppercase">Expense Trend</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold uppercase">Expense Distribution</h3>
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
            placeholder="Search expenses..." 
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
                {expenseEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium min-w-[200px]">{entry.description}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="capitalize font-mono border-rose-500/20 text-rose-500 w-fit">{entry.category}</Badge>
                        <span className="text-[10px] text-muted-foreground uppercase px-1">{entry.source}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-500 whitespace-nowrap">
                      -AED {entry.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-dojo-red">
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
          {expenseEntries.map((entry) => (
            <motion.div
              key={entry.id}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-4 space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
              
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
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono border-rose-500/20 text-rose-500 w-fit">
                    {entry.category}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground uppercase">{entry.source}</span>
                </div>
                <p className="font-bold text-lg text-rose-500">
                  -AED {entry.amount.toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {expenseEntries.length === 0 && (
          <div className="glass-card h-32 flex flex-col items-center justify-center text-muted-foreground">
            <TrendingDown className="w-8 h-8 opacity-20 mb-2" />
            <p>No expense records found</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ExpensePage;
