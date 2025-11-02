import { createReducer } from "@reduxjs/toolkit";
import {
  register,
  login,
  loadUser,
  logout,
  verifyEmail,
  againEmail,
  verifyRecoveryEmail,
  forgotPassword,
  resetPassword,
  editProfile,
  changePassword,
  updateSettings,
  updateTheme,
  checkEmailAvailability,
  checkPremiumCode,
  clearError,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  switchUser,
  getAllSessions,
  removeSession,
  enable2FA,
  verify2FA,
  disable2FA,
  verify2FALogin,
  get2FAStatus,
} from "../actions/userActions";

interface UserState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated?: boolean;
  isVerified?: boolean;
  message?: string | null;
  sessions: any[];
  selectedAccountEmail: string | null; // Seçili hesap email'i
  emailCheck: {
    loading: boolean;
    available: boolean | null;
    message: string | null;
    isPremium?: boolean;
  };
  premiumCodeCheck: {
    loading: boolean;
    valid: boolean | null;
    message: string | null;
  };
  recoveryEmailVerification: {
    loading: boolean;
    verified: boolean;
    recoveryEmailMask: string | null;
    message: string | null;
  };
  allUsers: {
    users: any[];
    loading: boolean;
    error: string | null;
    stats: any;
    pagination: any;
  };
  twoFactor: {
    loading: boolean;
    enabled: boolean;
    qrCode: string | null;
    secret: string | null;
    error: string | null;
    tempToken: string | null;
    requires2FA: boolean;
  };
}

const initialState: UserState = {
  user: {},
  loading: false, // Always start with loading false to avoid hydration mismatch
  error: null,
  isAuthenticated: false,
  isVerified: false,
  message: null,
  sessions: [],
  selectedAccountEmail: typeof window !== 'undefined' ? localStorage.getItem('selectedAccountEmail') : null,
  emailCheck: {
    loading: false,
    available: null,
    message: null,
    isPremium: false,
  },
  premiumCodeCheck: {
    loading: false,
    valid: null,
    message: null,
  },
  recoveryEmailVerification: {
    loading: false,
    verified: false,
    recoveryEmailMask: null,
    message: null,
  },
  allUsers: {
    users: [],
    loading: false,
    error: null,
    stats: null,
    pagination: null,
  },
  twoFactor: {
    loading: false,
    enabled: false,
    qrCode: null,
    secret: null,
    error: null,
    tempToken: null,
    requires2FA: false,
  },
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
      // Seçili hesabı güncelle ve localStorage'a kaydet (login'deki gibi)
      state.selectedAccountEmail = action.payload.email;
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedAccountEmail', action.payload.email);
      }
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
      
      // Check if 2FA is required
      if ((action.payload as any).requires2FA) {
        state.twoFactor.requires2FA = true;
        state.twoFactor.tempToken = (action.payload as any).tempToken;
        state.isAuthenticated = false;
        return;
      }
      
      state.isAuthenticated = true;
      state.isVerified = true; // Login successful means user is verified
      state.user = action.payload;
      state.twoFactor.requires2FA = false;
      state.twoFactor.tempToken = null;
      // Seçili hesabı güncelle ve localStorage'a kaydet
      state.selectedAccountEmail = action.payload.email;
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedAccountEmail', action.payload.email);
      }
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
      // Eğer selectedAccountEmail yoksa veya user email'i ile eşleşmiyorsa, user email'ini kullan
      if (!state.selectedAccountEmail || state.selectedAccountEmail !== action.payload.email) {
        state.selectedAccountEmail = action.payload.email;
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedAccountEmail', action.payload.email);
        }
      }
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
      state.message = typeof action.payload === 'string' ? action.payload : action.payload?.message || 'Çıkış yapıldı';
      // Seçili hesabı temizle
      state.selectedAccountEmail = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedAccountEmail');
      }
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
    // Verify Recovery Email
    .addCase(verifyRecoveryEmail.pending, (state) => {
      state.recoveryEmailVerification.loading = true;
      state.recoveryEmailVerification.verified = false;
      state.recoveryEmailVerification.recoveryEmailMask = null;
      state.recoveryEmailVerification.message = null;
    })
    .addCase(verifyRecoveryEmail.fulfilled, (state, action) => {
      state.recoveryEmailVerification.loading = false;
      state.recoveryEmailVerification.verified = true;
      state.recoveryEmailVerification.recoveryEmailMask = action.payload.recoveryEmailMask;
      state.recoveryEmailVerification.message = action.payload.message;
    })
    .addCase(verifyRecoveryEmail.rejected, (state, action) => {
      state.recoveryEmailVerification.loading = false;
      state.recoveryEmailVerification.verified = false;
      state.recoveryEmailVerification.message = action.payload as string;
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
      // Handle token expiration case
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
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
      // Handle token expiration case
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
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
      // Handle token expiration case
      if (action.payload && typeof action.payload === 'object' && 'requiresLogout' in action.payload) {
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = (action.payload as any).message;
      } else {
        state.error = action.payload as string;
      }
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
    // Check Email Availability
    .addCase(checkEmailAvailability.pending, (state) => {
      state.emailCheck.loading = true;
      state.emailCheck.available = null;
      state.emailCheck.message = null;
      state.emailCheck.isPremium = false;
    })
    .addCase(checkEmailAvailability.fulfilled, (state, action) => {
      state.emailCheck.loading = false;
      state.emailCheck.available = action.payload.available;
      state.emailCheck.message = action.payload.message;
      state.emailCheck.isPremium = action.payload.isPremium || false;
    })
    .addCase(checkEmailAvailability.rejected, (state, action) => {
      state.emailCheck.loading = false;
      state.emailCheck.available = false;
      state.emailCheck.message = action.payload as string;
      state.emailCheck.isPremium = false;
    })
    // Check Premium Code
    .addCase(checkPremiumCode.pending, (state) => {
      state.premiumCodeCheck.loading = true;
      state.premiumCodeCheck.valid = null;
      state.premiumCodeCheck.message = null;
    })
    .addCase(checkPremiumCode.fulfilled, (state, action) => {
      state.premiumCodeCheck.loading = false;
      state.premiumCodeCheck.valid = action.payload.valid;
      state.premiumCodeCheck.message = action.payload.message;
    })
    .addCase(checkPremiumCode.rejected, (state, action) => {
      state.premiumCodeCheck.loading = false;
      state.premiumCodeCheck.valid = false;
      state.premiumCodeCheck.message = action.payload as string;
    })
    // Clear Error
    .addCase(clearError.fulfilled, (state) => {
      state.error = null;
      state.message = null;
    })
    
    // Get All Users
    .addCase(getAllUsers.pending, (state) => {
      state.allUsers.loading = true;
      state.allUsers.error = null;
    })
    .addCase(getAllUsers.fulfilled, (state, action) => {
      state.allUsers.loading = false;
      state.allUsers.users = action.payload.users;
      state.allUsers.stats = action.payload.stats;
      state.allUsers.pagination = action.payload.pagination;
      state.allUsers.error = null;
    })
    .addCase(getAllUsers.rejected, (state, action) => {
      state.allUsers.loading = false;
      state.allUsers.error = action.payload as string;
    })
    
    // Update User Role
    .addCase(updateUserRole.pending, (state) => {
      state.allUsers.loading = true;
      state.allUsers.error = null;
    })
    .addCase(updateUserRole.fulfilled, (state, action) => {
      state.allUsers.loading = false;
      const updatedUser = action.payload.user;
      const index = state.allUsers.users.findIndex(user => user._id === updatedUser._id);
      if (index !== -1) {
        state.allUsers.users[index] = { ...state.allUsers.users[index], role: updatedUser.role };
      }
      state.allUsers.error = null;
    })
    .addCase(updateUserRole.rejected, (state, action) => {
      state.allUsers.loading = false;
      state.allUsers.error = action.payload as string;
    })
    
    // Update User Status
    .addCase(updateUserStatus.pending, (state) => {
      state.allUsers.loading = true;
      state.allUsers.error = null;
    })
    .addCase(updateUserStatus.fulfilled, (state, action) => {
      state.allUsers.loading = false;
      const updatedUser = action.payload.user;
      const index = state.allUsers.users.findIndex(user => user._id === updatedUser._id);
      if (index !== -1) {
        state.allUsers.users[index] = { ...state.allUsers.users[index], status: updatedUser.status };
      }
      state.allUsers.error = null;
    })
    .addCase(updateUserStatus.rejected, (state, action) => {
      state.allUsers.loading = false;
      state.allUsers.error = action.payload as string;
    })
    
    // Delete User
    .addCase(deleteUser.pending, (state) => {
      state.allUsers.loading = true;
      state.allUsers.error = null;
    })
    .addCase(deleteUser.fulfilled, (state, action) => {
      state.allUsers.loading = false;
      state.allUsers.users = state.allUsers.users.filter(user => user._id !== action.payload.id);
      state.allUsers.error = null;
    })
    .addCase(deleteUser.rejected, (state, action) => {
      state.allUsers.loading = false;
      state.allUsers.error = action.payload as string;
    })
    
    // Switch User
    .addCase(switchUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(switchUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      // Seçili hesabı güncelle ve localStorage'a kaydet
      state.selectedAccountEmail = action.payload.email;
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedAccountEmail', action.payload.email);
      }
    })
    .addCase(switchUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    
    // Get All Sessions
    .addCase(getAllSessions.fulfilled, (state, action) => {
      state.sessions = action.payload;
    })
    
    // Remove Session
    .addCase(removeSession.fulfilled, (state, action) => {
      state.sessions = action.payload;
      // If no sessions left, log out
      if (action.payload.length === 0) {
        state.user = null;
        state.isAuthenticated = false;
        state.isVerified = false;
      }
    })
    
    // Enable 2FA
    .addCase(enable2FA.pending, (state) => {
      state.twoFactor.loading = true;
      state.twoFactor.error = null;
    })
    .addCase(enable2FA.fulfilled, (state, action) => {
      state.twoFactor.loading = false;
      state.twoFactor.qrCode = action.payload.qrCode;
      state.twoFactor.secret = action.payload.secret;
      state.twoFactor.error = null;
    })
    .addCase(enable2FA.rejected, (state, action) => {
      state.twoFactor.loading = false;
      state.twoFactor.error = action.payload as string;
    })
    
    // Verify 2FA
    .addCase(verify2FA.pending, (state) => {
      state.twoFactor.loading = true;
      state.twoFactor.error = null;
    })
    .addCase(verify2FA.fulfilled, (state) => {
      state.twoFactor.loading = false;
      state.twoFactor.enabled = true;
      state.twoFactor.qrCode = null;
      state.twoFactor.secret = null;
      state.twoFactor.error = null;
      if (state.user) {
        state.user.twoFactorEnabled = true;
      }
    })
    .addCase(verify2FA.rejected, (state, action) => {
      state.twoFactor.loading = false;
      state.twoFactor.error = action.payload as string;
    })
    
    // Disable 2FA
    .addCase(disable2FA.pending, (state) => {
      state.twoFactor.loading = true;
      state.twoFactor.error = null;
    })
    .addCase(disable2FA.fulfilled, (state) => {
      state.twoFactor.loading = false;
      state.twoFactor.enabled = false;
      state.twoFactor.error = null;
      if (state.user) {
        state.user.twoFactorEnabled = false;
      }
    })
    .addCase(disable2FA.rejected, (state, action) => {
      state.twoFactor.loading = false;
      state.twoFactor.error = action.payload as string;
    })
    
    // Verify 2FA Login
    .addCase(verify2FALogin.pending, (state) => {
      state.loading = true;
    })
    .addCase(verify2FALogin.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = true;
      state.user = action.payload;
      state.twoFactor.requires2FA = false;
      state.twoFactor.tempToken = null;
      // Seçili hesabı güncelle ve localStorage'a kaydet
      state.selectedAccountEmail = action.payload.email;
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedAccountEmail', action.payload.email);
      }
    })
    .addCase(verify2FALogin.rejected, (state, action) => {
      state.loading = false;
      state.twoFactor.error = action.payload as string;
    })
    
    // Get 2FA Status
    .addCase(get2FAStatus.fulfilled, (state, action) => {
      state.twoFactor.enabled = action.payload.twoFactorEnabled;
    });
});

export default userReducer;