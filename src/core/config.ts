export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// The app can be reviewed without a running NestJS instance. Set to "false" in .env for live API calls.
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false';

export const TOKEN_KEY = 'sat_gg_access_token';