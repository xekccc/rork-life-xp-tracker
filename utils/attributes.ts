import { Moment, RPGAttribute, categoryToAttribute, attributeLabels } from '@/mocks/moments';
import Colors from '@/constants/colors';

export interface AttributeData {
  attribute: RPGAttribute;
  label: string;
  xp: number;
  normalized: number;
  color: string;
}

export interface DayXP {
  date: string;
  xp: number;
  displayDate: string;
}

export interface LifetimeStats {
  totalXP: number;
  level: number;
  bestDay: { date: string; xp: number } | null;
  totalMoments: number;
  streakDays: number;
}

const attributeColors: Record<RPGAttribute, string> = {
  vitality: Colors.vitality,
  wisdom: Colors.wisdom,
  connection: Colors.connection,
  creation: Colors.creation,
  grit: Colors.grit,
  serenity: Colors.serenity,
};

const MAX_ATTRIBUTE_XP = 300;

export function calculateAttributes(moments: Moment[]): AttributeData[] {
  const attributeXP: Record<RPGAttribute, number> = {
    vitality: 0,
    wisdom: 0,
    connection: 0,
    creation: 0,
    grit: 0,
    serenity: 0,
  };

  moments.forEach((moment) => {
    const attribute = categoryToAttribute[moment.category];
    if (attribute) {
      attributeXP[attribute] += moment.xp;
    }
  });

  const attributes: RPGAttribute[] = ['vitality', 'wisdom', 'connection', 'creation', 'grit', 'serenity'];
  
  return attributes.map((attr) => ({
    attribute: attr,
    label: attributeLabels[attr],
    xp: attributeXP[attr],
    normalized: Math.min(100, (attributeXP[attr] / MAX_ATTRIBUTE_XP) * 100),
    color: attributeColors[attr],
  }));
}

export function calculateTodayXP(moments: Moment[]): number {
  const today = new Date().toDateString();
  return moments
    .filter((m) => {
      const momentDate = new Date().toDateString();
      return momentDate === today;
    })
    .reduce((sum, m) => sum + m.xp, 0);
}

export function calculateEfficiency(todayXP: number, dailyGoal: number = 1000): number {
  return Math.min(100, Math.round((todayXP / dailyGoal) * 100));
}

export function generateLast30Days(moments: Moment[]): DayXP[] {
  const days: DayXP[] = [];
  const today = new Date();
  const todayXP = moments.reduce((sum, m) => sum + m.xp, 0);

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();

    days.push({
      date: dateStr,
      xp: i === 0 ? todayXP : Math.floor(Math.random() * 800),
      displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
    });
  }

  return days;
}

export function calculateLifetimeStats(moments: Moment[]): LifetimeStats {
  const totalXP = moments.reduce((sum, m) => sum + m.xp, 0);
  const level = Math.floor(totalXP / 1000) + 1;

  const dayXPMap = new Map<string, number>();
  moments.forEach((m) => {
    const today = new Date().toDateString();
    const current = dayXPMap.get(today) || 0;
    dayXPMap.set(today, current + m.xp);
  });

  let bestDay: { date: string; xp: number } | null = null;
  dayXPMap.forEach((xp, date) => {
    if (!bestDay || xp > bestDay.xp) {
      bestDay = { date, xp };
    }
  });

  return {
    totalXP,
    level,
    bestDay,
    totalMoments: moments.length,
    streakDays: Math.floor(Math.random() * 14) + 1,
  };
}

export function getHeatmapColor(xp: number): string {
  if (xp === 0) return Colors.heatmapNone;
  if (xp < 500) return Colors.heatmapLow;
  return Colors.heatmapHigh;
}
