import { createReducer } from "@reduxjs/toolkit";
import {
  sendMail,
  getMailsByCategory,
  getMailsByLabelCategory,
  getMailStats,
  getMailById,
  moveMailToCategory,
  removeMailFromCategory,
  toggleMailReadStatus,
  moveMailToFolder,
  deleteMail,
  manageMailLabels,
  markMailAsImportant,
  markMailAsStarred,
  snoozeMail,
  clearSelectedMail,
  clearMailError,
  addReplyToMail,
  cleanupTrash,
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
  selectedMail: any | null;
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
  selectedMail: null,
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
      
      // Eğer gönderilen kutusundaysak, yeni mail'i listeye ekle
      if (state.currentFolder === 'sent' && action.payload.mail) {
        // Mail zaten listede var mı kontrol et
        const existingMailIndex = state.mails.findIndex(mail => mail._id === action.payload.mail._id);
        if (existingMailIndex === -1) {
          // Mail'i listenin başına ekle (en yeni mail en üstte)
          state.mails.unshift(action.payload.mail);
        }
      }
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
        state.mails[mailIndex].categories = action.payload.categories;
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
        state.mails[mailIndex].categories = action.payload.categories;
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
    // Mark Mail as Important
    .addCase(markMailAsImportant.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(markMailAsImportant.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Update mail in the list
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg);
      if (mailIndex !== -1) {
        state.mails[mailIndex].isImportant = action.payload.isImportant;
      }
    })
    .addCase(markMailAsImportant.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Mark Mail as Starred
    .addCase(markMailAsStarred.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(markMailAsStarred.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Update mail in the list
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg);
      if (mailIndex !== -1) {
        state.mails[mailIndex].isStarred = action.payload.isStarred;
      }
    })
    .addCase(markMailAsStarred.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Snooze Mail
    .addCase(snoozeMail.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(snoozeMail.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Update mail in the list
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg.mailId);
      if (mailIndex !== -1) {
        state.mails[mailIndex].snoozeUntil = action.payload.snoozeUntil;
      }
    })
    .addCase(snoozeMail.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Get Mail by ID
    .addCase(getMailById.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(getMailById.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.selectedMail = action.payload.mail;
      state.mailsError = null;
    })
    .addCase(getMailById.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
      state.selectedMail = null;
    })
    // Clear Selected Mail
    .addCase(clearSelectedMail.fulfilled, (state) => {
      state.selectedMail = null;
    })
    // Clear Mail Error
    .addCase(clearMailError.fulfilled, (state) => {
      state.mailsError = null;
      state.statsError = null;
      state.message = null;
    })
    // Add Reply to Mail
    .addCase(addReplyToMail.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(addReplyToMail.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Eğer cevap mail'i varsa ve gönderilen kutusundaysak, mail listesine ekle
      if (action.payload.replyMail && state.currentFolder === 'sent') {
        // Mail zaten listede var mı kontrol et
        const existingMailIndex = state.mails.findIndex(mail => mail._id === action.payload.replyMail._id);
        if (existingMailIndex === -1) {
          // Mail'i listenin başına ekle (en yeni mail en üstte)
          state.mails.unshift(action.payload.replyMail);
        }
      }
    })
    .addCase(addReplyToMail.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Cleanup Trash
    .addCase(cleanupTrash.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(cleanupTrash.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
    })
    .addCase(cleanupTrash.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    });
});

export default mailReducer;
