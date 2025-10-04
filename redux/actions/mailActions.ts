import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Send Mail Action
export const sendMail = createAsyncThunk(
  "mail/sendMail",
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
  "mail/getMailsByCategory",
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

// Get Mails by Label Category Action
export const getMailsByLabelCategory = createAsyncThunk(
  "mail/getMailsByLabelCategory",
  async (params: {
    category: string;
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
      queryParams.append('category', params.category);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

      const { data } = await axios.get(`${server}/mail/category/${params.category}?${queryParams.toString()}`, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Mail Stats Action
export const getMailStats = createAsyncThunk(
  "mail/getMailStats",
  async (_, thunkAPI) => {
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

      const { data } = await axios.get(`${server}/mail/stats/overview`, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Move Mail to Category Action
export const moveMailToCategory = createAsyncThunk(
  "mail/moveMailToCategory",
  async ({ mailId, category }: { mailId: string; category: string }, thunkAPI) => {
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

      const { data } = await axios.patch(`${server}/mail/${mailId}/move-to-category`, { category }, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Remove Mail from Category Action
export const removeMailFromCategory = createAsyncThunk(
  "mail/removeMailFromCategory",
  async ({ mailId, category }: { mailId: string; category: string }, thunkAPI) => {
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

      const { data } = await axios.patch(`${server}/mail/${mailId}/remove-from-category`, { category }, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Toggle Mail Read Status Action
export const toggleMailReadStatus = createAsyncThunk(
  "mail/toggleMailReadStatus",
  async (mailId: string, thunkAPI) => {
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

      const { data } = await axios.patch(`${server}/mail/${mailId}/read`, {}, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Move Mail to Folder Action
export const moveMailToFolder = createAsyncThunk(
  "mail/moveMailToFolder",
  async ({ mailId, folder }: { mailId: string; folder: string }, thunkAPI) => {
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

      const { data } = await axios.patch(`${server}/mail/${mailId}/move`, { folder }, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete Mail Action
export const deleteMail = createAsyncThunk(
  "mail/deleteMail",
  async (mailId: string, thunkAPI) => {
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

      const { data } = await axios.delete(`${server}/mail/${mailId}`, config);
      return { mailId, message: data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Manage Mail Labels Action
export const manageMailLabels = createAsyncThunk(
  "mail/manageMailLabels",
  async ({ mailId, action, label }: { mailId: string; action: 'add' | 'remove'; label: string }, thunkAPI) => {
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

      const { data } = await axios.patch(`${server}/mail/${mailId}/labels`, { action, label }, config);
      return { mailId, ...data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Clear Mail Error Action
export const clearMailError = createAsyncThunk(
  "mail/clearMailError",
  async () => {
    return null;
  }
);
