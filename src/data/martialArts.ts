export interface MartialArtDiscipline {
  id: string;
  name: string;
  category: string;
  rankSystem: 'belt' | 'glove' | 'duan' | 'record' | 'level';
  ranks: string[];
}

export const MARTIAL_ART_CATEGORIES = [
  'Striking-based',
  'Grappling-based',
  'Mixed and full-contact',
  'Weapon-based',
  'Traditional',
];

export const MARTIAL_ART_DISCIPLINES: MartialArtDiscipline[] = [
  // Striking-based
  { 
    id: 'boxing', 
    name: 'Boxing', 
    category: 'Striking-based',
    rankSystem: 'record',
    ranks: ['Amateur', 'Professional']
  },
  { 
    id: 'kickboxing', 
    name: 'Kickboxing', 
    category: 'Striking-based',
    rankSystem: 'record',
    ranks: ['Beginner', 'Intermediate', 'Advanced', 'Professional']
  },
  { 
    id: 'muay-thai', 
    name: 'Muay Thai', 
    category: 'Striking-based',
    rankSystem: 'record',
    ranks: ['Student', 'Fighter', 'Kru']
  },
  { 
    id: 'karate', 
    name: 'Karate', 
    category: 'Striking-based',
    rankSystem: 'belt',
    ranks: ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']
  },
  { 
    id: 'taekwondo', 
    name: 'Taekwondo', 
    category: 'Striking-based',
    rankSystem: 'belt',
    ranks: ['white', 'yellow', 'green', 'blue', 'red', 'black']
  },
  { 
    id: 'kung-fu', 
    name: 'Kung Fu (Wushu)', 
    category: 'Striking-based',
    rankSystem: 'duan',
    ranks: ['Duan 1', 'Duan 2', 'Duan 3', 'Duan 4', 'Duan 5', 'Duan 6', 'Duan 7', 'Duan 8', 'Duan 9']
  },
  { 
    id: 'savate', 
    name: 'Savate', 
    category: 'Striking-based',
    rankSystem: 'glove',
    ranks: ['blue', 'green', 'red', 'white', 'yellow', 'silver']
  },

  // Grappling-based
  { 
    id: 'judo', 
    name: 'Judo', 
    category: 'Grappling-based',
    rankSystem: 'belt',
    ranks: ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']
  },
  { 
    id: 'bjj', 
    name: 'Brazilian Jiu-Jitsu (BJJ)', 
    category: 'Grappling-based',
    rankSystem: 'belt',
    ranks: ['white', 'blue', 'purple', 'brown', 'black', 'red-black', 'red-white', 'red']
  },
  { 
    id: 'wrestling', 
    name: 'Wrestling (Freestyle, Greco-Roman)', 
    category: 'Grappling-based',
    rankSystem: 'record',
    ranks: ['Novice', 'Varsity', 'National', 'International']
  },
  { 
    id: 'sambo', 
    name: 'Sambo', 
    category: 'Grappling-based',
    rankSystem: 'level',
    ranks: ['Class III', 'Class II', 'Class I', 'Candidate for Master', 'Master', 'Grandmaster']
  },
  { 
    id: 'shuai-jiao', 
    name: 'Shuai Jiao', 
    category: 'Grappling-based',
    rankSystem: 'belt',
    ranks: ['white', 'green', 'blue', 'black']
  },

  // Mixed and full-contact
  { 
    id: 'mma', 
    name: 'Mixed Martial Arts (MMA)', 
    category: 'Mixed and full-contact',
    rankSystem: 'record',
    ranks: ['Amateur', 'Professional', 'Champion']
  },
  { 
    id: 'combat-sambo', 
    name: 'Combat Sambo', 
    category: 'Mixed and full-contact',
    rankSystem: 'level',
    ranks: ['Class III', 'Class II', 'Class I', 'Candidate for Master', 'Master']
  },
  { 
    id: 'vale-tudo', 
    name: 'Vale Tudo', 
    category: 'Mixed and full-contact',
    rankSystem: 'record',
    ranks: ['Fighter']
  },

  // Weapon-based
  { 
    id: 'kendo', 
    name: 'Kendo', 
    category: 'Weapon-based',
    rankSystem: 'duan',
    ranks: ['1 Kyu', '1 Duan', '2 Duan', '3 Duan', '4 Duan', '5 Duan', '6 Duan', '7 Duan', '8 Duan']
  },
  { 
    id: 'fencing', 
    name: 'Fencing', 
    category: 'Weapon-based',
    rankSystem: 'level',
    ranks: ['Beginner', 'Intermediate', 'Advanced']
  },
  { 
    id: 'eskrima', 
    name: 'Eskrima / Kali / Arnis', 
    category: 'Weapon-based',
    rankSystem: 'level',
    ranks: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']
  },
  { 
    id: 'hema', 
    name: 'HEMA (Historical European Martial Arts)', 
    category: 'Weapon-based',
    rankSystem: 'level',
    ranks: ['Scholar', 'Free Scholar', 'Provost', 'Master']
  },
  { 
    id: 'iaido', 
    name: 'Iaido', 
    category: 'Weapon-based',
    rankSystem: 'duan',
    ranks: ['1 Kyu', '1 Duan', '2 Duan', '3 Duan', '4 Duan', '5 Duan']
  },

  // Traditional
  { 
    id: 'aikido', 
    name: 'Aikido', 
    category: 'Traditional',
    rankSystem: 'belt',
    ranks: ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']
  },
  { 
    id: 'tai-chi', 
    name: 'Tai Chi', 
    category: 'Traditional',
    rankSystem: 'level',
    ranks: ['Beginner', 'Intermediate', 'Advanced']
  },
  { 
    id: 'hapkido', 
    name: 'Hapkido', 
    category: 'Traditional',
    rankSystem: 'belt',
    ranks: ['white', 'yellow', 'green', 'blue', 'red', 'black']
  },
  { 
    id: 'ninjutsu', 
    name: 'Ninjutsu', 
    category: 'Traditional',
    rankSystem: 'belt',
    ranks: ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black']
  },
];

export const getDisciplineRanks = (disciplineId?: string): string[] => {
  const discipline = MARTIAL_ART_DISCIPLINES.find(d => d.id === disciplineId);
  return discipline?.ranks || ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'red', 'black', 'gold'];
};

export const getRankSystem = (disciplineId?: string) => {
  const discipline = MARTIAL_ART_DISCIPLINES.find(d => d.id === disciplineId);
  return discipline?.rankSystem || 'belt';
};
