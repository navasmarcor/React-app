import { formatMark, gpa4, parseMark, type School } from './schools';
import { SITE_URL } from './config';
import { slugFor, type AppState, type Profile } from './store';

/** The athlete's coach link. */
export function linkSlug(s: Pick<AppState, 'slug' | 'profile'>) {
  return s.slug ?? slugFor(s.profile.name);
}

export function profileUrl(s: Pick<AppState, 'slug' | 'profile'>) {
  return `${SITE_URL}/p/${linkSlug(s)}`;
}

/** The first email to a coach. Always in English, because U.S. coaches read English. */
export function emailFor(s: School, p: Profile, url: string): { subject: string; body: string } {
  const bests = p.pbs.filter((pb) => !isNaN(parseMark(pb.ev, pb.mark)));
  const events = bests.map((pb) => pb.ev).join('/') || 'track';
  const lines = bests.map((pb) => `- ${pb.ev}: ${formatMark(pb.ev, parseMark(pb.ev, pb.mark))}${pb.meet ? ` (${pb.meet})` : ''}`);
  const g = gpa4(p);
  const subject = `${p.grad ? `${p.grad} ` : ''}${bests[0]?.ev ?? ''} prospect - ${p.name}${p.country ? `, ${p.country}` : ''}`.replace(/\s+/g, ' ').trim();
  const body = [
    `Dear ${s.type === 'boarding' ? 'Admissions and Athletics team' : 'Coach'},`,
    '',
    `My name is ${p.name}. I am a ${events} athlete${p.country ? ` from ${p.country}` : ''}${p.grad ? `, graduating in ${p.grad}` : ''}, and I am very interested in ${s.name}.`,
    '',
    `My profile, with race video, results and photos: ${url}`,
    '',
    ...(lines.length ? ['Personal bests:', ...lines, ''] : []),
    `Academics: ${g ? `GPA ${g.toFixed(2)} (U.S. 4.0 scale), ` : ''}English level ${p.english}${Number(p.sat) ? `, SAT ${p.sat}` : ''}.`,
    '',
    'I would be grateful to learn what it would take to join your program.',
    '',
    'Best regards,',
    p.name,
    p.email,
  ].join('\n');
  return { subject, body };
}
