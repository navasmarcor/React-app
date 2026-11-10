import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Lang } from './i18n';
import type { Region, SchoolType } from './schools';
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
export type Outreach = { status: OutreachStatus; sentAt?: string };

export type Account = { name: string; email: string; role: 'athlete' | 'parent' };

export type AppState = {
  account: Account | null;
  signedIn: boolean;
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
  lang: 'en',
  theme: 'system',
  profile: emptyProfile(),
  custom: [],
  outreach: {},
};

const KEY = 'react-app/state/v1';

type Store = {
  ready: boolean;
  state: AppState;
  set: (patch: Partial<AppState>) => void;
  setProfile: (patch: Partial<Profile>) => void;
  signOut: () => void;
};

const StoreContext = createContext<Store | null>(null);

/**
 * Keeps the athlete's data on the device for now.
 * Online accounts and the shareable coach link come with the accounts step.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as Partial<AppState>;
          setState((s) => ({ ...s, ...saved, profile: { ...s.profile, ...saved.profile } }));
        }
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const set = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);
  const setProfile = useCallback(
    (patch: Partial<Profile>) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
    [],
  );
  const signOut = useCallback(() => setState((s) => ({ ...s, signedIn: false })), []);

  const value = useMemo(() => ({ ready, state, set, setProfile, signOut }), [ready, state, set, setProfile, signOut]);
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

export const PROFILE_BASE_URL = 'https://reactapp.com/p/';
