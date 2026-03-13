import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'mentor';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ✅ Check localStorage for existing token on initialization
const getInitialToken = () => localStorage.getItem('accessToken');

const initialState: AuthState = {
  user: null,
  token: getInitialToken(),
  // ✅ Set isAuthenticated to true if token exists
  isAuthenticated: !!getInitialToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.token);
    },
    
    // ✅ Add token refresh handler
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('accessToken', action.payload);
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const { setCredentials, logout, setUser, setToken } = authSlice.actions;
export default authSlice.reducer;

