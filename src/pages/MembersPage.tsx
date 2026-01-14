import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Member, BeltRank } from '@/types';
import { MARTIAL_ART_DISCIPLINES } from '@/data/martialArts';
import { 
  Search, Plus, Filter, UserCircle, Phone, Mail, Calendar, 
  Award, MoreVertical, Edit, Trash2, Eye, X, AlertCircle,
  Snowflake, Play, ArrowUpDown, ChevronDown, Users,
  UserCheck, UserMinus, ShieldCheck, Target
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { StatCard } from '@/components/StatCard';

const belts: BeltRank[] = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'red', 'black', 'gold', 'none'];

const MembersPage = () => {
  const { members, plans, deleteMember, addMember, updateMember, freezeMembership, unfreezeMembership, gradings, attendance } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
    const [filterBelt, setFilterBelt] = useState<BeltRank | 'all'>('all');
    const [filterDiscipline, setFilterDiscipline] = useState<string | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'frozen' | 'expired'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'expiryDate'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  
    // Sorting and Filtering
    const filteredMembers = useMemo(() => {
      return members
        .filter(member => {
          const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                member.email.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesBelt = filterBelt === 'all' || member.belt === filterBelt;
          const matchesDiscipline = filterDiscipline === 'all' || member.disciplineId === filterDiscipline;
          const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
          return matchesSearch && matchesBelt && matchesDiscipline && matchesStatus;
        })

      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'name') return a.name.localeCompare(b.name) * factor;
        return (new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()) * factor;
      });
  }, [members, searchQuery, filterBelt, filterStatus, sortBy, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      frozen: members.filter(m => m.status === 'frozen').length,
      expired: members.filter(m => m.status === 'expired').length,
    };
  }, [members]);

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

    const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50 border border-emerald-100';
      case 'frozen': return 'text-blue-600 bg-blue-50 border border-blue-100';
      case 'expired': return 'text-rose-600 bg-rose-50 border border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border border-slate-100';
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleFreeze = (member: Member) => {
    setSelectedMember(member);
    setIsFreezeModalOpen(true);
  };

  const handleUnfreeze = (memberId: string) => {
    unfreezeMembership(memberId);
    toast.success('Membership unfrozen successfully');
  };

  const handleDelete = (memberId: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      deleteMember(memberId);
      toast.success('Member deleted successfully');
      setIsViewModalOpen(false);
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
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Member Directory</h1>
          <p className="text-muted-foreground mt-1">{members.length} total members registered</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddModalOpen(true)}
          className="btn-cyber flex items-center gap-2 text-white shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Members" 
          value={stats.total}
          icon={Users}
          variant="blue"
        />
        <StatCard 
          title="Active" 
          value={stats.active}
          icon={UserCheck}
          variant="green"
        />
        <StatCard 
          title="Frozen" 
          value={stats.frozen}
          icon={Snowflake}
          variant="blue"
        />
        <StatCard 
          title="Expired" 
          value={stats.expired}
          icon={UserMinus}
          variant="red"
        />
      </motion.div>

      {/* Filters & Sorting */}
      <motion.div variants={itemVariants} className="glass-card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <div className="flex flex-wrap gap-3">
              <Select value={filterBelt} onValueChange={(v) => setFilterBelt(v as BeltRank | 'all')}>
                <SelectTrigger className="w-36 bg-background/50">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Belt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Belts</SelectItem>
                  {belts.map(belt => (
                    <SelectItem key={belt} value={belt} className="capitalize">{belt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
                <SelectTrigger className="w-48 bg-background/50">
                  <Target className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disciplines</SelectItem>
                  {MARTIAL_ART_DISCIPLINES.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="w-36 bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-background/50">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                  Sort: {sortBy === 'name' ? 'Name' : sortBy === 'joinDate' ? 'Join Date' : 'Expiry'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleSort('name')}>Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort('joinDate')}>Join Date {sortBy === 'joinDate' && (sortOrder === 'asc' ? '↑' : '↓')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort('expiryDate')}>Expiry Date {sortBy === 'expiryDate' && (sortOrder === 'asc' ? '↑' : '↓')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Members Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((member) => {
            const plan = plans.find(p => p.id === member.planId);
            const daysUntilExpiry = Math.ceil((new Date(member.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <motion.div
                key={member.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                className="glass-card-hover p-5 cursor-pointer group"
                onClick={() => {
                  setSelectedMember(member);
                  setIsViewModalOpen(true);
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-dojo-red/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {member.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate text-slate-900">{member.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                        {member.disciplineId && (
                          <p className="text-[10px] font-bold text-primary uppercase mt-0.5">
                            {MARTIAL_ART_DISCIPLINES.find(d => d.id === member.disciplineId)?.name}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedMember(member); setIsViewModalOpen(true); }}>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(member)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit Member
                          </DropdownMenuItem>
                          {member.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleFreeze(member)} className="text-blue-600">
                              <Snowflake className="w-4 h-4 mr-2" /> Freeze
                            </DropdownMenuItem>
                          ) : member.status === 'frozen' ? (
                            <DropdownMenuItem onClick={() => handleUnfreeze(member.id)} className="text-emerald-600">
                              <Play className="w-4 h-4 mr-2" /> Unfreeze
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => handleDelete(member.id)} className="text-rose-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={cn(
                          "belt-" + member.belt
                        )}>
                          {member.belt}
                        </span>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full capitalize font-medium",
                          getStatusColor(member.status)
                        )}>
                          {member.status}
                        </span>
                      </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                      </div>
                      {member.status === 'active' && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                        <div className="flex items-center gap-1 text-rose-500 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{daysUntilExpiry}d left</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredMembers.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass-card p-12 text-center"
        >
          <UserCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No members found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
        </motion.div>
      )}

      {/* View Member Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl bg-white border-slate-200">
          {selectedMember && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-dojo-red flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary/20">
                    {selectedMember.name.charAt(0)}
                  </div>
                    <div className="space-y-1">
                      <DialogTitle className="text-2xl font-display font-bold">{selectedMember.name}</DialogTitle>
                      <DialogDescription className="sr-only">Detailed profile and history for {selectedMember.name}</DialogDescription>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "belt-" + selectedMember.belt
                        )}>
                          {selectedMember.belt} Belt
                        </span>
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full capitalize font-medium",
                          getStatusColor(selectedMember.status)
                        )}>
                          {selectedMember.status}
                        </span>
                      </div>
                    </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="info" className="mt-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl w-full">
                  <TabsTrigger value="info" className="flex-1 rounded-lg">Profile Info</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1 rounded-lg">Grading History</TabsTrigger>
                  <TabsTrigger value="attendance" className="flex-1 rounded-lg">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact Details</p>
                      <div className="space-y-2 mt-2">
                        <p className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-primary" />
                          {selectedMember.email}
                        </p>
                        <p className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-primary" />
                          {selectedMember.phone}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Membership</p>
                      <div className="space-y-2 mt-2">
                        <p className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          Joined: {new Date(selectedMember.joinDate).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-rose-500" />
                          Expires: {new Date(selectedMember.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedMember.medicalNotes && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <p className="text-sm font-bold text-amber-800 uppercase tracking-wider text-[10px]">Medical Considerations</p>
                      </div>
                      <p className="text-sm text-amber-900 leading-relaxed">{selectedMember.medicalNotes}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleEdit(selectedMember)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>
                    {selectedMember.status === 'active' ? (
                      <Button variant="outline" className="flex-1 text-blue-600" onClick={() => handleFreeze(selectedMember)}>
                        <Snowflake className="w-4 h-4 mr-2" /> Freeze Membership
                      </Button>
                    ) : selectedMember.status === 'frozen' ? (
                      <Button variant="outline" className="flex-1 text-emerald-600" onClick={() => handleUnfreeze(selectedMember.id)}>
                        <Play className="w-4 h-4 mr-2" /> Resume Membership
                      </Button>
                    ) : null}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-3">
                    {gradings
                      .filter(g => g.memberId === selectedMember.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(grading => (
                        <div key={grading.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Award className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm">
                              <span className="capitalize">{grading.fromBelt}</span>
                              <span className="mx-2 text-slate-400">→</span>
                              <span className="capitalize text-primary">{grading.toBelt}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{new Date(grading.date).toLocaleDateString()}</p>
                          </div>
                          {grading.notes && (
                            <p className="text-xs text-slate-500 italic max-w-[150px] truncate">"{grading.notes}"</p>
                          )}
                        </div>
                      ))}
                    {gradings.filter(g => g.memberId === selectedMember.id).length === 0 && (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No grading records found</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="attendance" className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-3">
                    {attendance
                      .filter(a => a.memberId === selectedMember.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10)
                      .map(att => (
                        <div key={att.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                            <span className="font-medium text-sm">{new Date(att.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-100">
                            <Calendar className="w-3 h-3" />
                            <span>Checked in at {att.checkInTime}</span>
                          </div>
                        </div>
                      ))}
                    {attendance.filter(a => a.memberId === selectedMember.id).length === 0 && (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No attendance records found</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                <Button variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(selectedMember.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Member
                </Button>
                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close Overview</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <MemberFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        mode="add"
      />

      {/* Edit Member Modal */}
      {selectedMember && (
        <MemberFormModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          member={selectedMember}
          mode="edit"
        />
      )}

      {/* Freeze Membership Modal */}
      {selectedMember && (
        <FreezeModal
          isOpen={isFreezeModalOpen}
          onClose={() => setIsFreezeModalOpen(false)}
          member={selectedMember}
        />
      )}
    </motion.div>
  );
};

// Unified Member Form Modal Component
const MemberFormModal = ({ isOpen, onClose, member, mode }: { isOpen: boolean; onClose: () => void; member?: Member; mode: 'add' | 'edit' }) => {
  const { addMember, updateMember, plans } = useApp();
  const [formData, setFormData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    belt: member?.belt || 'white' as BeltRank,
    disciplineId: member?.disciplineId || '',
    planId: member?.planId || '',
    medicalNotes: member?.medicalNotes || '',
    expiryDate: member?.expiryDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'add') {
      const plan = plans.find(p => p.id === formData.planId);
      const joinDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date(Date.now() + (plan?.duration || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      addMember({
        ...formData,
        joinDate,
        expiryDate,
        status: 'active',
        branchId: 'branch-1',
      });
      toast.success('Member added successfully');
    } else if (mode === 'edit' && member) {
      updateMember(member.id, formData);
      toast.success('Member updated successfully');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold">
            {mode === 'add' ? 'Register New Member' : `Edit ${member?.name}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-50 border-slate-200"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Discipline</Label>
                <Select value={formData.disciplineId} onValueChange={(v) => setFormData({ ...formData, disciplineId: v })}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Select Discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARTIAL_ART_DISCIPLINES.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-50 border-slate-200"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-slate-50 border-slate-200"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Belt</Label>
              <Select value={formData.belt} onValueChange={(v) => setFormData({ ...formData, belt: v as BeltRank })}>
                <SelectTrigger className="bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {belts.map(belt => (
                    <SelectItem key={belt} value={belt} className="capitalize font-medium">{belt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Membership Plan</Label>
            <Select value={formData.planId} onValueChange={(v) => setFormData({ ...formData, planId: v })}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                  {plans.filter(p => p.isActive).map(plan => (
                    <SelectItem key={plan.id} value={plan.id} className="font-medium">
                      {plan.name} - AED {plan.price}/mo
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {mode === 'edit' && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiry Date</Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Medical Notes (Optional)</Label>
            <textarea
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              placeholder="Any allergies, injuries, or health conditions staff should be aware of..."
              className="w-full min-h-[100px] p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="btn-cyber min-w-[140px]">
              {mode === 'add' ? (
                <><Plus className="w-4 h-4 mr-2" /> Add Member</>
              ) : (
                <><Edit className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Freeze Membership Modal
const FreezeModal = ({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: Member }) => {
  const { freezeMembership } = useApp();
  const [dates, setDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    freezeMembership(member.id, dates.start, dates.end);
    toast.info(`${member.name}'s membership has been frozen`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-slate-200">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Snowflake className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-display font-bold text-slate-900">Freeze Membership</DialogTitle>
          <p className="text-sm text-slate-500 mt-2">
            Pause <strong>{member.name}</strong>'s access for a specific period. The membership will remain inactive during these dates.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Start Date</Label>
              <Input
                type="date"
                required
                value={dates.start}
                onChange={(e) => setDates({ ...dates, start: e.target.value })}
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Resume Date</Label>
              <Input
                type="date"
                required
                value={dates.end}
                onChange={(e) => setDates({ ...dates, end: e.target.value })}
                className="bg-slate-50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
              Confirm Freeze
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MembersPage;
