import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Çapraz subdomain çerezleri için tüm isteklerde cookie gönder
axios.defaults.withCredentials = true;

// Add axios interceptor to handle token errors and suppress certain errors in console
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration/authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear invalid token
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      
      // Redirect to login if not already there and not on auth pages
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/giris') &&
          !window.location.pathname.includes('/kayit-ol') &&
          !window.location.pathname.includes('/sifremi-unuttum') &&
          !window.location.pathname.includes('/sifre-sifirla')) {
        window.location.href = '/giris';
      }
      
      return Promise.reject({
        ...error,
        message: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
        requiresLogout: true
      });
    }
    
    // Suppress 404 errors from /auth/me endpoint in console
    if (error.response?.status === 404 && error.config?.url?.includes('/auth/me')) {
      // Don't log 404 errors for /auth/me endpoint
      return Promise.reject(error);
    }
    
    // Suppress OPTIONS preflight request errors
    if (error.config?.method === 'options') {
      return Promise.reject(error);
    }
    
    // Log other errors normally
    return Promise.reject(error);
  }
);

// Add request interceptor to handle preflight requests
axios.interceptors.request.use(
  (config) => {
    // Only add cache control for specific requests that need it
    if (config.method === 'post' && config.url?.includes('/auth/')) {
      // Don't add cache control headers for auth requests to avoid CORS issues
      return config;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface RegisterPayload {
  name: string;
  surname: string;
  email: string;
  recoveryEmail?: string;
  password: string;
  birthDate?: string;
  age?: number;
  gender?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  email: string;
  name: string;
  surname: string;
  googleId: string;
}

export interface VerifyEmailPayload {
  email: string;
  verificationCode: number;
}

export interface ResetPasswordPayload {
  email: string;
  passwordToken: number;
  newPassword: string;
}

export interface EditProfilePayload {
  name?: string;
  surname?: string;
  recoveryEmail?: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  picture?: string;
  bio?: string;
  skills?: string[];
  theme?: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  mailAddress?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateSettingsPayload {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}

export interface CheckEmailPayload {
  email: string;
}


export const register = createAsyncThunk(
  "user/register",
  async (payload: RegisterPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/register`, payload);
      
      // Store user session
      const userSession = {
        email: data.user.email,
        token: data.user.token,
        user: data.user,
        loginTime: new Date().toISOString()
      };
      
      // Get existing sessions
      const existingSessions = JSON.parse(localStorage.getItem("userSessions") || "[]");
      
      // Check if this user is already in sessions
      const existingIndex = existingSessions.findIndex((s: any) => s.email === data.user.email);
      
      if (existingIndex >= 0) {
        // Update existing session
        existingSessions[existingIndex] = userSession;
      } else {
        // Add new session
        existingSessions.push(userSession);
      }
      
      // Store all sessions
      localStorage.setItem("userSessions", JSON.stringify(existingSessions));
      
      // Set current active user (token çerezde, localStorage'a yazmıyoruz)
      localStorage.setItem("activeUserId", userSession.email);
      localStorage.setItem("userEmail", userSession.email);
      
      return userSession.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (payload: LoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/login`, payload);
      
      // Check if 2FA is required
      if (data.requires2FA) {
        return {
          requires2FA: true,
          tempToken: data.tempToken,
          message: data.message
        };
      }
      
      // Store user session
      const userSession = {
        email: data.user.email,
        token: data.user.token,
        user: data.user,
        loginTime: new Date().toISOString()
      };
      
      // Get existing sessions
      const existingSessions = JSON.parse(localStorage.getItem("userSessions") || "[]");
      
      // Check if this user is already in sessions
      const existingIndex = existingSessions.findIndex((s: any) => s.email === data.user.email);
      
      if (existingIndex >= 0) {
        // Update existing session
        existingSessions[existingIndex] = userSession;
      } else {
        // Add new session
        existingSessions.push(userSession);
      }
      
      // Store all sessions
      localStorage.setItem("userSessions", JSON.stringify(existingSessions));
      
      // Set current active user (token çerezde, localStorage'a yazmıyoruz)
      localStorage.setItem("activeUserId", userSession.email);
      localStorage.setItem("userEmail", userSession.email);
      
      return userSession.user;
    } catch (error: any) {
      // Handle email verification required case
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        // Don't set this as an error, it's handled by redirect
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresVerification: true,
          email: error.response.data.email
        });
      }
      // Handle inactive user case
      if (error.response?.status === 401 && error.response?.data?.message?.includes('pasif durumda')) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${server}/auth/me`);
      // Store user email for potential verification redirects
      if (data.user.email) {
        localStorage.setItem("userEmail", data.user.email);
      }
      return data.user;
    } catch (error: any) {
      // Handle 404 errors silently (user not found)
      if (error.response?.status === 404) {
        return thunkAPI.rejectWithValue("User not found");
      }
      
      // Handle inactive user case - user gets kicked out
      if (error.response?.status === 401 && error.response?.data?.requiresLogout) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logout = createAsyncThunk("user/logout", async (_, thunkAPI) => {
  try {
    const currentUserEmail = localStorage.getItem("userEmail");
    
    try {
      await axios.get(`${server}/auth/logout`);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    }
    
    // Remove current user from sessions
    const existingSessions = JSON.parse(localStorage.getItem("userSessions") || "[]");
    const updatedSessions = existingSessions.filter((s: any) => s.email !== currentUserEmail);
    
    if (updatedSessions.length > 0) {
      // Switch to another session
      const newActiveUser = updatedSessions[0];
      localStorage.setItem("userSessions", JSON.stringify(updatedSessions));
      localStorage.setItem("activeUserId", newActiveUser.email);
      localStorage.setItem("userEmail", newActiveUser.email);
    } else {
      // No more sessions
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userSessions");
      localStorage.removeItem("activeUserId");
    }
    
    return { message: "Logged out", remainingSessions: updatedSessions.length };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Switch to another user session
export const switchUser = createAsyncThunk(
  "user/switchUser",
  async (email: string, thunkAPI) => {
    try {
      const existingSessions = JSON.parse(localStorage.getItem("userSessions") || "[]");
      const targetSession = existingSessions.find((s: any) => s.email === email);
      
      if (!targetSession) {
        throw new Error("Session not found");
      }
      
      // Switch to the target session (token çerezde)
      localStorage.setItem("activeUserId", targetSession.email);
      localStorage.setItem("userEmail", targetSession.email);
      
      return targetSession.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Get all active sessions
export const getAllSessions = createAsyncThunk(
  "user/getAllSessions",
  async (_, thunkAPI) => {
    try {
      const sessions = JSON.parse(localStorage.getItem("userSessions") || "[]");
      return sessions;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Remove a specific session
export const removeSession = createAsyncThunk(
  "user/removeSession",
  async (email: string, thunkAPI) => {
    try {
      const existingSessions = JSON.parse(localStorage.getItem("userSessions") || "[]");
      const updatedSessions = existingSessions.filter((s: any) => s.email !== email);
      
      localStorage.setItem("userSessions", JSON.stringify(updatedSessions));
      
      // If we removed the active session, switch to another one
      if (localStorage.getItem("userEmail") === email && updatedSessions.length > 0) {
        const newActiveUser = updatedSessions[0];
        localStorage.setItem("activeUserId", newActiveUser.email);
        localStorage.setItem("userEmail", newActiveUser.email);
      }
      
      return updatedSessions;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "user/verifyEmail",
  async (payload: VerifyEmailPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/verify-email`, payload);
      
      return {
        message: data.message
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const againEmail = createAsyncThunk(
  "user/againEmail",
  async (email: string, thunkAPI) => {
    try {
      await axios.post(`${server}/auth/again-email`, { email });
      return;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export interface VerifyRecoveryEmailPayload {
  email: string;
  recoveryEmailHint?: string;
}

export const verifyRecoveryEmail = createAsyncThunk(
  "user/verifyRecoveryEmail",
  async (payload: VerifyRecoveryEmailPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/verify-recovery-email`, payload);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email: string, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/forgot-password`, { email });
      return data.message;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (payload: ResetPasswordPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/reset-password`, payload);
      return data.message;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const editProfile = createAsyncThunk(
  "user/editProfile",
  async (formData: EditProfilePayload, thunkAPI) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${server}/auth/edit-profile`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const verifyPassword = createAsyncThunk(
  "user/verifyPassword",
  async (password: string, thunkAPI) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${server}/auth/verify-password`,
        { password },
        config
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (formData: ChangePasswordPayload, thunkAPI) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${server}/auth/change-password`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const updateSettings = createAsyncThunk(
  "user/updateSettings",
  async (formData: UpdateSettingsPayload, thunkAPI) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${server}/auth/update-settings`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);


// Update Theme Action - Ultra optimized for instant UI updates
export const updateTheme = createAsyncThunk(
  "user/updateTheme",
  async (theme: string, thunkAPI) => {
    // Fire and forget - don't wait for response
    axios.post(
      `${server}/auth/edit-profile`,
      { theme },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 3000, // 3 second timeout
      }
    ).catch((error) => {
    });
    
    // Return immediately
    return { theme };
  }
);

// Clear Error Action
//Check Email Availability Action
export const checkEmailAvailability = createAsyncThunk(
  "user/checkEmailAvailability",
  async (payload: CheckEmailPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/check-email`, payload);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

//Check Premium Code Action
export const checkPremiumCode = createAsyncThunk(
  "user/checkPremiumCode",
  async (payload: { email: string; code: string }, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/check-premium-code`, payload);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearError = createAsyncThunk(
  "user/clearError",
  async () => {
    return null;
  }
);

// Delete Account Action
export const deleteAccount = createAsyncThunk(
  "user/deleteAccount",
  async (_, thunkAPI) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios.delete(`${server}/auth/delete-account`, config);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Premium Actions
export interface PremiumPlan {
  _id: string;
  name: string;
  price: number;
  code: string;
  isActive: boolean;
  description?: string;
  features?: string[];
  duration: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePremiumPayload {
  name: string;
  price: number;
  description?: string;
  features?: string[];
  duration?: number;
}

export interface UpdatePremiumPayload {
  id: string;
  name?: string;
  price?: number;
  description?: string;
  features?: string[];
  duration?: number;
  isActive?: boolean;
}

// Get All Premium Plans
export const getAllPremiums = createAsyncThunk(
  "premium/getAllPremiums",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${server}/premium`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create Premium Plan
export const createPremium = createAsyncThunk(
  "premium/createPremium",
  async (premiumData: CreatePremiumPayload, thunkAPI) => {
    try {
      const response = await axios.post(`${server}/premium`, premiumData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update Premium Plan
export const updatePremium = createAsyncThunk(
  "premium/updatePremium",
  async (premiumData: UpdatePremiumPayload, thunkAPI) => {
    try {
      const { id, ...updateData } = premiumData;
      const response = await axios.put(`${server}/premium/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete Premium Plan
export const deletePremium = createAsyncThunk(
  "premium/deletePremium",
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.delete(`${server}/premium/${id}`);
      return { id, ...response.data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Toggle Premium Status
export const togglePremiumStatus = createAsyncThunk(
  "premium/togglePremiumStatus",
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.patch(`${server}/premium/${id}/toggle`, {});
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// User Management Actions
export interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  profile?: any;
  address?: any;
}

export interface UpdateUserRolePayload {
  id: string;
  role: 'admin' | 'user';
}

export interface UpdateUserStatusPayload {
  id: string;
  status: 'active' | 'inactive';
}

// Get All Users (Admin only)
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (params: { role?: string; status?: string; search?: string; page?: number; limit?: number } = {}, thunkAPI) => {
    try {
      const response = await axios.get(`${server}/auth/users`, { params });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update User Role (Admin only)
export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async (payload: UpdateUserRolePayload, thunkAPI) => {
    try {
      const response = await axios.patch(`${server}/auth/users/${payload.id}/role`, { role: payload.role });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update User Status (Admin only)
export const updateUserStatus = createAsyncThunk(
  "user/updateUserStatus",
  async (payload: UpdateUserStatusPayload, thunkAPI) => {
    try {
      const response = await axios.patch(`${server}/auth/users/${payload.id}/status`, { status: payload.status });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete User (Admin only)
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id: string, thunkAPI) => {
    try {
      const response = await axios.delete(`${server}/auth/users/${id}`);
      return { id, ...response.data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// 2FA Actions
export const enable2FA = createAsyncThunk(
  "user/enable2FA",
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(`${server}/auth/2fa/enable`, {});
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const verify2FA = createAsyncThunk(
  "user/verify2FA",
  async (token: string, thunkAPI) => {
    try {
      const response = await axios.post(`${server}/auth/2fa/verify`, { token });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const disable2FA = createAsyncThunk(
  "user/disable2FA",
  async (password: string, thunkAPI) => {
    try {
      const response = await axios.post(`${server}/auth/2fa/disable`, { password });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const verify2FALogin = createAsyncThunk(
  "user/verify2FALogin",
  async (payload: { tempToken: string; token: string }, thunkAPI) => {
    try {
      const response = await axios.post(`${server}/auth/2fa/verify-login`, payload);
      
      // Store user session
      const userSession = {
        email: response.data.user.email,
        token: response.data.user.token,
        user: response.data.user,
        loginTime: new Date().toISOString()
      };
      
      // Get existing sessions
      const existingSessions = JSON.parse(localStorage.getItem("userSessions") || "[]");
      
      // Check if this user is already in sessions
      const existingIndex = existingSessions.findIndex((s: any) => s.email === response.data.user.email);
      
      if (existingIndex >= 0) {
        // Update existing session
        existingSessions[existingIndex] = userSession;
      } else {
        // Add new session
        existingSessions.push(userSession);
      }
      
      // Store all sessions
      localStorage.setItem("userSessions", JSON.stringify(existingSessions));
      
      // Set current active user (token çerezde tutuluyor)
      localStorage.setItem("activeUserId", userSession.email);
      localStorage.setItem("userEmail", userSession.email);
      
      return response.data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const get2FAStatus = createAsyncThunk(
  "user/get2FAStatus",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${server}/auth/2fa/status`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);


