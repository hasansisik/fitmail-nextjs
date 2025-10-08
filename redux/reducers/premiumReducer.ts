import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  getAllPremiums, 
  createPremium, 
  updatePremium, 
  deletePremium, 
  togglePremiumStatus,
  PremiumPlan 
} from '../actions/userActions';

interface PremiumState {
  premiums: PremiumPlan[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: PremiumState = {
  premiums: [],
  loading: false,
  error: null,
  message: null,
};

const premiumSlice = createSlice({
  name: 'premium',
  initialState,
  reducers: {
    clearPremiumError: (state) => {
      state.error = null;
    },
    clearPremiumMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Premiums
      .addCase(getAllPremiums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPremiums.fulfilled, (state, action) => {
        state.loading = false;
        state.premiums = action.payload.data;
        state.error = null;
      })
      .addCase(getAllPremiums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Premium
      .addCase(createPremium.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPremium.fulfilled, (state, action) => {
        state.loading = false;
        state.premiums.unshift(action.payload.data);
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(createPremium.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Premium
      .addCase(updatePremium.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePremium.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPremium = action.payload.data;
        const index = state.premiums.findIndex(premium => premium._id === updatedPremium._id);
        if (index !== -1) {
          state.premiums[index] = updatedPremium;
        }
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updatePremium.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Premium
      .addCase(deletePremium.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePremium.fulfilled, (state, action) => {
        state.loading = false;
        state.premiums = state.premiums.filter(premium => premium._id !== action.payload.id);
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(deletePremium.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Toggle Premium Status
      .addCase(togglePremiumStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePremiumStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPremium = action.payload.data;
        const index = state.premiums.findIndex(premium => premium._id === updatedPremium._id);
        if (index !== -1) {
          state.premiums[index] = updatedPremium;
        }
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(togglePremiumStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPremiumError, clearPremiumMessage } = premiumSlice.actions;
export default premiumSlice.reducer;
