import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Trainer, BeltRank } from '@/types';
import { MARTIAL_ART_DISCIPLINES } from '@/data/martialArts';
import { 
  Search, Plus, UserCircle, Phone, Mail, 
  MoreVertical, Edit, Trash2, Eye, X, 
  GraduationCap, Award, MapPin, Calendar,
  ArrowUpDown, Target
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { StatCard } from '@/components/StatCard';

const belts: BeltRank[] = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'red', 'black'];

const TrainersPage = () => {
  const { trainers, addTrainer, updateTrainer, deleteTrainer, classes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const filteredTrainers = useMemo(() => {
    return trainers.filter(trainer => 
      trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [trainers, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: trainers.length,
      blackBelts: trainers.filter(t => t.belt === 'black').length,
      totalClasses: classes.length
    };
  }, [trainers, classes]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trainer?')) {
      deleteTrainer(id);
      toast.success('Trainer deleted successfully');
      setIsViewModalOpen(false);
    }
  };

  const getTrainerClasses = (trainerId: string) => {
    return classes.filter(c => c.trainerId === trainerId);
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

  const getBeltClasses = (belt: BeltRank) => {
    const classes: Record<BeltRank, string> = {
      white: 'bg-slate-100 text-slate-800 border border-slate-200',
      yellow: 'bg-yellow-400 text-yellow-900',
      orange: 'bg-orange-500 text-white',
      green: 'bg-green-600 text-white',
      blue: 'bg-blue-600 text-white',
      purple: 'bg-purple-600 text-white',
      brown: 'bg-amber-800 text-white',
      red: 'bg-red-600 text-white',
      black: 'bg-slate-900 text-white border border-slate-700',
    };
    return classes[belt];
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
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Trainer Management</h1>
          <p className="text-muted-foreground mt-1">{trainers.length} active instructors</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="btn-cyber gap-2">
          <Plus className="w-5 h-5" />
          Add Trainer
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Trainers" 
          value={stats.total.toString()}
          icon={UserCircle}
          variant="blue"
        />
        <StatCard 
          title="Black Belts" 
          value={stats.blackBelts.toString()}
          icon={Award}
          variant="gold"
        />
        <StatCard 
          title="Total Classes" 
          value={stats.totalClasses.toString()}
          icon={GraduationCap}
          variant="blue"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTrainers.map((trainer) => (
            <motion.div
              key={trainer.id}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              className="glass-card-hover p-5 cursor-pointer group"
              onClick={() => {
                setSelectedTrainer(trainer);
                setIsViewModalOpen(true);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dojo-red/20 to-primary/20 flex items-center justify-center text-xl font-bold text-dojo-red group-hover:scale-110 transition-transform">
                  {trainer.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate">{trainer.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {trainer.disciplineIds?.map(dId => (
                            <span key={dId} className="text-[9px] font-bold text-primary uppercase bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                              {MARTIAL_ART_DISCIPLINES.find(d => d.id === dId)?.name}
                            </span>
                          ))}
                        </div>
                      </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedTrainer(trainer); setIsViewModalOpen(true); }}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedTrainer(trainer); setIsEditModalOpen(true); }}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Trainer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(trainer.id)} className="text-rose-600">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full capitalize font-bold",
                      getBeltClasses(trainer.belt)
                    )}>
                      {trainer.belt}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                      {getTrainerClasses(trainer.id).length} Classes
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Trainer Form Modal */}
      <TrainerFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        mode="add"
      />

      {selectedTrainer && (
        <TrainerFormModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          trainer={selectedTrainer}
          mode="edit"
        />
      )}

      {/* View Trainer Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedTrainer && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-dojo-red to-primary flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                    {selectedTrainer.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">{selectedTrainer.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-full capitalize font-bold",
                        getBeltClasses(selectedTrainer.belt)
                      )}>
                        {selectedTrainer.belt} Belt
                      </span>
                      <span className="text-sm text-muted-foreground">{selectedTrainer.specialty}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact Info</Label>
                    <div className="space-y-2 mt-2">
                      <p className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-primary" />
                        {selectedTrainer.email}
                      </p>
                      <p className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-primary" />
                        {selectedTrainer.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bio / Experience</Label>
                    <p className="text-sm mt-2 text-slate-600 leading-relaxed">
                      {selectedTrainer.bio || 'No bio provided.'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assigned Classes</Label>
                  <div className="space-y-2 mt-3">
                    {getTrainerClasses(selectedTrainer.id).map(c => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 text-sm">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.startTime}</span>
                      </div>
                    ))}
                    {getTrainerClasses(selectedTrainer.id).length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-4">No classes assigned</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button variant="ghost" className="text-rose-600" onClick={() => handleDelete(selectedTrainer.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setSelectedTrainer(selectedTrainer); setIsEditModalOpen(true); setIsViewModalOpen(false); }}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const TrainerFormModal = ({ isOpen, onClose, trainer, mode }: { isOpen: boolean; onClose: () => void; trainer?: Trainer; mode: 'add' | 'edit' }) => {
  const { addTrainer, updateTrainer } = useApp();
  const [formData, setFormData] = useState({
    name: trainer?.name || '',
    email: trainer?.email || '',
    phone: trainer?.phone || '',
    belt: trainer?.belt || 'white' as BeltRank,
    disciplineIds: trainer?.disciplineIds || [] as string[],
    skills: trainer?.skills || [] as string[],
    bio: trainer?.bio || '',
    branchId: trainer?.branchId || 'branch-1'
  });

  const toggleDiscipline = (id: string) => {
    setFormData(prev => ({
      ...prev,
      disciplineIds: prev.disciplineIds.includes(id)
        ? prev.disciplineIds.filter(d => d !== id)
        : [...prev.disciplineIds, id]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'add') {
      addTrainer(formData);
      toast.success('Trainer added successfully');
    } else if (mode === 'edit' && trainer) {
      updateTrainer(trainer.id, formData);
      toast.success('Trainer updated successfully');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Trainer' : `Edit ${trainer?.name}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Belt Rank</Label>
                <Select value={formData.belt} onValueChange={(v: BeltRank) => setFormData({ ...formData, belt: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {belts.map(b => <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Manual Skills (comma separated)</Label>
                <Input 
                  placeholder="e.g. Cardio, Kids Classes" 
                  value={formData.skills.join(', ')} 
                  onChange={e => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase text-slate-500">Teaching Disciplines</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100 max-h-[200px] overflow-y-auto">
                {MARTIAL_ART_DISCIPLINES.map(d => (
                  <div key={d.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`disc-${d.id}`} 
                      checked={formData.disciplineIds.includes(d.id)}
                      onCheckedChange={() => toggleDiscipline(d.id)}
                    />
                    <label 
                      htmlFor={`disc-${d.id}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {d.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

          <div className="space-y-2">
            <Label>Bio / Notes</Label>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-lg bg-slate-50 border text-sm"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="btn-cyber">
              {mode === 'add' ? 'Add Trainer' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TrainersPage;
