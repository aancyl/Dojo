import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { MARTIAL_ART_DISCIPLINES } from '@/data/martialArts';
import { 
  Calendar as CalendarIcon, Clock, Users, MapPin, Plus, Edit2, 
  CheckCircle2, ChevronLeft, ChevronRight, BarChart3, List, CalendarDays,
  CheckCircle, XCircle, AlertCircle, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ClassSession, BeltRank, SessionStatus } from '@/types';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const belts: BeltRank[] = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'red', 'black'];

const SchedulePage = () => {
  const { 
    classes, trainers, addClass, updateClass, deleteClass, 
    checkInMember, members, attendance, classStatuses, updateClassStatus 
  } = useApp();
  const [view, setView] = useState<'weekly' | 'calendar' | 'history'>('weekly');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // History Filters
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear().toString());
  const [historyMonth, setHistoryMonth] = useState((new Date().getMonth() + 1).toString());

  // Form State
  const [formData, setFormData] = useState<Partial<ClassSession>>({
    name: '',
    disciplineId: '',
    trainerId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    maxCapacity: 20,
    beltMin: 'white',
    beltMax: 'black',
    branchId: 'branch-1'
  });

  const today = new Date().getDay();
  const getTrainerName = (id: string) => trainers.find(t => t.id === id)?.name || 'TBA';

  const handleAddClass = () => {
    if (!formData.name || !formData.trainerId) {
      toast.error('Please fill in all required fields');
      return;
    }
    addClass(formData as Omit<ClassSession, 'id'>);
    setIsAddDialogOpen(false);
    toast.success('Class added successfully');
  };

  const handleEditClass = () => {
    if (!selectedClass) return;
    updateClass(selectedClass.id, formData);
    setIsEditDialogOpen(false);
    toast.success('Class updated successfully');
  };

  const handleMarkAttendance = (memberId: string) => {
    if (!selectedClass) return;
    checkInMember(selectedClass.id, memberId);
    toast.success('Attendance marked');
  };

  const openEditDialog = (cls: ClassSession) => {
    setSelectedClass(cls);
    setFormData(cls);
    setIsEditDialogOpen(true);
  };

  const openAttendanceDialog = (cls: ClassSession) => {
    setSelectedClass(cls);
    setIsAttendanceDialogOpen(true);
  };

  const getClassStatus = (classId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return classStatuses.find(s => s.classId === classId && s.date === dateStr)?.status || 'scheduled';
  };

  const handleStatusChange = (classId: string, date: Date, status: SessionStatus) => {
    updateClassStatus(classId, date.toISOString().split('T')[0], status);
    toast.success(`Class marked as ${status}`);
  };

  // History Computations
  const monthlyAttendance = useMemo(() => {
    return attendance.filter(a => {
      const date = new Date(a.date);
      return date.getMonth() + 1 === parseInt(historyMonth) && date.getFullYear() === parseInt(historyYear);
    });
  }, [attendance, historyMonth, historyYear]);

  const yearlyAttendance = useMemo(() => {
    return attendance.filter(a => {
      const date = new Date(a.date);
      return date.getFullYear() === parseInt(historyYear);
    });
  }, [attendance, historyYear]);

  const classStats = useMemo(() => {
    const stats: Record<string, { name: string, count: number }> = {};
    monthlyAttendance.forEach(a => {
      const cls = classes.find(c => c.id === a.classId);
      if (cls) {
        if (!stats[cls.id]) stats[cls.id] = { name: cls.name, count: 0 };
        stats[cls.id].count++;
      }
    });
    return Object.values(stats);
  }, [monthlyAttendance, classes]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Class Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage training sessions and attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-auto">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="weekly" className="gap-2">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Weekly</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setIsAddDialogOpen(true)} className="cyber-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'weekly' && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-7 gap-4"
          >
            {days.map((day, index) => (
              <div
                key={day}
                className={cn(
                  "glass-card p-4 transition-all",
                  index === today && "ring-2 ring-primary bg-primary/5"
                )}
              >
                <h3 className={cn(
                  "font-display font-semibold text-center pb-3 border-b border-border mb-4",
                  index === today && "text-primary"
                )}>
                  {day}
                  {index === today && <span className="block text-[10px] uppercase tracking-wider text-primary mt-1">Today</span>}
                </h3>
                <div className="space-y-3">
                  {classes
                    .filter(c => c.dayOfWeek === index)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(cls => {
                          const status = getClassStatus(cls.id, new Date());
                          return (
                            <div
                              key={cls.id}
                              className={cn(
                                "group relative p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer",
                                status === 'completed' ? "bg-green-500/5 border-green-500/20" : 
                                status === 'canceled' ? "bg-red-500/5 border-red-500/20 opacity-60" : "bg-muted/30"
                              )}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium text-sm">{cls.name}</p>
                                  {status === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                                  {status === 'canceled' && <XCircle className="w-3 h-3 text-red-500" />}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openEditDialog(cls)} className="p-1 hover:text-primary transition-colors">
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button onClick={() => openAttendanceDialog(cls)} className="p-1 hover:text-primary transition-colors">
                                    <CheckCircle2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {cls.startTime} - {cls.endTime}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                                  <Users className="w-3 h-3" />
                                  {getTrainerName(cls.trainerId)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  {classes.filter(c => c.dayOfWeek === index).length === 0 && (
                    <p className="text-center text-muted-foreground/30 text-xs py-8 italic">No classes</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {view === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <Card className="lg:col-span-1 glass-card border-none">
              <CardHeader>
                <CardTitle>Training Calendar</CardTitle>
                <CardDescription>Select a date to see scheduled classes</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border shadow-sm mx-auto"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 glass-card border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Classes for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</CardTitle>
                </div>
                <Badge variant="outline" className="text-primary border-primary/30">
                  {classes.filter(c => c.dayOfWeek === selectedDate.getDay()).length} Sessions
                </Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                      {classes
                        .filter(c => c.dayOfWeek === selectedDate.getDay())
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(cls => {
                          const status = getClassStatus(cls.id, selectedDate);
                          return (
                            <div 
                              key={cls.id} 
                              className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition-all",
                                status === 'completed' ? "bg-green-500/5 border-green-500/20" : 
                                status === 'canceled' ? "bg-red-500/5 border-red-500/20 opacity-60" : "bg-muted/20 border-border/40 hover:bg-muted/30"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "p-3 rounded-lg",
                                  status === 'completed' ? "bg-green-500/10 text-green-500" : 
                                  status === 'canceled' ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                                )}>
                                  {status === 'completed' ? <CheckCircle className="w-5 h-5" /> : 
                                   status === 'canceled' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{cls.name}</h4>
                                    {status !== 'scheduled' && (
                                      <Badge variant="outline" className={cn(
                                        "text-[10px] uppercase tracking-wider",
                                        status === 'completed' ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"
                                      )}>
                                        {status}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{cls.startTime} - {cls.endTime} • {getTrainerName(cls.trainerId)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                      Status
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="glass-card">
                                    <DropdownMenuItem onClick={() => handleStatusChange(cls.id, selectedDate, 'scheduled')}>
                                      <Clock className="w-4 h-4 mr-2" />
                                      Scheduled
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(cls.id, selectedDate, 'completed')} className="text-green-500">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(cls.id, selectedDate, 'canceled')} className="text-red-500">
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Mark Canceled
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="outline" size="sm" onClick={() => openAttendanceDialog(cls)} disabled={status === 'canceled'}>
                                  Mark Attendance
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(cls)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    {classes.filter(c => c.dayOfWeek === selectedDate.getDay()).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
                        <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p>No classes scheduled for this day</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card border-none">
                <CardHeader className="pb-2">
                  <CardDescription>Monthly Sessions</CardDescription>
                  <CardTitle className="text-2xl">{monthlyAttendance.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Select value={historyMonth} onValueChange={setHistoryMonth}>
                      <SelectTrigger className="h-8 text-xs bg-muted/50">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none">
                <CardHeader className="pb-2">
                  <CardDescription>Yearly Sessions</CardDescription>
                  <CardTitle className="text-2xl">{yearlyAttendance.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={historyYear} onValueChange={setHistoryYear}>
                    <SelectTrigger className="h-8 text-xs bg-muted/50">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="glass-card border-none">
                <CardHeader className="pb-2">
                  <CardDescription>Most Popular Class</CardDescription>
                  <CardTitle className="text-xl truncate">
                    {classStats.sort((a, b) => b.count - a.count)[0]?.name || 'N/A'}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card className="glass-card border-none">
                <CardHeader className="pb-2">
                  <CardDescription>Unique Participants</CardDescription>
                  <CardTitle className="text-2xl">
                    {new Set(monthlyAttendance.map(a => a.memberId)).size}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle>Attendance Log</CardTitle>
                <CardDescription>Detailed breakdown of classes taken in {new Date(2024, parseInt(historyMonth) - 1).toLocaleString('default', { month: 'long' })} {historyYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {monthlyAttendance
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(record => {
                        const cls = classes.find(c => c.id === record.classId);
                        const member = members.find(m => m.id === record.memberId);
                        return (
                          <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {member?.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{member?.name}</p>
                                <p className="text-[10px] text-muted-foreground">{cls?.name} • {record.date} at {record.checkInTime}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500 border-none">
                              Attended
                            </Badge>
                          </div>
                        );
                      })}
                    {monthlyAttendance.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground/50">
                        No attendance records found for this period
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Class Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-none">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
          </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Class Name</Label>
                  <Input 
                    placeholder="e.g. Advanced BJJ" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Discipline</Label>
                  <Select 
                    value={formData.disciplineId} 
                    onValueChange={(v) => setFormData({...formData, disciplineId: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARTIAL_ART_DISCIPLINES.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Day of Week</Label>
                <Select 
                  value={formData.dayOfWeek?.toString()} 
                  onValueChange={(v) => setFormData({...formData, dayOfWeek: parseInt(v)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Trainer</Label>
                <Select 
                  value={formData.trainerId} 
                  onValueChange={(v) => setFormData({...formData, trainerId: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input 
                  type="time" 
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Min Belt</Label>
                <Select 
                  value={formData.beltMin} 
                  onValueChange={(v: BeltRank) => setFormData({...formData, beltMin: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {belts.map(b => (
                      <SelectItem key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Max Belt</Label>
                <Select 
                  value={formData.beltMax} 
                  onValueChange={(v: BeltRank) => setFormData({...formData, beltMax: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {belts.map(b => (
                      <SelectItem key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddClass} className="cyber-button">Create Class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-none">
          <DialogHeader>
            <DialogTitle>Edit Class: {selectedClass?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Class Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Day of Week</Label>
                <Select 
                  value={formData.dayOfWeek?.toString()} 
                  onValueChange={(v) => setFormData({...formData, dayOfWeek: parseInt(v)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Trainer</Label>
                <Select 
                  value={formData.trainerId} 
                  onValueChange={(v) => setFormData({...formData, trainerId: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input 
                  type="time" 
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedClass) {
                  deleteClass(selectedClass.id);
                  setIsEditDialogOpen(false);
                  toast.success('Class deleted');
                }
              }}
            >
              Delete Class
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditClass} className="cyber-button">Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="sm:max-w-[400px] glass-card border-none">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <CardDescription>{selectedClass?.name} • {selectedClass?.startTime}</CardDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Select Member</Label>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {members.filter(m => m.status === 'active').map(member => {
                  const isCheckedIn = attendance.some(a => 
                    a.classId === selectedClass?.id && 
                    a.memberId === member.id && 
                    a.date === new Date().toISOString().split('T')[0]
                  );
                  return (
                    <div 
                      key={member.id} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        isCheckedIn ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border/40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {member.name[0]}
                        </div>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                      {isCheckedIn ? (
                        <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Checked In</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleMarkAttendance(member.id)}
                        >
                          Check In
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button className="w-full cyber-button" onClick={() => setIsAttendanceDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SchedulePage;
