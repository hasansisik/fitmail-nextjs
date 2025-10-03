import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Add axios interceptor to suppress certain errors in console
axios.interceptors.response.use(
  (response) => response,
  (error) => {
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

export interface CreateListingPayload {
  title: string;
  description: string;
  category: string;
  location: string;
  image?: string;
  experience: string;
  instrument?: string;
  type?: string;
}

export interface UpdateListingPayload {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  image?: string;
  experience?: string;
  instrument?: string;
  type?: string;
  status?: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  active?: boolean;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
  [key: string]: string | undefined;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface StartConversationPayload {
  recipientId: string;
  listingId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  sender?: {
    _id: string;
    name: string;
    surname: string;
    picture?: string;
  };
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  listing?: {
    _id: string;
    title: string;
    image: string;
    category: string;
  } | null;
  otherParticipant: {
    _id: string;
    name: string;
    surname: string;
    picture?: string;
  };
  conversationKey?: string;
}

export const register = createAsyncThunk(
  "user/register",
  async (payload: RegisterPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/register`, payload);
      return data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const googleRegister = createAsyncThunk(
  "user/googleRegister",
  async (payload: GoogleLoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/google-register`, payload);
      localStorage.setItem("accessToken", data.user.token);
      return data.user;
    } catch (error: any) {
      // Handle inactive user case
      if (error.response?.status === 401 && error.response?.data?.message?.includes('pasif durumda')) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
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

export const googleAuth = createAsyncThunk(
  "user/googleAuth",
  async (payload: GoogleLoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/google-auth`, payload);
      localStorage.setItem("accessToken", data.user.token);
      localStorage.setItem("userEmail", data.user.email);
      return data.user;
    } catch (error: any) {
      // Handle inactive user case
      if (error.response?.status === 401 && error.response?.data?.message?.includes('pasif durumda')) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (payload: GoogleLoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/google-login`, payload);
      localStorage.setItem("accessToken", data.user.token);
      localStorage.setItem("userEmail", data.user.email);
      return data.user;
    } catch (error: any) {
      // Handle inactive user case
      if (error.response?.status === 401 && error.response?.data?.message?.includes('pasif durumda')) {
        return thunkAPI.rejectWithValue({
          message: error.response.data.message,
          requiresLogout: true
        });
      }
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        throw new Error("No token found");
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

// Listing Actions
export const createListing = createAsyncThunk(
  "user/createListing",
  async (formData: CreateListingPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${server}/listings`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      console.error("Create listing error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || "Sunucu hatası";
        
        if (status === 401) {
          return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else if (status === 403) {
          return thunkAPI.rejectWithValue("Bu işlem için yetkiniz yok.");
        } else if (status === 404) {
          return thunkAPI.rejectWithValue("İstenen kaynak bulunamadı.");
        } else if (status === 400) {
          return thunkAPI.rejectWithValue(message);
        } else {
          return thunkAPI.rejectWithValue(`Sunucu hatası (${status}): ${message}`);
        }
      } else if (error.request) {
        return thunkAPI.rejectWithValue("Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        return thunkAPI.rejectWithValue(error.message || "Bilinmeyen bir hata oluştu.");
      }
    }
  }
);

export const getAllListings = createAsyncThunk(
  "user/getAllListings",
  async (params: any = {}, thunkAPI) => {
    try {
      // Filter out undefined values before creating URLSearchParams
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>;
      const queryString = new URLSearchParams(filteredParams).toString();
      const url = `${server}/listings${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(url);
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

export const getUserListings = createAsyncThunk(
  "user/getUserListings",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${server}/listings/user/me`,
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

export const updateListing = createAsyncThunk(
  "user/updateListing",
  async ({ id, formData }: { id: string; formData: UpdateListingPayload }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        `${server}/listings/${id}`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      console.error("Update listing error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || "Sunucu hatası";
        
        if (status === 401) {
          return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else if (status === 403) {
          return thunkAPI.rejectWithValue("Bu işlem için yetkiniz yok.");
        } else if (status === 404) {
          return thunkAPI.rejectWithValue("İlan bulunamadı.");
        } else if (status === 400) {
          return thunkAPI.rejectWithValue(message);
        } else {
          return thunkAPI.rejectWithValue(`Sunucu hatası (${status}): ${message}`);
        }
      } else if (error.request) {
        return thunkAPI.rejectWithValue("Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        return thunkAPI.rejectWithValue(error.message || "Bilinmeyen bir hata oluştu.");
      }
    }
  }
);

export const deleteListing = createAsyncThunk(
  "user/deleteListing",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `${server}/listings/${id}`,
        config
      );
      return { id, message: response.data.message };
    } catch (error: any) {
      console.error("Delete listing error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || "Sunucu hatası";
        
        if (status === 401) {
          return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else if (status === 403) {
          return thunkAPI.rejectWithValue("Bu işlem için yetkiniz yok.");
        } else if (status === 404) {
          return thunkAPI.rejectWithValue("İlan bulunamadı.");
        } else if (status === 400) {
          return thunkAPI.rejectWithValue(message);
        } else {
          return thunkAPI.rejectWithValue(`Sunucu hatası (${status}): ${message}`);
        }
      } else if (error.request) {
        return thunkAPI.rejectWithValue("Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        return thunkAPI.rejectWithValue(error.message || "Bilinmeyen bir hata oluştu.");
      }
    }
  }
);

export const toggleListingStatus = createAsyncThunk(
  "user/toggleListingStatus",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/listings/${id}/toggle-status`,
        {},
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

export const updateListingStatus = createAsyncThunk(
  "user/updateListingStatus",
  async ({ id, status, reason }: { id: string; status: string; reason?: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/listings/${id}/status`,
        { status, reason },
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

// Admin listing management actions
export const getPendingListings = createAsyncThunk(
  "user/getPendingListings",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${server}/listings/admin/pending`,
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

export const approveListing = createAsyncThunk(
  "user/approveListing",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/listings/${id}/approve`,
        {},
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

export const rejectListing = createAsyncThunk(
  "user/rejectListing",
  async ({ id, reason }: { id: string; reason: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/listings/${id}/reject`,
        { reason },
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

// Category Actions
export const createCategory = createAsyncThunk(
  "user/createCategory",
  async (formData: CreateCategoryPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${server}/listing-categories`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      console.error("Create category error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || "Sunucu hatası";
        
        if (status === 401) {
          return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else if (status === 403) {
          return thunkAPI.rejectWithValue("Bu işlem için yetkiniz yok.");
        } else if (status === 404) {
          return thunkAPI.rejectWithValue("İstenen kaynak bulunamadı.");
        } else if (status === 400) {
          return thunkAPI.rejectWithValue(message);
        } else {
          return thunkAPI.rejectWithValue(`Sunucu hatası (${status}): ${message}`);
        }
      } else if (error.request) {
        return thunkAPI.rejectWithValue("Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        return thunkAPI.rejectWithValue(error.message || "Bilinmeyen bir hata oluştu.");
      }
    }
  }
);

export const getAllCategories = createAsyncThunk(
  "user/getAllCategories",
  async (params: any = {}, thunkAPI) => {
    try {
      // Filter out undefined values before creating URLSearchParams
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>;
      const queryString = new URLSearchParams(filteredParams).toString();
      const url = `${server}/listing-categories${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(url);
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

export const updateCategory = createAsyncThunk(
  "user/updateCategory",
  async ({ id, formData }: { id: string; formData: UpdateCategoryPayload }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        `${server}/listing-categories/${id}`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      console.error("Update category error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || "Sunucu hatası";
        
        if (status === 401) {
          return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else if (status === 403) {
          return thunkAPI.rejectWithValue("Bu işlem için yetkiniz yok.");
        } else if (status === 404) {
          return thunkAPI.rejectWithValue("Kategori bulunamadı.");
        } else if (status === 400) {
          return thunkAPI.rejectWithValue(message);
        } else {
          return thunkAPI.rejectWithValue(`Sunucu hatası (${status}): ${message}`);
        }
      } else if (error.request) {
        return thunkAPI.rejectWithValue("Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        return thunkAPI.rejectWithValue(error.message || "Bilinmeyen bir hata oluştu.");
      }
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "user/deleteCategory",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `${server}/listing-categories/${id}`,
        config
      );
      return { id, message: response.data.message };
    } catch (error: any) {
      console.error("Delete category error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || "Sunucu hatası";
        
        if (status === 401) {
          return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else if (status === 403) {
          return thunkAPI.rejectWithValue("Bu işlem için yetkiniz yok.");
        } else if (status === 404) {
          return thunkAPI.rejectWithValue("Kategori bulunamadı.");
        } else if (status === 400) {
          return thunkAPI.rejectWithValue(message);
        } else {
          return thunkAPI.rejectWithValue(`Sunucu hatası (${status}): ${message}`);
        }
      } else if (error.request) {
        return thunkAPI.rejectWithValue("Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        return thunkAPI.rejectWithValue(error.message || "Bilinmeyen bir hata oluştu.");
      }
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  "user/toggleCategoryStatus",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/listing-categories/${id}/toggle-status`,
        {},
        config
      );
      return response.data;
    } catch (error: any) {
      console.error("Toggle category status error:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || "Sunucu hatası";
        
        if (status === 401) {
          return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        } else if (status === 403) {
          return thunkAPI.rejectWithValue("Bu işlem için yetkiniz yok.");
        } else if (status === 404) {
          return thunkAPI.rejectWithValue("Kategori bulunamadı.");
        } else if (status === 400) {
          return thunkAPI.rejectWithValue(message);
        } else {
          return thunkAPI.rejectWithValue(`Sunucu hatası (${status}): ${message}`);
        }
      } else if (error.request) {
        return thunkAPI.rejectWithValue("Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        return thunkAPI.rejectWithValue(error.message || "Bilinmeyen bir hata oluştu.");
      }
    }
  }
);

// User Management Actions (Admin only)
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (params: Record<string, string> = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const queryString = new URLSearchParams(params).toString();
      const url = `${server}/auth/users${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(url, config);
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

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `${server}/auth/users/${id}`,
        config
      );
      return { id, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async ({ id, role }: { id: string; role: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/auth/users/${id}/role`,
        { role },
        config
      );
      return { id, role, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "user/updateUserStatus",
  async ({ id, status }: { id: string; status: string }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/auth/users/${id}/status`,
        { status },
        config
      );
      return { id, status, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Messaging Actions
export const getConversations = createAsyncThunk(
  "user/getConversations",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${server}/messages/conversations`, config);
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

export const getMessages = createAsyncThunk(
  "user/getMessages",
  async ({ conversationId, page = 1, limit = 50 }: { conversationId: string; page?: number; limit?: number }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${server}/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
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

export const sendMessage = createAsyncThunk(
  "user/sendMessage",
  async (payload: SendMessagePayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${server}/messages/send`,
        payload,
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

export const startConversation = createAsyncThunk(
  "user/startConversation",
  async (payload: StartConversationPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${server}/messages/conversations/start`,
        payload,
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


export const getUnreadCount = createAsyncThunk(
  "user/getUnreadCount",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${server}/messages/unread-count`, config);
      
      // If response status is 304 (Not Modified), return null to prevent state update
      if (response.status === 304) {
        return null;
      }
      
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

export const markMessagesAsRead = createAsyncThunk(
  "user/markMessagesAsRead",
  async (conversationId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/messages/conversations/${conversationId}/read`,
        {},
        config
      );
      return { conversationId, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const markUserMessagesAsRead = createAsyncThunk(
  "user/markUserMessagesAsRead",
  async (conversationId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.patch(
        `${server}/messages/conversations/${conversationId}/user-read`,
        {},
        config
      );
      return { conversationId, message: response.data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get all instruments (public - no authentication required)
export const getAllInstruments = createAsyncThunk(
  "user/getAllInstruments",
  async (params: { active?: boolean } = {}, thunkAPI) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.active !== undefined) {
        queryParams.append('active', params.active.toString());
      }
      
      const response = await axios.get(`${server}/instruments?${queryParams.toString()}`);
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
export const clearError = createAsyncThunk(
  "user/clearError",
  async () => {
    return null;
  }
);

// Send Mail Action
export const sendMail = createAsyncThunk(
  "user/sendMail",
  async (mailData: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    content: string;
    htmlContent?: string;
  }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(`${server}/mail/send`, mailData, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Mails by Category Action
export const getMailsByCategory = createAsyncThunk(
  "user/getMailsByCategory",
  async (params: {
    folder: string;
    page?: number;
    limit?: number;
    search?: string;
    isRead?: boolean;
  }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Query parametrelerini oluştur
      const queryParams = new URLSearchParams();
      queryParams.append('folder', params.folder);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

      const { data } = await axios.get(`${server}/mail/inbox?${queryParams.toString()}`, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

