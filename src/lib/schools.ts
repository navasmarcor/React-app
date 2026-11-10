import type { Profile, CustomSchool } from './store';

/** Lower is better for timed events, higher is better for jumps. */
export const EVENTS: Record<string, { low: boolean }> = {
  '100m': { low: true },
  '400m': { low: true },
  '800m': { low: true },
  '1500m': { low: true },
  'Long jump': { low: false },
  'High jump': { low: false },
};
export const EVENT_NAMES = Object.keys(EVENTS);

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
};

/** Sample schools with made-up standards, used until the real school database exists. */
export const SAMPLE_SCHOOLS: School[] = [
  { id: 'northfield', name: 'Northfield State University', type: 'college', division: 'NCAA D1', region: 'Midwest', gpa: 3.3, scholarship: 'full', std: { '100m': [10.55, 10.85, 11.1], '400m': [47.2, 48.6, 50], '800m': [110.5, 113, 116], '1500m': [228, 234, 242], 'Long jump': [7.45, 7.1, 6.8], 'High jump': [2.12, 2.04, 1.98] } },
  { id: 'bayview', name: 'Bayview College', type: 'college', division: 'NCAA D2', region: 'West', gpa: 3.0, scholarship: 'part', std: { '100m': [10.8, 11.05, 11.3], '400m': [48.4, 49.8, 51.5], '800m': [113, 116, 120], '1500m': [234, 242, 250], 'Long jump': [7.1, 6.8, 6.5], 'High jump': [2.03, 1.96, 1.9] } },
  { id: 'granite', name: 'Granite Ridge University', type: 'college', division: 'NCAA D1', region: 'Northeast', gpa: 3.6, scholarship: 'full', std: { '100m': [10.45, 10.75, 11], '400m': [46.8, 48.2, 49.6], '800m': [109.5, 112, 115], '1500m': [226, 232, 240], 'Long jump': [7.55, 7.2, 6.9], 'High jump': [2.15, 2.07, 2] } },
  { id: 'cedar', name: 'Cedar Plains College', type: 'college', division: 'NAIA', region: 'South', gpa: 2.8, scholarship: 'part', std: { '100m': [10.95, 11.2, 11.5], '400m': [49, 50.5, 52.5], '800m': [115, 118, 122], '1500m': [238, 246, 256], 'Long jump': [6.95, 6.6, 6.3], 'High jump': [1.98, 1.92, 1.85] } },
  { id: 'lakeshore', name: 'Lakeshore Tech', type: 'college', division: 'NCAA D3', region: 'Midwest', gpa: 3.5, scholarship: 'fin', std: { '100m': [11, 11.2, 11.45], '400m': [49.5, 50.8, 52.5], '800m': [116, 118.5, 122], '1500m': [240, 247, 255], 'Long jump': [6.8, 6.55, 6.3], 'High jump': [1.95, 1.9, 1.85] } },
  { id: 'sierra', name: 'Sierra Vista Community College', type: 'college', division: 'NJCAA', region: 'West', gpa: 2.5, scholarship: 'full', std: { '100m': [10.9, 11.15, 11.4], '400m': [48.8, 50.2, 52], '800m': [114, 117, 121], '1500m': [236, 244, 252], 'Long jump': [7, 6.7, 6.4], 'High jump': [2, 1.94, 1.88] } },
  { id: 'atlantic', name: 'Atlantic Coast University', type: 'college', division: 'NCAA D1', region: 'South', gpa: 3.2, scholarship: 'full', std: { '100m': [10.5, 10.8, 11.05], '400m': [47, 48.4, 49.8], '800m': [110, 112.5, 115.5], '1500m': [227, 233, 241], 'Long jump': [7.5, 7.15, 6.85], 'High jump': [2.13, 2.05, 1.99] } },
  { id: 'hollis', name: 'Hollis Academy', type: 'boarding', division: 'Boarding, grades 9 to 12', region: 'Northeast', gpa: 3.4, scholarship: 'fin', std: { '100m': [11.1, 11.4, 11.8], '400m': [50, 52, 54], '800m': [117, 121, 126], '1500m': [242, 252, 262], 'Long jump': [6.7, 6.4, 6], 'High jump': [1.92, 1.85, 1.78] } },
  { id: 'pinecrest', name: 'Pinecrest School', type: 'boarding', division: 'Boarding, grades 9 to 12, PG', region: 'Northeast', gpa: 3.1, scholarship: 'fin', std: { '100m': [11.2, 11.5, 11.9], '400m': [50.5, 52.5, 55], '800m': [118, 122, 127], '1500m': [245, 255, 266], 'Long jump': [6.6, 6.3, 5.9], 'High jump': [1.9, 1.83, 1.75] } },
  { id: 'desert', name: 'Desert Mesa Prep', type: 'boarding', division: 'Boarding, grades 9 to 12', region: 'West', gpa: 2.9, scholarship: 'part', std: { '100m': [11.3, 11.6, 12], '400m': [51, 53, 56], '800m': [119, 123.5, 128], '1500m': [248, 258, 270], 'Long jump': [6.5, 6.2, 5.8], 'High jump': [1.88, 1.8, 1.72] } },
  { id: 'ambrose', name: 'St. Ambrose School', type: 'boarding', division: 'Boarding, grades 9 to 12', region: 'South', gpa: 3.7, scholarship: 'fin', std: { '100m': [11, 11.3, 11.7], '400m': [49.8, 51.5, 53.5], '800m': [116, 120, 124], '1500m': [240, 250, 260], 'Long jump': [6.8, 6.5, 6.1], 'High jump': [1.94, 1.87, 1.8] } },
];

export function parseMark(ev: string, s: string): number {
  const v = String(s ?? '').trim().replace(',', '.');
  if (!v || !EVENTS[ev]) return NaN;
  if (EVENTS[ev].low && v.includes(':')) {
    const [m, r] = v.split(':');
    return Number(m) * 60 + Number(r);
  }
  return parseFloat(v);
}

export function formatMark(ev: string, v: number): string {
  if (!EVENTS[ev]?.low) return `${v.toFixed(2)} m`;
  if (v >= 60) {
    const m = Math.floor(v / 60);
    return `${m}:${(v - m * 60).toFixed(2).padStart(5, '0')}`;
  }
  return v.toFixed(2);
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
  return SAMPLE_SCHOOLS.map((school) => ({ school, score: scoreSchool(school, p, ov) }))
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
    const marks = [...new Set(SAMPLE_SCHOOLS.map((s) => s.std[pb.ev]?.[1]).filter((m): m is number => m != null && (low ? m < v : m > v)))]
      .sort((a, b) => (low ? b - a : a - b))
      .slice(0, 3);
    for (const m of marks) {
      const pbs = p.pbs.map((x, j) => (j === i ? { ...x, mark: formatMark(pb.ev, m).replace(' m', '') } : x));
      const gained = changed(matches(p, { pbs }));
      if (gained.length) {
        const reached = SAMPLE_SCHOOLS.filter((s) => {
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
