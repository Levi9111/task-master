const REFRESH_TOKEN_KEY = 'taskflow_refresh_token';

export const tokenStorage = {
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
};
