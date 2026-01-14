import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Plus, Search, Filter, Download, 
  ArrowUpCircle, ArrowDownCircle, Wallet, 
  Receipt, Calendar, MoreVertical, FileText, X,
  Eye, Trash2
} from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/StatCard';
import { toast } from 'sonner';

const FinanceLedgerPage = () => {
  const { sales, pettyCash, members, plans, addLedgerEntry, deleteLedgerEntry, branches } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: 'other',
    type: 'income' as 'credit' | 'debit',
    branchId: branches[0]?.id || 'branch-1'
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
    const csvContent = [
      headers.join(','),
      ...ledgerEntries.map(e => [
        e.date,
        `"${e.description.replace(/"/g, '""')}"`,
        e.category,
        e.amount,
        e.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Ledger exported successfully');
  };

  const handleAddTransaction = (e: React.FormEvent) => {
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
      type: formData.type,
      branchId: formData.branchId,
      reference: `MANUAL-${Date.now()}`
    });

    toast.success('Transaction added successfully');
    setIsAddDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: 'other',
      type: 'credit',
      branchId: branches[0]?.id || 'branch-1'
    });
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteLedgerEntry(id);
      toast.success('Transaction deleted');
    }
  };

  // Combine sales (income) and petty cash (expense) into a single ledger
  const ledgerEntries = useMemo(() => {
    const income = sales.map(sale => ({
      id: sale.id,
      date: sale.date,
      description: `POS Sale: ${sale.items.map(i => i.name).join(', ')}`,
      category: 'Sales',
      amount: sale.total,
      type: 'income' as const
    }));

    const expenses = pettyCash.map(expense => ({
      id: expense.id,
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      type: 'expense' as const
    }));

    // In a real app, you'd also include membership payments here
    // For now, let's mock some membership income based on active members
    const membershipIncome = members
      .filter(m => m.status === 'active')
      .map(m => {
        const plan = plans.find(p => p.id === m.planId);
        return {
          id: `mem-${m.id}`,
          date: m.joinDate, // Mocking as join date for simplicity
          description: `Membership: ${m.name} (${plan?.name || 'Standard'})`,
          category: 'Membership',
          amount: plan?.price || 0,
          type: 'income' as const
        };
      });

    return [...income, ...expenses, ...membershipIncome]
      .filter(entry => {
        const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             entry.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || entry.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, pettyCash, members, plans, searchTerm, typeFilter]);

  const stats = useMemo(() => {
    const totalIncome = ledgerEntries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = ledgerEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [ledgerEntries]);

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
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Finance Ledger</h1>
          <p className="text-muted-foreground mt-1">Centralized transaction history and cash flow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="glass-button" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-cyber">
                <Plus className="w-4 h-4 mr-2" /> 
                <span className="hidden sm:inline">Add </span>Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-display font-bold">Add Manual Transaction</DialogTitle>
                <DialogDescription>Record a transaction that wasn't processed via POS or Membership.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</Label>
                    <Input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-slate-50 border-slate-200"
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
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
                  <Input
                    required
                    placeholder="Enter transaction description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="membership">Membership</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</Label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Income (Credit)</SelectItem>
                        <SelectItem value="debit">Expense (Debit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-6 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="btn-cyber min-w-[140px]">
                    Confirm Transaction
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Income" 
          value={`AED ${stats.income.toLocaleString()}`}
          icon={ArrowUpCircle}
          variant="green"
        />
        <StatCard 
          title="Total Expenses" 
          value={`AED ${stats.expense.toLocaleString()}`}
          icon={ArrowDownCircle}
          variant="red"
        />
        <StatCard 
          title="Net Balance" 
          value={`AED ${stats.balance.toLocaleString()}`}
          icon={Wallet}
          variant="blue"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
            <SelectTrigger className="w-[150px] bg-background/50">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income Only</SelectItem>
              <SelectItem value="expense">Expenses Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

        {/* Ledger Table & Mobile Cards */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block glass-card overflow-hidden">
            <div className="overflow-x-auto scrollbar-cyber">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px] text-center">Type</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate font-medium">
                        {entry.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {entry.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-bold",
                        entry.type === 'income' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {entry.type === 'income' ? '+' : '-'}AED {entry.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "capitalize",
                          entry.type === 'income' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        )}>
                          {entry.type}
                        </Badge>
                      </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info(`Viewing transaction ${entry.id}`)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteEntry(entry.id)} className="text-rose-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {ledgerEntries.map((entry) => (
              <motion.div
                key={entry.id}
                whileTap={{ scale: 0.98 }}
                className="glass-card p-4 space-y-3 relative overflow-hidden group"
              >
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  entry.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
                )} />
                
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <h3 className="font-bold text-sm leading-tight pr-8">{entry.description}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info(`Viewing transaction ${entry.id}`)}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteEntry(entry.id)} className="text-rose-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {entry.category}
                  </Badge>
                  <p className={cn(
                    "font-bold text-lg",
                    entry.type === 'income' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {entry.type === 'income' ? '+' : '-'}AED {entry.amount.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {ledgerEntries.length === 0 && (
            <div className="glass-card h-32 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <FileText className="w-8 h-8 opacity-20" />
              <p>No transactions found</p>
            </div>
          )}
        </motion.div>
    </motion.div>
  );
};

export default FinanceLedgerPage;
