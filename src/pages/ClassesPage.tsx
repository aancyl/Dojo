import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { MARTIAL_ART_DISCIPLINES } from '@/data/martialArts';
import { 
  Plus, Search, Filter, MoreVertical, 
  Users, Clock, MapPin, Edit2, Trash2,
  Dumbbell, GraduationCap, Info, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ClassesPage = () => {
  const { classes, trainers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState<string | 'all'>('all');

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDiscipline = filterDiscipline === 'all' || c.disciplineId === filterDiscipline;
      return matchesSearch && matchesDiscipline;
    });
  }, [classes, searchTerm, filterDiscipline]);

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
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Classes Management</h1>
          <p className="text-muted-foreground mt-1">Define and configure training programs</p>
        </div>
        <Button className="btn-cyber">
          <Plus className="w-4 h-4 mr-2" /> Add New Program
        </Button>
      </motion.div>

      {/* Info Card */}
      <motion.div variants={itemVariants} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-primary mb-1">About Programs</p>
          <p className="text-muted-foreground">
            This page is for managing your core training programs and their requirements. 
            To schedule specific class times, use the <strong>Schedule</strong> page.
          </p>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants} className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search programs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <Select value={filterDiscipline} onValueChange={setFilterDiscipline}>
            <SelectTrigger className="w-full md:w-[200px] bg-background/50">
              <Target className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Disciplines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disciplines</SelectItem>
              {MARTIAL_ART_DISCIPLINES.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Programs Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => {
          const trainer = trainers.find(t => t.id === cls.trainerId);
          return (
            <motion.div key={cls.id} variants={itemVariants}>
              <Card className="glass-card border-none hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Dumbbell className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                          {cls.maxCapacity} Max Students
                        </Badge>
                        {cls.disciplineId && (
                          <span className="text-[10px] font-bold text-primary uppercase">
                            {MARTIAL_ART_DISCIPLINES.find(d => d.id === cls.disciplineId)?.name}
                          </span>
                        )}
                      </div>
                    </div>

                  <CardTitle className="text-xl font-display mt-4">{cls.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <GraduationCap className="w-4 h-4" />
                    Rank: {cls.beltMin} to {cls.beltMax}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Primary Trainer</span>
                    </div>
                    <span className="font-medium">{trainer?.name || 'Unassigned'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Default Duration</span>
                    </div>
                    <span className="font-medium">60 mins</span>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" className="flex-1 glass-button">
                      <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" className="flex-1 glass-button text-rose-500 hover:text-rose-600">
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default ClassesPage;
