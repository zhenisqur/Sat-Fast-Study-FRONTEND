import { useCallback, useEffect, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthPayload, AuthSession } from '../core/types';
import { ApiError, authenticate, createApi, oauthAuthenticate } from '../services/api';
import { sessionStore } from '../services/session';

GoogleSignin.configure({
  webClientId: '1049784473594-84e7qgofperqa9mebtiet8chid54vik4.apps.googleusercontent.com',
});

export function useSession() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  const signOut = useCallback(async () => {
    await sessionStore.clear();
    setSession(null);
  }, []);

  useEffect(() => {
    const restore = async () => {
      const token = await sessionStore.read();
      if (!token) { setBooting(false); return; }
      const restoredApi = createApi(token, () => void signOut());
      try {
        setSession({ accessToken: token, user: await restoredApi.getProfile() });
      } catch {
        await sessionStore.clear();
      } finally {
        setBooting(false);
      }
    };
    restore();
  }, [signOut]);

  const handleAuth = async (mode: 'LOGIN' | 'REGISTER', payload: AuthPayload) => {
    const next = await authenticate(mode, payload);
    await sessionStore.save(next);
    setSession(next);
    try {
      const fullProfile = await createApi(next.accessToken, signOut).getProfile();
      setSession({ ...next, user: fullProfile });
    } catch {
      // не критично — Dashboard всё равно перезапросит профиль при следующем refreshUser
    }
  };

  const handleGoogleAuth = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;
    if (!idToken) throw new Error('Google did not return an ID token.');
    const next = await oauthAuthenticate('GOOGLE', { idToken });
    await sessionStore.save(next);
    setSession(next);
  };

  const handleOAuthPress = async (provider: 'GOOGLE' | 'APPLE') => {
    try {
      if (provider === 'GOOGLE') {
        await handleGoogleAuth();
      } else {
        throw new Error('Apple sign-in ещё не подключён.');
      }
    } catch (caught: any) {
      if (caught?.code === statusCodes.SIGN_IN_CANCELLED) return;
      throw caught instanceof Error ? caught : new Error('Sign-in failed. Please try again.');
    }
  };

  const refreshUser = async (api: ReturnType<typeof createApi> | null) => {
    if (!api || !session) return;
    try {
      setSession((prev) => (prev ? { ...prev } : prev)); // placeholder, реально см. ниже
    } catch {}
  };

  return { booting, session, setSession, signOut, handleAuth, handleOAuthPress };
}