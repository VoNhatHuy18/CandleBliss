interface UserInfo {
   id: string;
   email: string;
   firstName?: string;
   lastName?: string;
   phone?: string;
   [key: string]: string | number | boolean | null | undefined;
}

const AuthService = {
   setTokens: (token: string, refreshToken: string) => {
      if (typeof window !== 'undefined') {
         localStorage.setItem('token', token);
         localStorage.setItem('refreshToken', refreshToken);
      }
   },

   getToken: (): string | null => {
      if (typeof window !== 'undefined') {
         return localStorage.getItem('token');
      }
      return null;
   },

   getRefreshToken: (): string | null => {
      if (typeof window !== 'undefined') {
         return localStorage.getItem('refreshToken');
      }
      return null;
   },

   saveUserInfo: (userInfo: UserInfo) => {
      if (typeof window !== 'undefined') {
         localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
   },

   getUserInfo: (): UserInfo | null => {
      if (typeof window !== 'undefined') {
         const userInfoStr = localStorage.getItem('userInfo');
         if (userInfoStr) {
            return JSON.parse(userInfoStr);
         }
      }
      return null;
   },

   isAuthenticated: (): boolean => {
      if (typeof window !== 'undefined') {
         return !!localStorage.getItem('token');
      }
      return false;
   },

   logout: () => {
      if (typeof window !== 'undefined') {
         localStorage.removeItem('token');
         localStorage.removeItem('refreshToken');
         localStorage.removeItem('userInfo');
      }
   },
};

export default AuthService;
