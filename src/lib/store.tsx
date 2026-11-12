import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Lang } from './i18n';
import type { Region, SchoolType } from './schools';
import { supabase } from './supabase';
import type { ThemeMode } from './theme';

export type PersonalBest = { ev: string; mark: string; meet: string };

export type Profile = {
  name: string;
  born: string;
  country: string;
  grad: string;
  school: string;
  email: string;
  gpa: string;
  scale: 'us' | 'fr' | 'es';
  sat: string;
  english: 'Native' | 'C1' | 'B2' | 'B1' | 'A2';
  level: 'both' | SchoolType;
  need: 'full' | 'part' | 'none';
  region: 'any' | Region;
  pbs: PersonalBest[];
  videos: string[];
  photos: { track: string[]; life: string[] };
};

export type CustomSchool = {
  id: string;
  name: string;
  type: SchoolType;
  region: Region;
  gpa: string;
  ev: string;
  mark: string;
};

/** 0 not sent, 1 sent, 2 replied, 3 visit, 4 offer */
export type OutreachStatus = 0 | 1 | 2 | 3 | 4;
/** `to` is the coach's email address the athlete entered for this school. */
export type Outreach = { status: OutreachStatus; sentAt?: string; to?: string };

export type Account = { name: string; email: string; role: 'athlete' | 'parent' };

export type AppState = {
  account: Account | null;
  signedIn: boolean;
  /** Supabase user id; null in the example-athlete demo. */
  userId: string | null;
  /** The athlete's coach link, e.g. mateo-ferrer-3fa2c. */
  slug: string | null;
  /** True while trying the app with the example athlete, which is never saved online. */
  demo: boolean;
  lang: Lang;
  theme: ThemeMode;
  profile: Profile;
  custom: CustomSchool[];
  outreach: Record<string, Outreach>;
};

export const emptyProfile = (name = '', email = ''): Profile => ({
  name,
  born: '',
  country: '',
  grad: '',
  school: '',
  email,
  gpa: '',
  scale: 'us',
  sat: '',
  english: 'B2',
  level: 'both',
  need: 'full',
  region: 'any',
  pbs: [{ ev: '800m', mark: '', meet: '' }],
  videos: [''],
  photos: { track: [], life: [] },
});

/** The example athlete from the designs, used for "Try with an example". */
export const exampleProfile: Profile = {
  name: 'Mateo Ferrer',
  born: '2008',
  country: 'Spain',
  grad: '2026',
  school: 'IES Joan Miró, Barcelona',
  email: 'mateo.ferrer@example.com',
  gpa: '7.6',
  scale: 'es',
  sat: '',
  english: 'B2',
  level: 'both',
  need: 'full',
  region: 'any',
  pbs: [
    { ev: '800m', mark: '1:57.40', meet: 'Spanish U18 Championships, Jun 2025' },
    { ev: '1500m', mark: '4:06.50', meet: 'Catalan Open, May 2025' },
  ],
  videos: ['https://youtube.com/watch?v=example800'],
  photos: { track: [], life: [] },
};

const initial: AppState = {
  account: null,
  signedIn: false,
  userId: null,
  slug: null,
  demo: false,
  lang: 'en',
  theme: 'system',
  profile: emptyProfile(),
  custom: [],
  outreach: {},
};

const KEY = 'react-app/state/v1';

export type SyncState = 'idle' | 'saving' | 'saved' | 'error';

type Store = {
  ready: boolean;
  state: AppState;
  sync: SyncState;
  set: (patch: Partial<AppState>) => void;
  setProfile: (patch: Partial<Profile>) => void;
  signOut: () => Promise<void>;
};

const StoreContext = createContext<Store | null>(null);

/** A link that stays the same even if the athlete changes their name, so sent emails keep working. */
export function newSlug(name: string, userId: string) {
  return `${slugFor(name)}-${userId.replace(/-/g, '').slice(0, 5)}`;
}

async function loadRemote(userId: string) {
  const [pub, priv] = await Promise.all([
    supabase.from('profiles').select('slug, role, data').eq('id', userId).maybeSingle(),
    supabase.from('athlete_private').select('custom_schools, outreach').eq('id', userId).maybeSingle(),
  ]);
  if (pub.error) throw pub.error;
  if (priv.error) throw priv.error;
  return { pub: pub.data, priv: priv.data };
}

async function saveRemote(s: AppState) {
  if (!s.userId || !s.slug) return;
  const now = new Date().toISOString();
  const [a, b] = await Promise.all([
    supabase.from('profiles').upsert({ id: s.userId, slug: s.slug, role: s.account?.role ?? 'athlete', data: s.profile, updated_at: now }),
    supabase.from('athlete_private').upsert({ id: s.userId, custom_schools: s.custom, outreach: s.outreach, updated_at: now }),
  ]);
  if (a.error) throw a.error;
  if (b.error) throw b.error;
}

/**
 * Holds the athlete's data. It is cached on the device and, for signed-in accounts,
 * saved to Supabase so the coach link works and the profile follows the athlete to any device.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncState>('idle');
  const loaded = useRef(false);
  const remoteLoaded = useRef<string | null>(null);

  // When someone signs in (or a saved session is found), load their profile from Supabase.
  const adoptSession = useCallback(async (session: Session | null) => {
    if (!session) {
      remoteLoaded.current = null;
      setState((s) => (s.demo ? s : { ...s, signedIn: false, userId: null }));
      return;
    }
    const user = session.user;
    if (remoteLoaded.current === user.id) return;
    const meta = (user.user_metadata ?? {}) as { name?: string; role?: Account['role'] };
    const account: Account = { name: meta.name ?? '', email: user.email ?? '', role: meta.role ?? 'athlete' };
    try {
      const { pub, priv } = await loadRemote(user.id);
      remoteLoaded.current = user.id;
      setState((s) => {
        const sameUser = s.userId === user.id;
        const profile: Profile = pub?.data
          ? { ...emptyProfile(), ...(pub.data as Partial<Profile>) }
          : sameUser
            ? s.profile
            : emptyProfile(account.role === 'athlete' ? account.name : '', account.email);
        return {
          ...s,
          demo: false,
          account,
          signedIn: true,
          userId: user.id,
          slug: pub?.slug ?? (sameUser && s.slug ? s.slug : newSlug(profile.name || account.name, user.id)),
          profile,
          custom: (priv?.custom_schools as CustomSchool[] | undefined) ?? (sameUser ? s.custom : []),
          outreach: (priv?.outreach as Record<string, Outreach> | undefined) ?? (sameUser ? s.outreach : {}),
        };
      });
      setSync('saved');
    } catch {
      // Offline or not set up yet: keep using what is on the device.
      setState((s) => ({ ...s, demo: false, account, signedIn: true, userId: user.id, slug: s.slug ?? newSlug(account.name, user.id) }));
      setSync('error');
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as Partial<AppState>;
          setState((s) => ({ ...s, ...saved, profile: { ...s.profile, ...saved.profile } }));
        }
      })
      .catch(() => {})
      .then(() => supabase.auth.getSession())
      .then(({ data }) => adoptSession(data.session))
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Run outside the auth callback, as Supabase recommends.
        setTimeout(() => adoptSession(session), 0);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [adoptSession]);

  // Cache on the device.
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  // Save to Supabase shortly after the athlete stops typing.
  useEffect(() => {
    if (!loaded.current || !state.userId || state.demo || remoteLoaded.current !== state.userId) return;
    const timer = setTimeout(() => {
      setSync('saving');
      saveRemote(state)
        .then(() => setSync('saved'))
        .catch(() => setSync('error'));
    }, 800);
    return () => clearTimeout(timer);
  }, [state]);

  const set = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);
  const setProfile = useCallback(
    (patch: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
    [],
  );
  const signOut = useCallback(async () => {
    setState((s) => ({ ...s, signedIn: false, demo: false }));
    await supabase.auth.signOut().catch(() => {});
  }, []);

  const value = useMemo(() => ({ ready, state, sync, set, setProfile, signOut }), [ready, state, sync, set, setProfile, signOut]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

export function slugFor(name: string) {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]+/g, '-')
      .replace(/^-|-$/g, '') || 'athlete'
  );
}

