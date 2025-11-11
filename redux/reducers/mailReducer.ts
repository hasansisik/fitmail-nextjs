import { createReducer } from "@reduxjs/toolkit";
import {
  sendMail,
  saveDraft,
  getMailsByCategory,
  getMailsByLabelCategory,
  getStarredMails,
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
  openComposeDialog,
  closeComposeDialog,
  scheduleMail,
  getScheduledMails,
  cancelScheduledMail,
  updateScheduledMail,
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
  composeDialog: {
    isOpen: boolean;
    replyMode: 'reply' | 'replyAll' | 'forward' | null;
    originalMail: any | null;
    draftMail: any | null;
    scheduledMail: any | null;
  };
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
  composeDialog: {
    isOpen: false,
    replyMode: null,
    originalMail: null,
    draftMail: null,
    scheduledMail: null,
  },
};

export const mailReducer = createReducer(initialState, (builder) => {
  builder
    // Save Draft
    .addCase(saveDraft.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(saveDraft.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Eğer taslaklar kutusundaysak, taslağı listeye ekle veya güncelle
      if (state.currentFolder === 'drafts' && action.payload.draft) {
        const existingDraftIndex = state.mails.findIndex(mail => mail._id === action.payload.draft._id);
        if (existingDraftIndex === -1) {
          // Taslağı listenin başına ekle (en yeni taslak en üstte)
          state.mails.unshift(action.payload.draft);
        } else {
          // Mevcut taslağı güncelle
          state.mails[existingDraftIndex] = action.payload.draft;
        }
      }
    })
    .addCase(saveDraft.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
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
      
      // Eğer taslağı gönderiyorsak, taslaklar listesinden çıkar
      if (state.currentFolder === 'drafts' && action.payload.deletedDraftId) {
        // Silinen taslağı listeden çıkar
        state.mails = state.mails.filter(mail => mail._id !== action.payload.deletedDraftId);
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
      // Mail'lerde labels ve categories field'larını normalize et
      state.mails = (action.payload.mails || []).map((mail: any) => ({
        ...mail,
        labels: mail.labels || [],
        categories: mail.categories || []
      }));
      state.currentFolder = action.payload.folder || "inbox";
      state.mailsError = null;
    })
    .addCase(getMailsByCategory.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Get Starred Mails
    .addCase(getStarredMails.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(getStarredMails.fulfilled, (state, action) => {
      state.mailsLoading = false;
      // Mail'lerde labels ve categories field'larını normalize et
      state.mails = (action.payload.mails || []).map((mail: any) => ({
        ...mail,
        labels: mail.labels || [],
        categories: mail.categories || []
      }));
      state.currentFolder = "starred";
      state.mailsError = null;
    })
    .addCase(getStarredMails.rejected, (state, action) => {
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
      // Mail'lerde labels ve categories field'larını normalize et
      state.mails = (action.payload.mails || []).map((mail: any) => ({
        ...mail,
        labels: mail.labels || [],
        categories: mail.categories || []
      }));
      state.currentCategory = action.payload.category || "";
      // Label kategorileri için currentFolder'ı da güncelle (kategori adı ile)
      state.currentFolder = action.payload.category || "";
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
        const oldCategories = state.mails[mailIndex].categories || [];
        const newCategories = action.payload.categories || [];
        
        state.mails[mailIndex].labels = action.payload.labels || state.mails[mailIndex].labels || [];
        state.mails[mailIndex].categories = newCategories || [];
        
        // Eğer mail mevcut kategori sayfasındaysa ve kategorisi değiştiyse, listede kalmalı
        // Ancak eğer mail mevcut kategoriye eklendiyse, listede kalmalı
        // Eğer mail mevcut kategoriden çıkarıldıysa ve mevcut kategori sayfasındaysak, listeden kaldır
        const isCurrentCategory = state.currentCategory === action.meta.arg.category;
        const wasInCategory = oldCategories.includes(action.meta.arg.category);
        const isNowInCategory = newCategories.includes(action.meta.arg.category);
        
        // Eğer mevcut kategori sayfasındaysak ve mail bu kategoriden çıkarıldıysa, listeden kaldır
        if (isCurrentCategory && wasInCategory && !isNowInCategory) {
          state.mails = state.mails.filter(mail => mail._id !== action.meta.arg.mailId);
        }
      }
      
      // Update selected mail if it's the same
      if (state.selectedMail && state.selectedMail._id === action.meta.arg.mailId) {
        state.selectedMail.labels = action.payload.labels || state.selectedMail.labels || [];
        state.selectedMail.categories = action.payload.categories || state.selectedMail.categories || [];
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
        const oldCategories = state.mails[mailIndex].categories || [];
        const newCategories = action.payload.categories || [];
        
        state.mails[mailIndex].labels = action.payload.labels || state.mails[mailIndex].labels || [];
        state.mails[mailIndex].categories = newCategories || [];
        
        // Eğer mevcut kategori sayfasındaysak ve mail bu kategoriden çıkarıldıysa, listeden kaldır
        const isCurrentCategory = state.currentCategory === action.meta.arg.category;
        const wasInCategory = oldCategories.includes(action.meta.arg.category);
        const isNowInCategory = newCategories.includes(action.meta.arg.category);
        
        if (isCurrentCategory && wasInCategory && !isNowInCategory) {
          state.mails = state.mails.filter(mail => mail._id !== action.meta.arg.mailId);
        }
      }
      
      // Update selected mail if it's the same
      if (state.selectedMail && state.selectedMail._id === action.meta.arg.mailId) {
        state.selectedMail.labels = action.payload.labels || state.selectedMail.labels || [];
        state.selectedMail.categories = action.payload.categories || state.selectedMail.categories || [];
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
        const oldFolder = state.mails[mailIndex].folder;
        const newFolder = action.payload.folder;
        
        // Mail'in folder'ını güncelle
        state.mails[mailIndex].folder = newFolder;
        
        // Eğer mail farklı bir klasöre taşındıysa ve mevcut klasörde değilse, listeden kaldır
        // Bu, mail'in görüntülendiği klasörden çıkmasını sağlar
        // currentFolder veya currentCategory ile karşılaştır (label kategorileri için)
        // NOT: starred bir kategori değil, bir özellik olduğu için folder değişikliğinde starred sayfasından kaldırmayız
        const isCurrentFolder = state.currentFolder === oldFolder || state.currentCategory === oldFolder;
        const isNewFolder = state.currentFolder === newFolder || state.currentCategory === newFolder;
        
        // Eğer mail farklı klasöre taşındıysa ve mevcut klasördeyse ama yeni klasörde değilse, listeden kaldır
        // starred sayfasındaysak, folder değişikliği mail'i listeden kaldırmamalı (çünkü starred bir özellik)
        if (oldFolder !== newFolder && isCurrentFolder && !isNewFolder && state.currentFolder !== 'starred') {
          // Mail farklı klasöre taşındı, mevcut listeden kaldır
          state.mails = state.mails.filter(mail => mail._id !== action.meta.arg.mailId);
        }
      }
      
      // Eğer seçili mail taşındıysa ve farklı klasöre gittiyse, seçimi temizle
      if (state.selectedMail && state.selectedMail._id === action.meta.arg.mailId) {
        // Seçili mail'in folder'ını güncelle
        state.selectedMail.folder = action.payload.folder;
        
        // Eğer mail farklı klasöre taşındıysa ve mevcut klasörde değilse, seçimi temizle
        // starred sayfasındaysak, folder değişikliği seçimi temizlememeli
        const isCurrentFolder = state.currentFolder === state.selectedMail.folder || state.currentCategory === state.selectedMail.folder;
        if (!isCurrentFolder && state.currentFolder !== 'starred') {
          state.selectedMail = null;
        }
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
      
      // Eğer seçili mail silindiyse, seçimi temizle
      if (state.selectedMail && state.selectedMail._id === action.payload.mailId) {
        state.selectedMail = null;
      }
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
      
      // Update mail in the list - mail'i listeden kaldırma, sadece isStarred flag'ini güncelle
      // Çünkü bir mail hem starred hem başka bir klasörde olabilir (örn: hem sent hem starred)
      const mailIndex = state.mails.findIndex(mail => mail._id === action.meta.arg);
      if (mailIndex !== -1) {
        state.mails[mailIndex].isStarred = action.payload.isStarred;
      }
      
      // Update selected mail if it's the same
      if (state.selectedMail && state.selectedMail._id === action.meta.arg) {
        state.selectedMail.isStarred = action.payload.isStarred;
      }
      
      // Eğer starred sayfasındaysak ve mail yıldızdan çıkarıldıysa, listeden kaldır
      // Ama eğer başka bir sayfadaysak (örn: sent), mail listede kalmalı
      if (state.currentFolder === 'starred' && !action.payload.isStarred) {
        state.mails = state.mails.filter(mail => mail._id !== action.meta.arg);
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
    })
    // Open Compose Dialog
    .addCase(openComposeDialog.fulfilled, (state, action) => {
      state.composeDialog = {
        isOpen: true,
        replyMode: action.payload.replyMode || null,
        originalMail: action.payload.originalMail || null,
        draftMail: action.payload.draftMail || null,
        scheduledMail: action.payload.scheduledMail || null,
      };
    })
    // Close Compose Dialog
    .addCase(closeComposeDialog.fulfilled, (state) => {
      state.composeDialog = {
        isOpen: false,
        replyMode: null,
        originalMail: null,
        draftMail: null,
        scheduledMail: null,
      };
    })
    // Schedule Mail
    .addCase(scheduleMail.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(scheduleMail.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Eğer planlı maillerdeyse, listeye ekle
      if (state.currentFolder === 'scheduled' && action.payload.mail) {
        const existingMailIndex = state.mails.findIndex(mail => mail._id === action.payload.mail._id);
        if (existingMailIndex === -1) {
          state.mails.unshift(action.payload.mail);
        }
      }
      
      // Eğer taslağı planlıyorsak, taslaklar listesinden çıkar
      if (state.currentFolder === 'drafts' && action.payload.deletedDraftId) {
        state.mails = state.mails.filter(mail => mail._id !== action.payload.deletedDraftId);
      }
    })
    .addCase(scheduleMail.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Get Scheduled Mails
    .addCase(getScheduledMails.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(getScheduledMails.fulfilled, (state, action) => {
      state.mailsLoading = false;
      // Mail'lerde labels ve categories field'larını normalize et
      state.mails = (action.payload.mails || []).map((mail: any) => ({
        ...mail,
        labels: mail.labels || [],
        categories: mail.categories || []
      }));
      state.currentFolder = "scheduled";
      state.mailsError = null;
    })
    .addCase(getScheduledMails.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Cancel Scheduled Mail
    .addCase(cancelScheduledMail.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(cancelScheduledMail.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Planlı maillerden kaldır
      if (state.currentFolder === 'scheduled') {
        state.mails = state.mails.filter(mail => mail._id !== action.meta.arg);
      }
    })
    .addCase(cancelScheduledMail.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    })
    // Update Scheduled Mail
    .addCase(updateScheduledMail.pending, (state) => {
      state.mailsLoading = true;
      state.mailsError = null;
    })
    .addCase(updateScheduledMail.fulfilled, (state, action) => {
      state.mailsLoading = false;
      state.message = action.payload.message;
      state.mailsError = null;
      
      // Planlı maillerdeyse, listeyi güncelle
      if (state.currentFolder === 'scheduled' && action.payload.mail) {
        const mailIndex = state.mails.findIndex(mail => mail._id === action.payload.mail._id);
        if (mailIndex !== -1) {
          state.mails[mailIndex] = action.payload.mail;
        }
      }
    })
    .addCase(updateScheduledMail.rejected, (state, action) => {
      state.mailsLoading = false;
      state.mailsError = action.payload as string;
    });
});

export default mailReducer;
