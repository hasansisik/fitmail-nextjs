import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";

// Çapraz subdomain çerezleri için
axios.defaults.withCredentials = true;

// Add axios interceptor to handle token errors and redirect to login
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
    
    return Promise.reject(error);
  }
);

// Save Draft Action
export const saveDraft = createAsyncThunk(
  "mail/saveDraft",
  async (draftData: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    content?: string;
    htmlContent?: string;
    draftId?: string;
    attachments?: Array<{
      filename: string;
      data: File;
      contentType: string;
      size: number;
      url?: string;
    }>;
  }, thunkAPI) => {
    try {
      // Cookie tabanlı auth kullanılıyor

      // Prepare FormData for file uploads
      const formData = new FormData();
      
      // Add basic draft data
      if (draftData.to && draftData.to.length > 0) {
        formData.append('to', JSON.stringify(draftData.to));
      }
      if (draftData.subject) {
        formData.append('subject', draftData.subject);
      }
      if (draftData.content) {
        formData.append('content', draftData.content);
        formData.append('htmlContent', draftData.htmlContent || draftData.content);
      }
      
      if (draftData.cc) {
        formData.append('cc', JSON.stringify(draftData.cc));
      }
      if (draftData.bcc) {
        formData.append('bcc', JSON.stringify(draftData.bcc));
      }
      if (draftData.draftId) {
        formData.append('draftId', draftData.draftId);
      }
      
      // Add attachments
      if (draftData.attachments && draftData.attachments.length > 0) {
        const attachmentNames = draftData.attachments.map(att => att.filename);
        const attachmentTypes = draftData.attachments.map(att => att.contentType);
        const attachmentUrls = draftData.attachments.map(att => att.url || '');
        
        draftData.attachments.forEach((attachment) => {
          formData.append(`attachments`, attachment.data);
        });
        
        formData.append('attachmentNames', JSON.stringify(attachmentNames));
        formData.append('attachmentTypes', JSON.stringify(attachmentTypes));
        formData.append('attachmentUrls', JSON.stringify(attachmentUrls));
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.post(`${server}/mail/save-draft`, formData, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

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
    draftId?: string;
    attachments?: Array<{
      filename: string;
      data: File;
      contentType: string;
      size: number;
      url?: string;
    }>;
  }, thunkAPI) => {
    try {
      // Cookie tabanlı auth kullanılıyor

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
      if (mailData.draftId) {
        formData.append('draftId', mailData.draftId);
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
// Get Starred Mails
export const getStarredMails = createAsyncThunk(
  "mail/getStarredMails",
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    isRead?: boolean;
  } = {}, thunkAPI) => {
    try {
      // Cookie tabanlı auth kullanılıyor

      const config = {} as any;

      // Query parametrelerini oluştur
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

      const { data } = await axios.get(`${server}/mail/starred/list?${queryParams.toString()}`, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Yıldızlı mailler alınamadı");
    }
  }
);

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
      // Cookie tabanlı auth kullanılıyor

      const config = {} as any;

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
      // Cookie tabanlı auth kullanılıyor

      const config = {} as any;

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
      // Cookie tabanlı auth kullanılıyor

      const config = {} as any;

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
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
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
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
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
      // Cookie tabanlı auth kullanılıyor

      const config = {} as any;

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
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
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
      // Cookie tabanlı auth kullanılıyor

      const config = {} as any;

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
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
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
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
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
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
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
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
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
      // Cookie tabanlı auth kullanılıyor

      const config = {} as any;

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

// Add Reply to Mail Action
export const addReplyToMail = createAsyncThunk(
  "mail/addReplyToMail",
  async ({ 
    mailId, 
    content, 
    attachments 
  }: { 
    mailId: string; 
    content: string;
    attachments?: Array<{
      filename: string;
      data: File;
      contentType: string;
      size: number;
      url?: string;
    }>;
  }, thunkAPI) => {
    try {
      // Cookie tabanlı auth kullanılıyor

      // Eğer attachment varsa FormData kullan, yoksa JSON
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        formData.append('content', content);
        
        // Add attachments
        const attachmentNames = attachments.map(att => att.filename);
        const attachmentTypes = attachments.map(att => att.contentType);
        const attachmentUrls = attachments.map(att => att.url || '');
        
        attachments.forEach((attachment) => {
          formData.append(`attachments`, attachment.data);
        });
        
        formData.append('attachmentNames', JSON.stringify(attachmentNames));
        formData.append('attachmentTypes', JSON.stringify(attachmentTypes));
        formData.append('attachmentUrls', JSON.stringify(attachmentUrls));
        
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        const { data } = await axios.post(`${server}/mail/${mailId}/reply`, formData, config);
        return data;
      } else {
        // Attachment yoksa JSON gönder
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const { data } = await axios.post(`${server}/mail/${mailId}/reply`, { content }, config);
        return data;
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Cleanup Trash Action
export const cleanupTrash = createAsyncThunk(
  "mail/cleanupTrash",
  async (_, thunkAPI) => {
    try {
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(`${server}/mail/cleanup-trash`, {}, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Compose Dialog Actions (synchronous)
export const openComposeDialog = createAsyncThunk(
  "mail/openComposeDialog",
  async (payload: {
    replyMode?: 'reply' | 'replyAll' | 'forward' | null;
    originalMail?: any;
    draftMail?: any;
  }) => {
    return payload;
  }
);

export const closeComposeDialog = createAsyncThunk(
  "mail/closeComposeDialog",
  async () => {
    return {};
  }
);

// Schedule Mail Action
export const scheduleMail = createAsyncThunk(
  "mail/scheduleMail",
  async (mailData: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    content: string;
    htmlContent?: string;
    draftId?: string;
    scheduledSendAt: string;
    attachments?: Array<{
      filename: string;
      data: File;
      contentType: string;
      size: number;
      url?: string;
    }>;
  }, thunkAPI) => {
    try {
      // Cookie tabanlı auth kullanılıyor

      // Prepare FormData for file uploads
      const formData = new FormData();
      
      // Add basic mail data
      formData.append('to', JSON.stringify(mailData.to));
      formData.append('subject', mailData.subject);
      formData.append('content', mailData.content);
      formData.append('htmlContent', mailData.htmlContent || mailData.content);
      formData.append('scheduledSendAt', mailData.scheduledSendAt);
      
      if (mailData.cc) {
        formData.append('cc', JSON.stringify(mailData.cc));
      }
      if (mailData.bcc) {
        formData.append('bcc', JSON.stringify(mailData.bcc));
      }
      if (mailData.draftId) {
        formData.append('draftId', mailData.draftId);
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
        },
      };

      const { data } = await axios.post(`${server}/mail/schedule`, formData, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get Scheduled Mails Action
export const getScheduledMails = createAsyncThunk(
  "mail/getScheduledMails",
  async (params: {
    page?: number;
    limit?: number;
  } = {}, thunkAPI) => {
    try {
      // Cookie tabanlı auth kullanılıyor

      const config = {} as any;

      // Query parametrelerini oluştur
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const { data } = await axios.get(`${server}/mail/scheduled/list?${queryParams.toString()}`, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Planlı mailler alınamadı");
    }
  }
);

// Cancel Scheduled Mail Action
export const cancelScheduledMail = createAsyncThunk(
  "mail/cancelScheduledMail",
  async (mailId: string, thunkAPI) => {
    try {
      // Cookie tabanlı auth kullanılıyor

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(`${server}/mail/${mailId}/cancel-schedule`, {}, config);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
