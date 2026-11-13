import { REAL_SCHOOLS } from './school-data';
import type { Profile, CustomSchool } from './store';

export type EventGroup = 'sprints' | 'hurdles' | 'distance' | 'jumps' | 'throws' | 'combined';
export type EventUnit = 'time' | 'm' | 'pts';
type EventDef = { group: EventGroup; unit: EventUnit; low: boolean; hint: string };

const ev = (group: EventGroup, unit: EventUnit, hint: string): EventDef => ({ group, unit, low: unit === 'time', hint });

/**
 * Every track and field event an athlete can list. Times are lower-is-better; distances and
 * combined-event points are higher-is-better. Keys are stored in saved profiles, so never rename one.
 */
export const EVENTS: Record<string, EventDef> = {
  '60m': ev('sprints', 'time', '6.95'),
  '100m': ev('sprints', 'time', '10.85'),
  '200m': ev('sprints', 'time', '21.90'),
  '300m': ev('sprints', 'time', '35.20'),
  '400m': ev('sprints', 'time', '48.60'),
  '60m hurdles': ev('hurdles', 'time', '8.20'),
  '100m hurdles': ev('hurdles', 'time', '14.10'),
  '110m hurdles': ev('hurdles', 'time', '14.50'),
  '300m hurdles': ev('hurdles', 'time', '38.80'),
  '400m hurdles': ev('hurdles', 'time', '53.80'),
  '800m': ev('distance', 'time', '1:54.80'),
  '1500m': ev('distance', 'time', '3:58.00'),
  '1600m': ev('distance', 'time', '4:13.00'),
  Mile: ev('distance', 'time', '4:15.00'),
  '3000m': ev('distance', 'time', '8:35.00'),
  '3200m': ev('distance', 'time', '9:20.00'),
  '5000m': ev('distance', 'time', '15:00.00'),
  '10,000m': ev('distance', 'time', '31:10.00'),
  '2000m steeplechase': ev('distance', 'time', '6:08.00'),
  '3000m steeplechase': ev('distance', 'time', '9:25.00'),
  '5K cross country': ev('distance', 'time', '15:50.00'),
  '5000m race walk': ev('distance', 'time', '22:00.00'),
  'High jump': ev('jumps', 'm', '2.04'),
  'Pole vault': ev('jumps', 'm', '4.60'),
  'Long jump': ev('jumps', 'm', '7.10'),
  'Triple jump': ev('jumps', 'm', '14.70'),
  'Shot put': ev('throws', 'm', '15.80'),
  Discus: ev('throws', 'm', '48.00'),
  Javelin: ev('throws', 'm', '57.00'),
  Hammer: ev('throws', 'm', '52.00'),
  Pentathlon: ev('combined', 'pts', '3500'),
  Heptathlon: ev('combined', 'pts', '4600'),
  Decathlon: ev('combined', 'pts', '6300'),
};
export const EVENT_NAMES = Object.keys(EVENTS);
export const EVENT_GROUPS: EventGroup[] = ['sprints', 'hurdles', 'distance', 'jumps', 'throws', 'combined'];

export type SchoolType = 'college' | 'boarding';
export type Region = 'Northeast' | 'South' | 'Midwest' | 'West';
export type Scholarship = 'full' | 'part' | 'fin';
export type Tier = 'Likely' | 'Target' | 'Reach';

export type School = {
  id: string;
  name: string;
  type: SchoolType;
  division: string;
  region: Region;
  gpa: number;
  scholarship: Scholarship;
  /** [scholarship, recruit, walk-on] standards per event */
  std: Partial<Record<string, [number, number, number]>>;
  custom?: boolean;
  /** Who the app emails at this school. */
  coach?: Coach;
};

export type Coach = { name: string; title: string; email: string; /** false for a shared office address */ person: boolean };

/** A school from the real list, before its standards are filled in. */
export type RealSchool = Omit<School, 'std' | 'custom'> & {
  state: string;
  coach: Coach;
  /** The official page the coach contact was copied from. */
  source: string;
  /** The staff year that page shows. */
  season?: string;
};

/**
 * Estimated standards at a mid-level NCAA D1 program: [scholarship, recruit, walk-on] per event.
 * These are not any school's published numbers.
 */
const D1_REFERENCE: Record<string, [number, number, number]> = {
  '60m': [6.75, 6.92, 7.08],
  '100m': [10.55, 10.85, 11.1],
  '200m': [21.1, 21.7, 22.3],
  '300m': [34, 35, 36.2],
  '400m': [47.2, 48.6, 50],
  '60m hurdles': [7.95, 8.2, 8.5],
  '100m hurdles': [13.6, 14.1, 14.6],
  '110m hurdles': [14, 14.5, 15],
  '300m hurdles': [37.5, 38.8, 40.2],
  '400m hurdles': [52, 53.8, 55.6],
  '800m': [110.5, 113, 116],
  '1500m': [228, 234, 242],
  '1600m': [246, 253, 262],
  Mile: [248, 255, 264],
  '3000m': [500, 515, 535],
  '3200m': [545, 560, 580],
  '5000m': [870, 900, 935],
  '10,000m': [1810, 1870, 1940],
  '2000m steeplechase': [355, 368, 384],
  '3000m steeplechase': [545, 565, 590],
  '5K cross country': [920, 950, 990],
  '5000m race walk': [1260, 1320, 1400],
  'High jump': [2.12, 2.04, 1.98],
  'Pole vault': [4.9, 4.6, 4.3],
  'Long jump': [7.45, 7.1, 6.8],
  'Triple jump': [15.3, 14.7, 14.1],
  'Shot put': [17, 15.8, 14.6],
  Discus: [52, 48, 44],
  Javelin: [62, 57, 52],
  Hammer: [58, 52, 46],
  Pentathlon: [3800, 3500, 3200],
  Heptathlon: [5000, 4600, 4200],
  Decathlon: [6800, 6300, 5800],
};

/** How much slower a level's marks are than D1 (times are multiplied, distances and points divided by its square). */
const LEVEL_FACTOR: Record<string, number> = { 'NCAA D1': 1, 'NCAA D2': 1.025, NAIA: 1.03, NJCAA: 1.03, 'NCAA D3': 1.045, 'Boarding school': 1.08 };
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

/** Estimated standards for every event at a given level. */
export function standardsFor(division: string): School['std'] {
  const f = LEVEL_FACTOR[division] ?? 1;
  const std: School['std'] = {};
  for (const [name, marks] of Object.entries(D1_REFERENCE)) {
    const { unit } = EVENTS[name];
    std[name] = marks.map((m) => (unit === 'time' ? round(m * f, 2) : unit === 'm' ? round(m / f ** 2, 2) : Math.round(m / f ** 2))) as [number, number, number];
  }
  return std;
}

/** The real schools, each with its coach contact and estimated standards for its level. */
export const SCHOOLS: School[] = REAL_SCHOOLS.map((s) => ({ ...s, std: standardsFor(s.division) }));

export function parseMark(ev: string, s: string): number {
  const raw = String(s ?? '').trim();
  const def = EVENTS[ev];
  if (!raw || !def) return NaN;
  // Points are whole numbers, so "6,450" and "6.450" both mean 6450.
  if (def.unit === 'pts') return parseInt(raw.replace(/\D/g, ''), 10);
  const v = raw.replace(',', '.');
  if (def.low && v.includes(':')) {
    const parts = v.split(':').map(Number);
    return parts.reduce((acc, x) => acc * 60 + x, 0);
  }
  return parseFloat(v);
}

export function formatMark(ev: string, v: number): string {
  const def = EVENTS[ev];
  if (def?.unit === 'pts') return `${Math.round(v)} pts`;
  if (!def?.low) return `${v.toFixed(2)} m`;
  if (v >= 3600) {
    const h = Math.floor(v / 3600);
    const m = Math.floor((v - h * 3600) / 60);
    return `${h}:${String(m).padStart(2, '0')}:${(v - h * 3600 - m * 60).toFixed(2).padStart(5, '0')}`;
  }
  if (v >= 60) {
    const m = Math.floor(v / 60);
    return `${m}:${(v - m * 60).toFixed(2).padStart(5, '0')}`;
  }
  return v.toFixed(2);
}

/** The mark as an athlete would type it: no unit after it. */
export function markInput(ev: string, v: number): string {
  return formatMark(ev, v).replace(/ (m|pts)$/, '');
}

/** Converts the athlete's grade to the U.S. 4.0 scale. */
export function gpa4(p: Pick<Profile, 'gpa' | 'scale'>): number {
  const g = Number(p.gpa);
  if (!g) return 0;
  const v = p.scale === 'fr' ? (g / 20) * 4 : p.scale === 'es' ? ((g - 5) / 5) * 2 + 2 : g;
  return Math.max(0, Math.min(4, Math.round(v * 100) / 100));
}

/** Turns a U.S. 4.0 target back into the athlete's own grading scale, for advice text. */
export function fromGpa4(target: number, scale: Profile['scale']): string {
  if (scale === 'fr') return `${((target / 4) * 20).toFixed(1)}/20`;
  if (scale === 'es') return `${(((target - 2) / 2) * 5 + 5).toFixed(1)}/10`;
  return target.toFixed(1);
}

type Best = { a: number; ev: string; v: number; low: boolean };

function bestFor(s: School, p: Profile): Best | null {
  let best: Best | null = null;
  for (const pb of p.pbs) {
    const v = parseMark(pb.ev, pb.mark);
    const std = s.std[pb.ev];
    if (isNaN(v) || !std) continue;
    const [sc, rc, wo] = std;
    const low = EVENTS[pb.ev].low;
    const better = (a: number, b: number) => (low ? a <= b : a >= b);
    // Athletic score out of 100: scholarship 100, recruit 80, walk-on 55, then drops off.
    let a: number;
    if (better(v, sc)) a = 100;
    else if (better(v, rc)) a = 80 + 20 * (low ? (rc - v) / (rc - sc) : (v - rc) / (sc - rc));
    else if (better(v, wo)) a = 55 + 25 * (low ? (wo - v) / (wo - rc) : (v - wo) / (rc - wo));
    else a = Math.max(0, 55 - (low ? (v - wo) / wo : (wo - v) / wo) * 900);
    if (!best || a > best.a) best = { a, ev: pb.ev, v, low };
  }
  return best;
}

export type Score = { total: number; best: Best; gpa: number };
export type Overrides = { gpa?: number; sat?: number; pbs?: Profile['pbs'] };

/** Fit = marks 45%, grades 30%, eligibility 15%, preferences 10%. */
export function scoreSchool(s: School, p: Profile, ov: Overrides = {}): Score | null {
  const prof = ov.pbs ? { ...p, pbs: ov.pbs } : p;
  const best = bestFor(s, prof);
  if (!best) return null;
  const g = ov.gpa ?? gpa4(p);
  const acad = Math.max(0, Math.min(100, 100 - (s.gpa - g) * 70));
  const sat = (ov.sat ?? Number(p.sat)) || 0;
  const acadAdj = s.type === 'college' && !sat ? acad * 0.9 : acad;
  const age = s.type === 'boarding' ? (Number(p.grad) >= 2026 ? 100 : 60) : 100;
  let pref = 100;
  if (p.level !== 'both' && p.level !== s.type) pref -= 60;
  if (p.region !== 'any' && p.region !== s.region) pref -= 40;
  if (p.need === 'full' && s.scholarship !== 'full') pref -= 30;
  if (p.need === 'part' && s.scholarship === 'fin') pref -= 15;
  const total = Math.round(best.a * 0.45 + acadAdj * 0.3 + age * 0.15 + Math.max(0, pref) * 0.1);
  return { total, best, gpa: g };
}

export function tierOf(x: number): Tier | null {
  return x >= 75 ? 'Likely' : x >= 50 ? 'Target' : x >= 30 ? 'Reach' : null;
}

export type Match = { school: School; score: Score; tier: Tier };

export function matches(p: Profile, ov: Overrides = {}): Match[] {
  return SCHOOLS.map((school) => ({ school, score: scoreSchool(school, p, ov) }))
    .filter((x): x is { school: School; score: Score } => !!x.score && !!tierOf(x.score.total))
    .map((x) => ({ ...x, tier: tierOf(x.score.total)! }))
    .sort((a, b) => b.score.total - a.score.total);
}

/** Schools the athlete adds. Their recruit mark sets the standards around it. */
export function toSchool(c: CustomSchool): School {
  const std: School['std'] = {};
  const r = parseMark(c.ev, c.mark);
  if (!isNaN(r)) std[c.ev] = EVENTS[c.ev].low ? [r * 0.98, r, r * 1.03] : [r * 1.04, r, r * 0.96];
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    division: c.type === 'boarding' ? 'Boarding school' : 'College',
    region: c.region,
    gpa: Number(c.gpa) || 3.0,
    scholarship: 'part',
    std,
    custom: true,
  };
}

/** How the athlete's best mark compares with a school's standards. */
export function compare(s: School, sc: Score): { rel: 'beat' | 'near' | 'below'; std: 's' | 'r' | 'w'; mark: number } {
  const b = sc.best;
  const [s1, r1, w1] = s.std[b.ev]!;
  const better = (a: number, c: number) => (b.low ? a <= c : a >= c);
  if (better(b.v, s1)) return { rel: 'beat', std: 's', mark: s1 };
  if (better(b.v, r1)) return { rel: 'near', std: 's', mark: s1 };
  if (better(b.v, w1)) return { rel: 'below', std: 'r', mark: r1 };
  return { rel: 'below', std: 'w', mark: w1 };
}

export type Tip =
  | { kind: 'mark'; n: number; ev: string; target: string; schools: string[] }
  | { kind: 'gpa'; n: number; target: string; schools: string[] }
  | { kind: 'sat'; n: number };

/** Changes ranked by how many schools each would add or move up a tier. */
export function adviceTips(p: Profile): Tip[] {
  const base = matches(p);
  const tierBy = new Map(base.map((m) => [m.school.id, m.tier]));
  const changed = (after: Match[]) => after.filter((m) => tierBy.get(m.school.id) !== m.tier);
  const tips: Tip[] = [];

  p.pbs.forEach((pb, i) => {
    const v = parseMark(pb.ev, pb.mark);
    if (isNaN(v)) return;
    const low = EVENTS[pb.ev].low;
    const marks = [...new Set(SCHOOLS.map((s) => s.std[pb.ev]?.[1]).filter((m): m is number => m != null && (low ? m < v : m > v)))]
      .sort((a, b) => (low ? b - a : a - b))
      .slice(0, 3);
    for (const m of marks) {
      const pbs = p.pbs.map((x, j) => (j === i ? { ...x, mark: markInput(pb.ev, m) } : x));
      const gained = changed(matches(p, { pbs }));
      if (gained.length) {
        const reached = SCHOOLS.filter((s) => {
          const r = s.std[pb.ev]?.[1];
          return r != null && (low ? m <= r && v > r : m >= r && v < r);
        }).map((s) => s.name);
        tips.push({ kind: 'mark', n: gained.length, ev: pb.ev, target: formatMark(pb.ev, m), schools: reached });
        break;
      }
    }
  });

  const g = gpa4(p);
  for (const tg of [3.3, 3.5, 3.7]) {
    if (tg <= g) continue;
    const up = changed(matches(p, { gpa: tg }));
    if (up.length) {
      tips.push({ kind: 'gpa', n: up.length, target: fromGpa4(tg, p.scale), schools: up.map((m) => m.school.name) });
      break;
    }
  }

  if (!Number(p.sat)) {
    const up = changed(matches(p, { sat: 1200 }));
    if (up.length) tips.push({ kind: 'sat', n: up.length });
  }
  return tips.sort((a, b) => b.n - a.n);
}

export type Check = 'video' | 'old' | 'sat' | 'english' | 'photos' | 'transcript';

export function profileChecks(p: Profile, tips: Tip[]): Check[] {
  const out: Check[] = [];
  if (!p.videos.some((v) => v.trim())) out.push('video');
  if (p.pbs.some((pb) => /20(2[0-4]|1\d)/.test(pb.meet))) out.push('old');
  if (!Number(p.sat) && !tips.some((x) => x.kind === 'sat')) out.push('sat');
  if (p.english !== 'Native') out.push('english');
  if (!p.photos.track.length && !p.photos.life.length) out.push('photos');
  return out;
}
