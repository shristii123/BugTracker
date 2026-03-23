import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export interface Bug {
  id: number; title: string; description: string; reproductionSteps: string;
  severity: string; status: string; createdAt: string; updatedAt: string | null;
  reporterName: string; assigneeName: string | null;
  attachments: { id: number; fileName: string; fileSize: number; uploadedAt: string }[];
}

interface BugsState { list: Bug[]; unassigned: Bug[]; myBugs: Bug[]; loading: boolean; error: string | null; }
const initialState: BugsState = { list: [], unassigned: [], myBugs: [], loading: false, error: null };

export const fetchBugs = createAsyncThunk('bugs/fetchAll', async (search: string | undefined, { rejectWithValue }) => {
  try { const { data } = await api.get('/bugs', { params: { search } }); return data.data as Bug[]; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchUnassigned = createAsyncThunk('bugs/fetchUnassigned', async (search: string | undefined, { rejectWithValue }) => {
  try { const { data } = await api.get('/bugs/unassigned', { params: { search } }); return data.data as Bug[]; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchMyBugs = createAsyncThunk('bugs/fetchMy', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/bugs/my'); return data.data as Bug[]; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const createBug = createAsyncThunk('bugs/create', async (dto: { title: string; description: string; reproductionSteps: string; severity: string }, { rejectWithValue }) => {
  try { const { data } = await api.post('/bugs', dto); return data.data as Bug; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const assignToMe = createAsyncThunk('bugs/assign', async (id: number, { rejectWithValue }) => {
  try { const { data } = await api.put(`/bugs/${id}/assign`); return data.data as Bug; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const updateStatus = createAsyncThunk('bugs/updateStatus', async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
  try { const { data } = await api.put(`/bugs/${id}/status`, { status }); return data.data as Bug; }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const bugsSlice = createSlice({
  name: 'bugs', initialState,
  reducers: { clearError(state) { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBugs.pending, (s) => { s.loading = true; })
      .addCase(fetchBugs.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchBugs.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchUnassigned.fulfilled, (s, a) => { s.unassigned = a.payload; })
      .addCase(fetchMyBugs.fulfilled, (s, a) => { s.myBugs = a.payload; })
      .addCase(createBug.fulfilled, (s, a) => { s.list.unshift(a.payload); s.myBugs.unshift(a.payload); })
      .addCase(assignToMe.fulfilled, (s, a) => {
        s.unassigned = s.unassigned.filter(b => b.id !== a.payload.id);
        const idx = s.list.findIndex(b => b.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
      })
      .addCase(updateStatus.fulfilled, (s, a) => {
        const idx = s.list.findIndex(b => b.id === a.payload.id);
        if (idx !== -1) s.list[idx] = a.payload;
      });
  },
});

export const { clearError } = bugsSlice.actions;
export default bugsSlice.reducer;
