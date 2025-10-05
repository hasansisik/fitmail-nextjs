import { createReducer } from "@reduxjs/toolkit";
import {
  register,
  login,
  loadUser,
  logout,
  verifyEmail,
  againEmail,
  forgotPassword,
  resetPassword,
  editProfile,
  changePassword,
  updateSettings,
  updateTheme,
  clearError,
} from "../actions/userActions";

interface UserState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated?: boolean;
  isVerified?: boolean;
  message?: string | null;
}

const initialState: UserState = {
  user: {},
  loading: false,
  error: null,
  isAuthenticated: false,
  isVerified: false,
  message: null,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    // Register
    .addCase(register.pending, (state) => {
      state.loading = true;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = true; // Register successful means user is verified
      state.user = action.payload;
      state.message = null;
      state.error = null;
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Login
    .addCase(login.pending, (state) => {
      state.loading = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = true; // Login successful means user is verified
      state.user = action.payload;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      // Handle inactive user case
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
    })
    // Load User
    .addCase(loadUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(loadUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = action.payload.isVerified; // Use actual verification status from backend
      state.user = action.payload;
    })
    .addCase(loadUser.rejected, (state, action) => {
      state.loading = false;
      // Handle inactive user case - user gets kicked out
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
    })
    // Logout
    .addCase(logout.pending, (state) => {
      state.loading = true;
    })
    .addCase(logout.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.isVerified = false;
      state.user = null;
      state.message = action.payload;
    })
    .addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Verify Email
    .addCase(verifyEmail.pending, (state) => {
      state.loading = true;
    })
    .addCase(verifyEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.isVerified = true;
      state.isAuthenticated = false; // User still needs to login after verification
      state.message = action.payload.message;
    })
    .addCase(verifyEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Again Email
    .addCase(againEmail.pending, (state) => {
      state.loading = true;
    })
    .addCase(againEmail.fulfilled, (state) => {
      state.loading = false;
      state.message = "E-posta başarıyla tekrar gönderildi.";
    })
    .addCase(againEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Forgot Password
    .addCase(forgotPassword.pending, (state) => {
      state.loading = true;
    })
    .addCase(forgotPassword.fulfilled, (state) => {
      state.loading = false;
      state.message = "Şifre sıfırlama e-postası gönderildi.";
    })
    .addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Reset Password
    .addCase(resetPassword.pending, (state) => {
      state.loading = true;
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.message = "Şifre başarıyla sıfırlandı.";
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Edit Profile
    .addCase(editProfile.pending, (state) => {
      state.loading = true;
    })
    .addCase(editProfile.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.message = action.payload.message;
    })
    .addCase(editProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Change Password
    .addCase(changePassword.pending, (state) => {
      state.loading = true;
    })
    .addCase(changePassword.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    })
    .addCase(changePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Update Settings
    .addCase(updateSettings.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateSettings.fulfilled, (state, action) => {
      state.loading = false;
      if (state.user) {
        state.user.settings = action.payload.settings;
      }
      state.message = action.payload.message;
    })
    .addCase(updateSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Update Theme - No loading state for instant UI updates
    .addCase(updateTheme.pending, (state) => {
      // No loading state - theme changes instantly
    })
    .addCase(updateTheme.fulfilled, (state, action) => {
      // Update user theme silently
      if (state.user) {
        state.user.theme = action.payload.theme;
      }
    })
    .addCase(updateTheme.rejected, (state, action) => {
      // Silent fail - don't show error to user
    })
    // Clear Error
    .addCase(clearError.fulfilled, (state) => {
      state.error = null;
      state.message = null;
    });
});

export default userReducer;