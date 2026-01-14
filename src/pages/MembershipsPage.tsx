import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { MembershipPlan } from '@/types';
import { 
  Search, Plus, CreditCard, Clock, 
  MoreVertical, Edit, Trash2, CheckCircle2,
  DollarSign, Users, Calendar, Shield,
  ArrowUpDown, Zap, Award
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MembershipsPage = () => {
  const { plans, addPlan, updatePlan, members } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plans, searchQuery]);

  const getPlanMemberCount = (planId: string) => {
    return members.filter(m => m.planId === planId).length;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Memberships & Plans</h1>
          <p className="text-muted-foreground mt-1">Manage subscription tiers and pricing</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="btn-cyber gap-2">
          <Plus className="w-5 h-5" />
          Create Plan
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search plans by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredPlans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card-hover p-6 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedPlan(plan); setIsEditModalOpen(true); }}>
                      <Edit className="w-4 h-4 mr-2" /> Edit Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-600">
                      <Trash2 className="w-4 h-4 mr-2" /> Disable Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{plan.name}</h3>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {plan.duration} {plan.duration === 1 ? 'month' : 'months'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-emerald-600">AED {plan.price}</span>
                  <span className="text-muted-foreground text-sm">/ {plan.duration === 1 ? 'mo' : `${plan.duration} mos`}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Members</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-bold">{getPlanMemberCount(plan.id)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-sm">Active</span>
                    </div>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 italic pt-2">
                    "{plan.description}"
                  </p>
                )}
              </div>

              {/* Decorative background element */}
              <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award className="w-24 h-24 rotate-12" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <PlanFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        mode="add"
      />

      {selectedPlan && (
        <PlanFormModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          plan={selectedPlan}
          mode="edit"
        />
      )}
    </motion.div>
  );
};

const PlanFormModal = ({ isOpen, onClose, plan, mode }: { isOpen: boolean; onClose: () => void; plan?: MembershipPlan; mode: 'add' | 'edit' }) => {
  const { addPlan, updatePlan } = useApp();
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price.toString() || '',
    duration: plan?.duration.toString() || '1',
    branchId: plan?.branchId || 'branch-1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration)
    };

    if (mode === 'add') {
      addPlan(data);
      toast.success('Membership plan created');
    } else if (mode === 'edit' && plan) {
      updatePlan(plan.id, data);
      toast.success('Membership plan updated');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Create New Plan' : `Edit ${plan?.name}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Plan Name</Label>
            <Input required placeholder="e.g. Premium Monthly" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (AED)</Label>
                <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
            <div className="space-y-2">
              <Label>Duration (Months)</Label>
              <Select value={formData.duration} onValueChange={v => setFormData({ ...formData, duration: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months (Yearly)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-lg bg-slate-50 border text-sm"
              placeholder="What's included in this plan?"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="btn-cyber">
              {mode === 'add' ? 'Create Plan' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipsPage;
