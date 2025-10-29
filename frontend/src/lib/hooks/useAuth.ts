import { useAtomValue, useSetAtom } from 'jotai';
import { authAtom, authUserAtom, clearAuthAtom, setAuthAtom } from '../../store/auth';

export const useAuth = () => {
  const auth = useAtomValue(authAtom);
  const user = useAtomValue(authUserAtom);
  const setAuth = useSetAtom(setAuthAtom);
  const clearAuth = useSetAtom(clearAuthAtom);

  return {
    auth,
    user,
    isAuthenticated: Boolean(auth?.accessToken),
    setAuth,
    clearAuth,
  };
};
