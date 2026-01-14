import { useState, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Member, Trainer, ClassSession, BeltRank } from '@/types';
import { 
  Search, CheckCircle2, Clock, Calendar, Filter, 
  UserCircle, Users, GraduationCap, ArrowRight,
  ChevronDown, History, BarChart3, Activity
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { StatCard } from '@/components/StatCard';

const AttendancePage = () => {
  const { 
    members, trainers, classes, attendance, 
    checkInMember, checkInTrainer 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'members' | 'trainers'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  
  const today = new Date();
  const [dateFilter, setDateFilter] = useState(today.toISOString().split('T')[0]);
  
  const [filterYear, setFilterYear] = useState(today.getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState((today.getMonth() + 1).toString().padStart(2, '0'));
  const [filterDay, setFilterDay] = useState(today.getDate().toString().padStart(2, '0'));

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  }, []);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const days = useMemo(() => {
    return Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  }, []);

  const updateDateFromParts = (y: string, m: string, d: string) => {
    const newDate = `${y}-${m}-${d}`;
    setDateFilter(newDate);
  };

  const handleYearChange = (val: string) => {
    setFilterYear(val);
    updateDateFromParts(val, filterMonth, filterDay);
  };

  const handleMonthChange = (val: string) => {
    setFilterMonth(val);
    updateDateFromParts(filterYear, val, filterDay);
  };

  const handleDayChange = (val: string) => {
    setFilterDay(val);
    updateDateFromParts(filterYear, filterMonth, val);
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

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trainers, searchQuery]);

    const getBeltColor = (belt: BeltRank) => {
      const colors: Record<BeltRank, string> = {
        white: 'belt-white',
        yellow: 'belt-yellow',
        orange: 'belt-orange',
        green: 'belt-green',
        blue: 'belt-blue',
        purple: 'belt-purple',
        brown: 'belt-brown',
        red: 'belt-red',
        black: 'belt-black',
        gold: 'belt-gold',
      };
      return colors[belt];
    };

  const handleCheckIn = (id: string, type: 'member' | 'trainer') => {
    if (selectedClassId === 'all') {
      toast.error('Please select a class first');
      return;
    }

    const alreadyCheckedIn = attendance.some(a => 
      a.date === dateFilter && 
      a.classId === selectedClassId && 
      (type === 'member' ? a.memberId === id : a.trainerId === id)
    );

    if (alreadyCheckedIn) {
      toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} already checked in for this class`);
      return;
    }

    if (type === 'member') {
      checkInMember(selectedClassId, id);
      toast.success('Member checked in successfully');
    } else {
      checkInTrainer(selectedClassId, id);
      toast.success('Trainer checked in successfully');
    }
  };

  const getAttendanceForPerson = (id: string, type: 'member' | 'trainer') => {
    return attendance.filter(a => 
      (type === 'member' ? a.memberId === id : a.trainerId === id)
    ).length;
  };

  const calculateAttendancePercentage = (id: string, type: 'member' | 'trainer') => {
    const attendedCount = getAttendanceForPerson(id, type);
    // Assuming total sessions is either total classes or a fixed number for the demo
    // Let's use total classes occurred so far
    const totalPossibleSessions = classes.length * 5; // Simulating a history of sessions
    const percentage = Math.min(100, Math.round((attendedCount / totalPossibleSessions) * 100));
    return percentage;
  };

  const isCheckedInToday = (id: string, type: 'member' | 'trainer') => {
    return attendance.some(a => 
      a.date === dateFilter && 
      (selectedClassId === 'all' || a.classId === selectedClassId) &&
      (type === 'member' ? a.memberId === id : a.trainerId === id)
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Attendance Tracking</h1>
            <p className="text-muted-foreground mt-1">Manage daily check-ins for members and trainers</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-slate-700">Filter Date:</span>
            </div>
            
            <Select value={filterYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px] h-10 bg-white border-slate-200 rounded-xl">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[140px] h-10 bg-white border-slate-200 rounded-xl">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDay} onValueChange={handleDayChange}>
              <SelectTrigger className="w-[80px] h-10 bg-white border-slate-200 rounded-xl">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            <div className="relative">
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setDateFilter(val);
                  const [y, m, d] = val.split('-');
                  setFilterYear(y);
                  setFilterMonth(m);
                  setFilterDay(d);
                }}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2 border-slate-200 bg-white">
                <Calendar className="w-4 h-4" />
                Picker
              </Button>
            </div>
          </div>
        </motion.div>


      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Members Present" 
          value={attendance.filter(a => a.date === dateFilter && a.memberId).length}
          icon={Users}
          variant="blue"
        />
        <StatCard 
          title="Trainers Present" 
          value={attendance.filter(a => a.date === dateFilter && a.trainerId).length}
          icon={GraduationCap}
          variant="green"
        />
        <StatCard 
          title="Average Attendance" 
          value={`${Math.round((attendance.filter(a => a.date === dateFilter).length / (members.length + trainers.length || 1)) * 100)}%`}
          icon={BarChart3}
          variant="purple"
        />
        <StatCard 
          title="Total Check-ins" 
          value={attendance.filter(a => a.date === dateFilter).length}
          icon={Activity}
          variant="gold"
        />
      </motion.div>

      {/* Main Controls */}
      <motion.div variants={itemVariants} className="glass-card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab === 'members' ? 'members' : 'trainers'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[240px] bg-background/50">
                <SelectValue placeholder="Select Class Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.startTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Tabs and Grid */}
      <Tabs defaultValue="members" className="space-y-6" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="members" className="px-8 rounded-lg flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="trainers" className="px-8 rounded-lg flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Trainers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((member) => (
                <AttendanceCard 
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  email={member.email}
                  type="member"
                  belt={member.belt}
                  attendanceCount={getAttendanceForPerson(member.id, 'member')}
                  attendancePercentage={calculateAttendancePercentage(member.id, 'member')}
                  isCheckedIn={isCheckedInToday(member.id, 'member')}
                  onCheckIn={() => handleCheckIn(member.id, 'member')}
                  getBeltColor={getBeltColor}
                />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="trainers" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTrainers.map((trainer) => (
                <AttendanceCard 
                  key={trainer.id}
                  id={trainer.id}
                  name={trainer.name}
                  email={trainer.email}
                  type="trainer"
                  belt={trainer.belt}
                  attendanceCount={getAttendanceForPerson(trainer.id, 'trainer')}
                  attendancePercentage={calculateAttendancePercentage(trainer.id, 'trainer')}
                  isCheckedIn={isCheckedInToday(trainer.id, 'trainer')}
                  onCheckIn={() => handleCheckIn(trainer.id, 'trainer')}
                  getBeltColor={getBeltColor}
                />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

interface AttendanceCardProps {
  id: string;
  name: string;
  email: string;
  type: 'member' | 'trainer';
  belt: BeltRank;
  attendanceCount: number;
  attendancePercentage: number;
  isCheckedIn: boolean;
  onCheckIn: () => void;
  getBeltColor: (belt: BeltRank) => string;
}

const AttendanceCard = forwardRef<HTMLDivElement, AttendanceCardProps>(({ 
  id, name, email, type, belt, 
  attendanceCount, attendancePercentage, isCheckedIn, onCheckIn, getBeltColor 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={cn(
        "glass-card-hover p-4 flex items-center gap-4 group",
        isCheckedIn && "border-emerald-500/50 bg-emerald-50/30"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm group-hover:scale-110 transition-transform duration-300 flex-shrink-0",
        type === 'member' ? "bg-primary/10 text-primary" : "bg-dojo-red/10 text-dojo-red"
      )}>
        {name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-base truncate text-slate-900">{name}</h3>
          <Badge className={cn("text-[10px] uppercase font-bold px-2 py-0", getBeltColor(belt))}>
            {belt}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
        
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${attendancePercentage}%` }}
              className={cn(
                "h-full rounded-full",
                attendancePercentage > 80 ? "bg-emerald-500" : 
                attendancePercentage > 50 ? "bg-amber-500" : "bg-rose-500"
              )}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-600">{attendancePercentage}%</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <History className="w-3 h-3" />
              <span>{attendanceCount} sessions</span>
            </div>
          </div>
          
            <Button 
              size="sm" 
              variant={isCheckedIn ? "outline" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn();
              }}
              disabled={isCheckedIn}
              className={cn(
                "h-8 px-3 text-xs font-bold transition-all",
                isCheckedIn 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                  : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
              )}
            >
            {isCheckedIn ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Checked In
              </span>
            ) : (
              "Check In"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

export default AttendancePage;
