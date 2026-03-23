import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';

interface User { token: string; email: string; fullName: string; role: string; }
interface AuthState { user: User | null; loading: boolean; error: string | null; }

const stored = localStorage.getItem('user');
const initialState: AuthState = {
  user: stored ? JSON.parse(stored) : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (creds: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    return data.data as User;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (dto: { fullName: string; email: string; password: string; role: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', dto);
    return data.data as User;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state: AuthState) => { state.loading = true; state.error = null; };
    const handleFulfilled = (state: AuthState, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload));
    };
    const handleRejected = (state: AuthState, action: any) => {
      state.loading = false;
      state.error = action.payload as string;
    };
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected, handleRejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
