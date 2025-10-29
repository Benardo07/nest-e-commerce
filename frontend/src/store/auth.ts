import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { envConfig } from '../lib/env';

type AuthState = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  } | null;
};

const baseAuthAtom = atomWithStorage<AuthState | null>(
  envConfig.VITE_STORAGE_KEY,
  null,
);

export const authAtom = baseAuthAtom;

export const authTokenAtom = atom((get) => get(baseAuthAtom)?.accessToken ?? null);

export const authUserAtom = atom((get) => get(baseAuthAtom)?.user ?? null);

export const isAuthenticatedAtom = atom((get) => Boolean(get(baseAuthAtom)?.accessToken));

export const clearAuthAtom = atom(null, (_get, set) => set(baseAuthAtom, null));

export const setAuthAtom = atom(
  null,
  (_get, set, value: AuthState) => {
    set(baseAuthAtom, value);
  },
);
