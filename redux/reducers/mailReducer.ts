import { createReducer } from "@reduxjs/toolkit";
import {
  sendMail,
  getMailsByCategory,
  getMailsByLabelCategory,
  getMailStats,
  moveMailToCategory,
  removeMailFromCategory,
  toggleMailReadStatus,
  moveMailToFolder,
  deleteMail,
  manageMailLabels,
  clearMailError,
} from "../actions/mailActions";

interface MailState {
  mails: any[];
  mailsLoading: boolean;
  mailsError: string | null;
  currentFolder: string;
  currentCategory: string;
  mailStats: any;
  statsLoading: boolean;
  statsError: string | null;
  message: string | null;
}

const initialState: MailState = {
  mails: [],
  mailsLoading: false,
  mailsError: null,
  currentFolder: "inbox",
  currentCategory: "",
  mailStats: null,
  statsLoading: false,
  statsError: null,
  message: null,
};

export const mailReducer = createReducer(initialState, (builder) => {
  builder
    // Send Mail
    .addCase(sendMail.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(sendMail.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
    })
    .addCase(sendMail.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Get Mails by Category
    .addCase(getMailsByCategory.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(getMailsByCategory.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.mails = action.payload.mails || [];
      state.currentFolder = action.payload.folder || "inbox";
      state.mailsError = null;
    })
    .addCase(getMailsByCategory.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Get Mails by Label Category
    .addCase(getMailsByLabelCategory.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(getMailsByLabelCategory.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.mails = action.payload.mails || [];
      state.currentCategory = action.payload.category || "";
      state.mailsError = null;
    })
    .addCase(getMailsByLabelCategory.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Get Mail Stats
    .addCase(getMailStats.pending, (state) => {
      state.statsLoading = true;
      state.statsError = null;
    })
    .addCase(getMailStats.fulfilled, (state, action) => {
      state.statsLoading = false;
      state.mailStats = action.payload.stats;
      state.statsError = null;
    })
    .addCase(getMailStats.rejected, (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload as string;
    })
    // Move Mail to Category
    .addCase(moveMailToCategory.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(moveMailToCategory.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Update mail in the list
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg.mailId);
      if (mailIndex !== -1) {
        state.mails[mailIndex].labels = action.payload.labels;
      }
    })
    .addCase(moveMailToCategory.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Remove Mail from Category
    .addCase(removeMailFromCategory.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(removeMailFromCategory.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Update mail in the list
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg.mailId);
      if (mailIndex !== -1) {
        state.mails[mailIndex].labels = action.payload.labels;
      }
    })
    .addCase(removeMailFromCategory.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Toggle Mail Read Status
    .addCase(toggleMailReadStatus.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(toggleMailReadStatus.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Update mail in the list
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg);
      if (mailIndex !== -1) {
        state.mails[mailIndex].isRead = action.payload.isRead;
      }
    })
    .addCase(toggleMailReadStatus.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Move Mail to Folder
    .addCase(moveMailToFolder.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(moveMailToFolder.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Update mail in the list
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg.mailId);
      if (mailIndex !== -1) {
        state.mails[mailIndex].folder = action.payload.folder;
      }
    })
    .addCase(moveMailToFolder.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Delete Mail
    .addCase(deleteMail.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(deleteMail.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Remove mail from the list
      state.mails = state.mails.filter(mail => mail._id !== action.payload.mailId);
    })
    .addCase(deleteMail.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Manage Mail Labels
    .addCase(manageMailLabels.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(manageMailLabels.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Update mail in the list
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg.mailId);
      if (mailIndex !== -1) {
        state.mails[mailIndex].labels = action.payload.labels;
      }
    })
    .addCase(manageMailLabels.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Clear Mail Error
    .addCase(clearMailError.fulfilled, (state) => {
      state.mailsError = null;
      state.statsError = null;
      state.message = null;
    });
});

export default mailReducer;
