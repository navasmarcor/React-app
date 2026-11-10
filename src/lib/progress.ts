import { gpa4, parseMark } from './schools';
import type { StringKey } from './i18n';
import type { AppState } from './store';

export type Step = { key: StringKey; done: boolean; tab: 'profile' | 'email' };

/** The checklist on Home, in the order coaches care about. */
export function profileSteps(s: AppState): Step[] {
  const p = s.profile;
  return [
    { key: 'step_pb', done: p.pbs.some((pb) => !isNaN(parseMark(pb.ev, pb.mark)) && pb.meet.trim().length > 0), tab: 'profile' },
    { key: 'step_video', done: p.videos.some((v) => v.trim().length > 0), tab: 'profile' },
    { key: 'step_gpa', done: gpa4(p) > 0, tab: 'profile' },
    { key: 'step_photos', done: p.photos.track.length > 0 && p.photos.life.length > 0, tab: 'profile' },
    { key: 'step_email', done: Object.values(s.outreach).some((o) => o.status > 0), tab: 'email' },
  ];
}

export function strengthOf(steps: Step[]) {
  const done = steps.filter((x) => x.done).length;
  return Math.round(20 + (done / steps.length) * 80);
}
