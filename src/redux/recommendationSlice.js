import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recommendations: [],
  selectedRecommendation: null,
  loading: false,
  error: null,
  filters: {},
};

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRecommendations: (state, action) => {
      state.recommendations = action.payload;
    },
    setSelectedRecommendation: (state, action) => {
      state.selectedRecommendation = action.payload;
    },
    addRecommendation: (state, action) => {
      state.recommendations.push(action.payload);
    },
    updateRecommendation: (state, action) => {
      const index = state.recommendations.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.recommendations[index] = action.payload;
      }
    },
    deleteRecommendation: (state, action) => {
      state.recommendations = state.recommendations.filter(r => r.id !== action.payload);
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setRecommendations,
  setSelectedRecommendation,
  addRecommendation,
  updateRecommendation,
  deleteRecommendation,
  setFilters,
  setError,
  clearError,
} = recommendationSlice.actions;

export default recommendationSlice.reducer;
