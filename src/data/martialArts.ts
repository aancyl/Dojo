export interface MartialArtDiscipline {
  id: string;
  name: string;
  category: string;
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
  { id: 'boxing', name: 'Boxing', category: 'Striking-based' },
  { id: 'kickboxing', name: 'Kickboxing', category: 'Striking-based' },
  { id: 'muay-thai', name: 'Muay Thai', category: 'Striking-based' },
  { id: 'karate', name: 'Karate', category: 'Striking-based' },
  { id: 'taekwondo', name: 'Taekwondo', category: 'Striking-based' },
  { id: 'kung-fu', name: 'Kung Fu (Wushu)', category: 'Striking-based' },
  { id: 'savate', name: 'Savate', category: 'Striking-based' },

  // Grappling-based
  { id: 'judo', name: 'Judo', category: 'Grappling-based' },
  { id: 'bjj', name: 'Brazilian Jiu-Jitsu (BJJ)', category: 'Grappling-based' },
  { id: 'wrestling', name: 'Wrestling (Freestyle, Greco-Roman)', category: 'Grappling-based' },
  { id: 'sambo', name: 'Sambo', category: 'Grappling-based' },
  { id: 'shuai-jiao', name: 'Shuai Jiao', category: 'Grappling-based' },

  // Mixed and full-contact
  { id: 'mma', name: 'Mixed Martial Arts (MMA)', category: 'Mixed and full-contact' },
  { id: 'combat-sambo', name: 'Combat Sambo', category: 'Mixed and full-contact' },
  { id: 'vale-tudo', name: 'Vale Tudo', category: 'Mixed and full-contact' },

  // Weapon-based
  { id: 'kendo', name: 'Kendo', category: 'Weapon-based' },
  { id: 'fencing', name: 'Fencing', category: 'Weapon-based' },
  { id: 'eskrima', name: 'Eskrima / Kali / Arnis', category: 'Weapon-based' },
  { id: 'hema', name: 'HEMA (Historical European Martial Arts)', category: 'Weapon-based' },
  { id: 'iaido', name: 'Iaido', category: 'Weapon-based' },

  // Traditional
  { id: 'aikido', name: 'Aikido', category: 'Traditional' },
  { id: 'tai-chi', name: 'Tai Chi', category: 'Traditional' },
  { id: 'hapkido', name: 'Hapkido', category: 'Traditional' },
  { id: 'ninjutsu', name: 'Ninjutsu', category: 'Traditional' },
];
