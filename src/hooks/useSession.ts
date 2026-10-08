import { useCallback, useEffect, useRef, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthPayload, AuthSession as AppAuthSession } from '../core/types';
import { ApiError, authenticate, createApi, oauthAuthenticate } from '../services/api';
import { sessionStore } from '../services/session';

WebBrowser.maybeCompleteAuthSession();

// тот же webClientId, что был в GoogleSignin.configure() — переиспользуем
const GOOGLE_WEB_CLIENT_ID = '1049784473594-84e7qgofperqa9mebtiet8chid54vik4.apps.googleusercontent.com';

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
};

export function useSession() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<AppAuthSession | null>(null);
  const googleAuthResolver = useRef<{ resolve: () => void; reject: (e: Error) => void } | null>(null);

  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: { nonce: Math.random().toString(36).slice(2) },
    },
    GOOGLE_DISCOVERY
  );

  // лог один раз — этот URI нужно вписать в Google Cloud Console → Authorized redirect URIs
  useEffect(() => {
    console.log('[GoogleAuth] redirectUri →', redirectUri);
  }, [redirectUri]);

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

  // срабатывает когда юзер вернулся из браузера после Google-логина
  useEffect(() => {
    if (!response) return;
    const resolver = googleAuthResolver.current;
    googleAuthResolver.current = null;

    if (response.type === 'success') {
      const idToken = response.params.id_token;
      if (!idToken) {
        resolver?.reject(new Error('Google did not return an ID token.'));
        return;
      }
      oauthAuthenticate('GOOGLE', { idToken })
        .then(async (next) => {
          await sessionStore.save(next);
          setSession(next);
          resolver?.resolve();
        })
        .catch((e) => resolver?.reject(e instanceof Error ? e : new Error('Google sign-in failed.')));
    } else if (response.type === 'cancel' || response.type === 'dismiss') {
      // Юзер закрыл окно. Сессии нет, поэтому это НЕ успех: иначе онбординг решит,
      // что регистрация прошла, и дойдёт до paywall без аккаунта.
      // Вызывающий код различает этот случай по err.name === 'OAuthCancelled' и молча остаётся на экране.
      const cancelled = new Error('Sign-in cancelled.');
      cancelled.name = 'OAuthCancelled';
      resolver?.reject(cancelled);
    } else {
      resolver?.reject(new Error('Google sign-in failed.'));
    }
  }, [response]);

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

  const handleOAuthPress = async (provider: 'GOOGLE' | 'APPLE') => {
    if (provider === 'APPLE') {
      throw new Error('Apple sign-in ещё не подключён.');
    }
    if (!request) {
      throw new Error('Google sign-in is not ready yet, try again in a moment.');
    }
    return new Promise<void>((resolve, reject) => {
      googleAuthResolver.current = { resolve, reject };
      promptAsync();
    });
  };

  return { booting, session, setSession, signOut, handleAuth, handleOAuthPress };
}