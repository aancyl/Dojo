import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { 
  Building2, Wallet, Package, 
  ArrowRight, Landmark, PieChart, 
  TrendingUp, Info
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const BalanceSheetPage = () => {
  const { sales, pettyCash, inventory, members, plans } = useApp();

  const balanceData = useMemo(() => {
    // Assets
    const cashIncome = sales.reduce((sum, s) => sum + s.total, 0);
    const membershipIncome = members
      .filter(m => m.status === 'active')
      .reduce((sum, m) => {
        const plan = plans.find(p => p.id === m.planId);
        return sum + (plan?.price || 0);
      }, 0);
    const expenses = pettyCash.reduce((sum, e) => sum + e.amount, 0);
    
    const cashOnHand = cashIncome + membershipIncome - expenses;
    const inventoryValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
    const totalAssets = cashOnHand + inventoryValue;

    // Liabilities (Mocked as we don't track loans/payables yet)
    const liabilities = 0;

    // Equity
    const equity = totalAssets - liabilities;

    return {
      cash: cashOnHand,
      inventory: inventoryValue,
      totalAssets,
      liabilities,
      equity
    };
  }, [sales, pettyCash, inventory, members, plans]);

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
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Balance Sheet</h1>
          <p className="text-muted-foreground mt-1">Financial position as of {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-primary/10 border border-primary/20">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">Equity: AED {balanceData.equity.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASSETS */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Landmark className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-display font-bold">Assets</h2>
          </div>
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Cash and Equivalents</p>
                    <p className="text-xs text-muted-foreground">Bank & Petty Cash</p>
                  </div>
                </div>
                  <p className="font-bold">AED {balanceData.cash.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Inventory</p>
                      <p className="text-xs text-muted-foreground">Retail & Equipment</p>
                    </div>
                  </div>
                  <p className="font-bold">AED {balanceData.inventory.toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Fixed Assets</p>
                      <p className="text-xs text-muted-foreground">Gym Equipment & Leasehold</p>
                    </div>
                  </div>
                  <p className="font-bold">AED 0</p>
                </div>

                <Separator className="my-2 opacity-50" />
                
                <div className="flex items-center justify-between pt-2">
                  <p className="text-lg font-bold">Total Assets</p>
                  <p className="text-lg font-bold text-emerald-600">AED {balanceData.totalAssets.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* LIABILITIES & EQUITY */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Liabilities & Equity</h2>
            </div>
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Liabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                      <ArrowRight className="w-4 h-4 rotate-45" />
                    </div>
                    <div>
                      <p className="font-medium">Accounts Payable</p>
                      <p className="text-xs text-muted-foreground">Supplier Invoices</p>
                    </div>
                  </div>
                  <p className="font-bold text-rose-600">AED 0</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="font-bold">Total Liabilities</p>
                  <p className="font-bold">AED 0</p>
                </div>

                <Separator className="my-4 opacity-50" />

                <div className="pb-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Equity</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Retained Earnings</p>
                      <p className="text-xs text-muted-foreground">Accumulated Profits</p>
                    </div>
                  </div>
                  <p className="font-bold">AED {balanceData.equity.toLocaleString()}</p>
                </div>

                <Separator className="my-2 opacity-50" />
                
                <div className="flex items-center justify-between pt-2">
                  <p className="text-lg font-bold">Total Liab. & Equity</p>
                  <p className="text-lg font-bold text-primary">AED {(balanceData.liabilities + balanceData.equity).toLocaleString()}</p>
                </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Info Notice */}
      <motion.div variants={itemVariants} className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-500 italic">
          Note: This balance sheet is automatically generated based on POS sales, membership statuses, and petty cash logs. 
          Fixed assets and long-term liabilities should be manually adjusted in the accounting settings for full accuracy.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default BalanceSheetPage;
