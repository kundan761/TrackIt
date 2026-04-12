import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportsApi, ReportsData } from '../../api/reports';

interface ReportsState {
  data: ReportsData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchReportsData = createAsyncThunk(
  'reports/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getReportsData();
      return response.data!;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reports data');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReportsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = reportsSlice.actions;
export default reportsSlice.reducer;

