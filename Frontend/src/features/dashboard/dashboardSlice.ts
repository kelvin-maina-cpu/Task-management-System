import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  selectedTimeRange: '7days' | '30days' | '90days' | 'all';
  selectedProjectId: string | null;
  refreshInterval: number | null;
}

const initialState: DashboardState = {
  selectedTimeRange: '30days',
  selectedProjectId: null,
  refreshInterval: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<DashboardState['selectedTimeRange']>) => {
      state.selectedTimeRange = action.payload;
    },
    setSelectedProject: (state, action: PayloadAction<string | null>) => {
      state.selectedProjectId = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number | null>) => {
      state.refreshInterval = action.payload;
    },
  },
});

export const { setTimeRange, setSelectedProject, setRefreshInterval } = dashboardSlice.actions;
export default dashboardSlice.reducer;

