import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  properties: [],
  selectedProperty: null,
  loading: false,
  error: null,
  filters: {},
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProperties: (state, action) => {
      state.properties = action.payload;
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    addProperty: (state, action) => {
      state.properties.push(action.payload);
    },
    updateProperty: (state, action) => {
      const index = state.properties.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.properties[index] = action.payload;
      }
    },
    deleteProperty: (state, action) => {
      state.properties = state.properties.filter(p => p._id !== action.payload);
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
  setProperties,
  setSelectedProperty,
  addProperty,
  updateProperty,
  deleteProperty,
  setFilters,
  setError,
  clearError,
} = propertySlice.actions;

export default propertySlice.reducer;
