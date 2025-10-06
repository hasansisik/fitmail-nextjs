import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Add axios interceptor to handle token errors and suppress certain errors in console
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration/authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear invalid token
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/giris')) {
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
      // Store token and email in localStorage like login does
      localStorage.setItem("accessToken", data.user.token);
      localStorage.setItem("userEmail", data.user.email);
      return data.user;
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
      localStorage.setItem("accessToken", data.user.token);
      localStorage.setItem("userEmail", data.user.email);
      return data.user;
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
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        throw new Error("");
      }
      
      const { data } = await axios.get(`${server}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Store user email for potential verification redirects
      if (data.user.email) {
        localStorage.setItem("userEmail", data.user.email);
      }
      return data.user;
    } catch (error: any) {
      // Handle 404 errors silently (user not found or invalid token)
      if (error.response?.status === 404) {
        // Clear invalid token and return silent error
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
        return thunkAPI.rejectWithValue("User not found");
      }
      
      // Handle inactive user case - user gets kicked out
      if (error.response?.status === 401 && error.response?.data?.requiresLogout) {
        // Clear local storage and return special error
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userEmail");
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
    const token = localStorage.getItem("accessToken");
    const { data } = await axios.get(`${server}/auth/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    return data.message;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

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
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return { theme }; // Return theme even if no token
    }
    
    // Fire and forget - don't wait for response
    axios.post(
      `${server}/auth/edit-profile`,
      { theme },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

export const clearError = createAsyncThunk(
  "user/clearError",
  async () => {
    return null;
  }
);


