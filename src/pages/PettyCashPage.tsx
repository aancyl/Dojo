import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Plus, Search, Filter, MoreVertical, 
  Trash2, Edit2, Download, Receipt,
  Coffee, Home, Wrench, Package, HelpCircle,
  TrendingUp, Calendar, PieChart as PieIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { StatCard } from '@/components/StatCard';

const PettyCashPage = () => {
  const { pettyCash, addPettyCashEntry, updatePettyCashEntry, deletePettyCashEntry, branches } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: 'other',
    branchId: branches[0]?.id || ''
  });

  const filteredEntries = (pettyCash || [])
    .filter(entry => 
      (entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       entry.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === 'all' || entry.category === categoryFilter)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const currentMonthSpent = (pettyCash || [])
    .filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const entryData = {
      ...formData,
      amount: parseFloat(formData.amount as string)
    };

    if (editingEntry) {
      updatePettyCashEntry(editingEntry.id, entryData as any);
      toast.success('Entry updated successfully');
    } else {
      addPettyCashEntry(entryData as any);
      toast.success('Entry added successfully');
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: 'other',
      branchId: branches?.[0]?.id || ''
    });
    setEditingEntry(null);
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      amount: entry.amount.toString(),
      description: entry.description,
      category: entry.category,
      branchId: entry.branchId
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deletePettyCashEntry(id);
      toast.success('Entry deleted successfully');
    }
  };

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'cleaning': return <Home className="w-4 h-4" />;
        case 'refreshments': return <Coffee className="w-4 h-4" />;
        case 'repairs': return <Wrench className="w-4 h-4" />;
        case 'office': return <Package className="w-4 h-4" />;
        case 'maintenance': return <Wrench className="w-4 h-4" />;
        default: return <HelpCircle className="w-4 h-4" />;
      }
    };

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'cleaning': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'refreshments': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'repairs': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'maintenance': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        case 'office': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
        default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      }
    };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Branch'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(e => [
        e.date,
        `"${e.description.replace(/"/g, '""')}"`,
        e.category,
        e.amount,
        branches.find(b => b.id === e.branchId)?.name || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `petty-cash-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Petty cash export successful');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Petty Cash</h1>
          <p className="text-muted-foreground mt-1">Track and manage minor daily expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="glass-button" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="btn-cyber bg-dojo-red hover:bg-dojo-red/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingEntry ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (AED)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="glass-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="What was this for?"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="glass-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData({...formData, category: v as any})}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="office">Office Supplies</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="refreshments">Refreshments</SelectItem>
                          <SelectItem value="repairs">Repairs</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Select 
                      value={formData.branchId} 
                      onValueChange={(v) => setFormData({...formData, branchId: v})}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {(branches || []).map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="btn-cyber w-full">
                    {editingEntry ? 'Update Entry' : 'Add Entry'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Spent" 
          value={`AED ${totalSpent.toLocaleString()}`}
          icon={TrendingUp}
          variant="gold"
        />
        <StatCard 
          title="Entries" 
          value={filteredEntries.length.toString()}
          icon={Receipt}
          variant="blue"
        />
          <StatCard 
            title="Current Month" 
            value={`AED ${currentMonthSpent.toLocaleString()}`}
            icon={Calendar}
            variant="red"
          />
        </div>

        {/* Visualization Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-neon-gold" />
              <h3 className="text-lg font-display font-semibold uppercase">Spending Breakdown</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(
                      (pettyCash || []).reduce((acc, e) => {
                        acc[e.category] = (acc[e.category] || 0) + e.amount;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#94a3b8'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card p-6 flex flex-col justify-center items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-dojo-red/20">
              <Receipt className="w-12 h-12 text-dojo-red" />
            </div>
            <div>
              <h4 className="text-xl font-display font-bold">Top Category</h4>
              <p className="text-3xl font-black text-white mt-2 uppercase tracking-tighter">
                {Object.entries(
                  (pettyCash || []).reduce((acc, e) => {
                    acc[e.category] = (acc[e.category] || 0) + e.amount;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              Focus on optimizing {Object.entries(
                (pettyCash || []).reduce((acc, e) => {
                  acc[e.category] = (acc[e.category] || 0) + e.amount;
                  return acc;
                }, {} as Record<string, number>)
              ).sort((a, b) => b[1] - a[1])[0]?.[0]} costs this month.
            </p>
          </div>
        </motion.div>


      {/* Filters and Search */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search descriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-input"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] glass-input">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="office">Office Supplies</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="refreshments">Refreshments</SelectItem>
                <SelectItem value="repairs">Repairs</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
          </Select>
        </div>
      </div>

        {/* Table & Mobile Cards */}
        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block glass-card overflow-hidden">
            <div className="overflow-x-auto scrollbar-cyber">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Description</TableHead>
                    <TableHead className="whitespace-nowrap">Category</TableHead>
                    <TableHead className="whitespace-nowrap">Branch</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-white/5 border-white/5 transition-colors">
                        <TableCell className="font-medium whitespace-nowrap">{entry.date}</TableCell>
                        <TableCell className="min-w-[200px]">{entry.description}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className={`flex items-center gap-1.5 w-fit ${getCategoryColor(entry.category)}`}>
                            {getCategoryIcon(entry.category)}
                            {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {branches.find(b => b.id === entry.branchId)?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-bold text-neon-gold whitespace-nowrap">
                          AED {entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card border-white/10">
                              <DropdownMenuItem onClick={() => handleEdit(entry)} className="cursor-pointer">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(entry.id)} 
                                className="cursor-pointer text-dojo-red focus:text-dojo-red"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No petty cash entries found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 space-y-3 relative overflow-hidden"
                >
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    getCategoryColor(entry.category).split(' ')[1].replace('text-', 'bg-')
                  )} />
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {entry.date}
                      </p>
                      <h3 className="font-bold text-sm leading-tight pr-8">{entry.description}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 -mt-1 -mr-1 hover:bg-white/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-white/10">
                        <DropdownMenuItem onClick={() => handleEdit(entry)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(entry.id)} className="text-dojo-red">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className={cn("text-[10px] uppercase font-sans flex items-center gap-1 w-fit", getCategoryColor(entry.category))}>
                        {getCategoryIcon(entry.category)}
                        {entry.category}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground uppercase">
                        {branches.find(b => b.id === entry.branchId)?.name || 'N/A'}
                      </span>
                    </div>
                    <p className="font-bold text-lg text-neon-gold">
                      AED {entry.amount.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card h-32 flex items-center justify-center text-muted-foreground">
                No entries found.
              </div>
            )}
          </div>
        </motion.div>
    </motion.div>
  );
};

export default PettyCashPage;
