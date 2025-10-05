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
    attachments?: Array<{
      filename: string;
      data: File;
      contentType: string;
      size: number;
      url?: string;
    }>;
  }, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return thunkAPI.rejectWithValue("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }

      // Prepare FormData for file uploads
      const formData = new FormData();
      
      // Add basic mail data
      formData.append('to', JSON.stringify(mailData.to));
      formData.append('subject', mailData.subject);
      formData.append('content', mailData.content);
      formData.append('htmlContent', mailData.htmlContent || mailData.content);
      
      if (mailData.cc) {
        formData.append('cc', JSON.stringify(mailData.cc));
      }
      if (mailData.bcc) {
        formData.append('bcc', JSON.stringify(mailData.bcc));
      }
      
      // Add attachments
      if (mailData.attachments && mailData.attachments.length > 0) {
        const attachmentNames = mailData.attachments.map(att => att.filename);
        const attachmentTypes = mailData.attachments.map(att => att.contentType);
        const attachmentUrls = mailData.attachments.map(att => att.url || '');
        
        mailData.attachments.forEach((attachment) => {
          formData.append(`attachments`, attachment.data);
        });
        
        formData.append('attachmentNames', JSON.stringify(attachmentNames));
        formData.append('attachmentTypes', JSON.stringify(attachmentTypes));
        formData.append('attachmentUrls', JSON.stringify(attachmentUrls));
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(`${server}/mail/send`, formData, config);
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

      const { data } = await axios.get(`${server}/mail/label-category/${params.category}?${queryParams.toString()}`, config);
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

// Mark Mail as Important Action
export const markMailAsImportant = createAsyncThunk(
  "mail/markMailAsImportant",
  async (mailId: string, thunkAPI) => {
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

      const { data } = await axios.patch(`${server}/mail/${mailId}/important`, {}, config);
      return { mailId, ...data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Mark Mail as Starred Action
export const markMailAsStarred = createAsyncThunk(
  "mail/markMailAsStarred",
  async (mailId: string, thunkAPI) => {
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

      const { data } = await axios.patch(`${server}/mail/${mailId}/starred`, {}, config);
      return { mailId, ...data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Snooze Mail Action
export const snoozeMail = createAsyncThunk(
  "mail/snoozeMail",
  async ({ mailId, snoozeUntil }: { mailId: string; snoozeUntil: string }, thunkAPI) => {
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

      const { data } = await axios.patch(`${server}/mail/${mailId}/snooze`, { snoozeUntil }, config);
      return { mailId, ...data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Mail by ID Action
export const getMailById = createAsyncThunk(
  "mail/getMailById",
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

      const { data } = await axios.get(`${server}/mail/${mailId}`, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Clear Selected Mail Action
export const clearSelectedMail = createAsyncThunk(
  "mail/clearSelectedMail",
  async () => {
    return null;
  }
);

// Clear Mail Error Action
export const clearMailError = createAsyncThunk(
  "mail/clearMailError",
  async () => {
    return null;
  }
);
