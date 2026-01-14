import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Member, BeltRank } from '@/types';
import { 
  Search, Plus, Award, MoreVertical, Edit, Trash2, Calendar,
  User, CheckCircle2, AlertCircle, TrendingUp, Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { StatCard } from '@/components/StatCard';

const belts: BeltRank[] = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'red', 'black', 'gold'];

const GradingPage = () => {
  const { members, gradings, promoteMember, trainers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [newBelt, setNewBelt] = useState<BeltRank>('yellow');
  const [notes, setNotes] = useState('');

  const filteredGradings = useMemo(() => {
    return gradings
      .filter(g => {
        const member = members.find(m => m.id === g.memberId);
        return member?.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [gradings, members, searchQuery]);

  const stats = useMemo(() => {
    return {
      totalGradings: gradings.length,
      eligibleMembers: members.filter(m => m.status === 'active').length,
      avgTime: '4.2 Mo'
    };
  }, [gradings, members]);

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

    const handleAddGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedTrainerId) {
      toast.error('Please select a member and a trainer');
      return;
    }
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    promoteMember(selectedMemberId, newBelt, selectedTrainerId, notes);

    toast.success(`Grading recorded for ${member.name}`);
    setIsGradingModalOpen(false);
    setSelectedMemberId('');
    setSelectedTrainerId('');
    setNotes('');
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
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Belt Grading</h1>
          <p className="text-muted-foreground mt-1">Track and manage student belt progressions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsGradingModalOpen(true)}
          className="btn-cyber flex items-center gap-2 text-white shadow-lg shadow-primary/20"
        >
          <Award className="w-5 h-5" />
          Record New Grading
        </motion.button>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Gradings" 
          value={stats.totalGradings.toString()}
          icon={TrendingUp}
          variant="gold"
        />
        <StatCard 
          title="Eligible Members" 
          value={stats.eligibleMembers.toString()}
          icon={User}
          variant="blue"
        />
        <StatCard 
          title="Avg. Time to Rank" 
          value={stats.avgTime}
          icon={CheckCircle2}
          variant="green"
        />
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </motion.div>

      {/* Gradings List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-cyber">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Student</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Progression</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Trainer</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGradings.map((grading) => {
                  const member = members.find(m => m.id === grading.memberId);
                  const trainer = trainers.find(t => t.id === grading.trainerId);
                  return (
                    <tr key={grading.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                            {member?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{member?.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {grading.memberId.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className={cn("belt-" + grading.fromBelt)}>
                            {grading.fromBelt}
                          </span>
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          <span className={cn("belt-" + grading.toBelt)}>
                            {grading.toBelt}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {trainer?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(grading.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground italic truncate max-w-xs">
                          {grading.notes || 'No notes added'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredGradings.map((grading) => {
            const member = members.find(m => m.id === grading.memberId);
            const trainer = trainers.find(t => t.id === grading.trainerId);
            return (
                <div key={grading.id} className="glass-card p-5 space-y-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0 border-2 border-primary/20">
                        {member?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-tight">{member?.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                          {new Date(grading.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className={cn("scale-90 shadow-sm", "belt-" + grading.toBelt)}>
                      {grading.toBelt}
                    </div>
                  </div>

                  <div className="relative py-6 px-4 bg-muted/30 rounded-xl border border-border/50 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">Current Rank</span>
                        <div className={cn("belt-" + grading.fromBelt)}>
                          {grading.fromBelt}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                          <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <div className="h-px w-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-2" />
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-primary/70 tracking-widest text-right">New Rank</span>
                        <div className={cn("belt-" + grading.toBelt)}>
                          {grading.toBelt}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground font-medium">Examiner:</span>
                      </div>
                      <span className="font-bold text-slate-700">{trainer?.name || 'Unknown'}</span>
                    </div>
                    {grading.notes && (
                      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-border/50 shadow-inner">
                        <p className="text-sm italic text-slate-600 leading-relaxed">"{grading.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

            );
          })}
        </div>

        {filteredGradings.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No grading records found</h3>
            <p className="text-muted-foreground">Start by recording a student's belt progression.</p>
          </div>
        )}
      </motion.div>

      {/* Record Grading Modal */}
      <Dialog open={isGradingModalOpen} onOpenChange={setIsGradingModalOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold">Record Belt Grading</DialogTitle>
            <DialogDescription>
              Promote a student to a new belt rank and record feedback.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGrading} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {members.filter(m => m.status === 'active').map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.belt} belt)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Trainer / Examiner</Label>
                <Select value={selectedTrainerId} onValueChange={setSelectedTrainerId}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map(trainer => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Belt Rank</Label>
                <Select value={newBelt} onValueChange={(v) => setNewBelt(v as BeltRank)}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {belts.map(belt => (
                      <SelectItem key={belt} value={belt} className="capitalize">{belt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes & Feedback</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Technical performance, attitude, etc..."
                className="w-full min-h-[100px] p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsGradingModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="btn-cyber min-w-[140px]">
                <Award className="w-4 h-4 mr-2" /> Confirm Grading
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default GradingPage;
