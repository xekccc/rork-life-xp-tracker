export type RPGAttribute = 'vitality' | 'wisdom' | 'connection' | 'creation' | 'grit' | 'serenity';

export interface Moment {
  id: string;
  title: string;
  icon: 'coffee' | 'brain' | 'heart' | 'sun' | 'book' | 'dumbbell' | 'music' | 'star' | 'code' | 'palette' | 'target' | 'leaf';
  xp: number;
  time: string;
  category: 'joy' | 'focus' | 'connection' | 'health' | 'discipline' | 'rest' | 'creative';
  duration: number;
}

export const categoryToAttribute: Record<Moment['category'], RPGAttribute> = {
  health: 'vitality',
  focus: 'wisdom',
  connection: 'connection',
  creative: 'creation',
  discipline: 'grit',
  rest: 'serenity',
  joy: 'vitality',
};

export const attributeLabels: Record<RPGAttribute, string> = {
  vitality: 'Vitality',
  wisdom: 'Wisdom',
  connection: 'Connection',
  creation: 'Creation',
  grit: 'Grit',
  serenity: 'Serenity',
};

export const todaysMoments: Moment[] = [
  {
    id: '1',
    title: 'Slow Morning Coffee',
    icon: 'coffee',
    xp: 15,
    time: '7:30 AM',
    category: 'joy',
    duration: 15,
  },
  {
    id: '2',
    title: 'Read 10 pages of Stoicism',
    icon: 'book',
    xp: 50,
    time: '8:15 AM',
    category: 'focus',
    duration: 30,
  },
  {
    id: '3',
    title: 'Call with Mom',
    icon: 'heart',
    xp: 100,
    time: '10:00 AM',
    category: 'connection',
    duration: 45,
  },
  {
    id: '4',
    title: 'Deep Work Session',
    icon: 'brain',
    xp: 120,
    time: '11:30 AM',
    category: 'focus',
    duration: 60,
  },
  {
    id: '5',
    title: 'Walked in the park',
    icon: 'sun',
    xp: 45,
    time: '1:00 PM',
    category: 'health',
    duration: 30,
  },
];

export const userData = {
  name: 'Alex',
  todayXP: 850,
  yesterdayXP: 720,
  dayProgress: 64,
  hoursLeft: 14,
  timeBreakdown: {
    focus: 35,
    joy: 25,
    rest: 40,
  },
};

export const categoryDefaultDurations: Record<Moment['category'], number> = {
  focus: 30,
  joy: 15,
  connection: 20,
  health: 30,
  discipline: 45,
  rest: 20,
  creative: 40,
};
