import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from '../core/config';
import { AuthSession } from '../core/types';

export const sessionStore = {
  read: () => SecureStore.getItemAsync(TOKEN_KEY),
  save: (session: AuthSession) => SecureStore.setItemAsync(TOKEN_KEY, session.accessToken),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};
