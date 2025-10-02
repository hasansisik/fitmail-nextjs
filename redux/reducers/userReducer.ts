import { createReducer } from "@reduxjs/toolkit";
import {
  register,
  googleRegister,
  googleAuth,
  login,
  googleLogin,
  loadUser,
  logout,
  verifyEmail,
  againEmail,
  forgotPassword,
  resetPassword,
  editProfile,
  createListing,
  getAllListings,
  getUserListings,
  updateListing,
  deleteListing,
  toggleListingStatus,
  approveListing,
  rejectListing,
  getPendingListings,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getAllUsers,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  getUnreadCount,
  markMessagesAsRead,
  markUserMessagesAsRead,
  getAllInstruments,
  updateTheme,
  clearError,
} from "../actions/userActions";

interface UserState {
  users: any[];
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated?: boolean;
  isVerified?: boolean;
  message?: string | null;
  listings: any[];
  allListings: any[];
  userListings: any[];
  listingsLoading: boolean;
  listingsError: string | null;
  categories: any[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  instruments: any[];
  instrumentsLoading: boolean;
  instrumentsError: string | null;
  allUsers: any[];
  userStats: any;
  usersLoading: boolean;
  usersError: string | null;
  conversations: any[];
  currentMessages: any[];
  currentConversation: any;
  messagesLoading: boolean;
  messagesError: string | null;
  unreadCount: number;
}

const initialState: UserState = {
  users: [],
  user: {},
  loading: false,
  error: null,
  listings: [],
  allListings: [],
  userListings: [],
  listingsLoading: false,
  listingsError: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  instruments: [],
  instrumentsLoading: false,
  instrumentsError: null,
  allUsers: [],
  userStats: null,
  usersLoading: false,
  usersError: null,
  conversations: [],
  currentMessages: [],
  currentConversation: null,
  messagesLoading: false,
  messagesError: null,
  unreadCount: 0,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    // Register
    .addCase(register.pending, (state) => {
      state.loading = true;
    })
    .addCase(register.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.isVerified = false; // User needs to verify email
      state.message = null;
      state.error = null;
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Google Register
    .addCase(googleRegister.pending, (state) => {
      state.loading = true;
    })
    .addCase(googleRegister.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.message = null;
      state.error = null;
    })
    .addCase(googleRegister.rejected, (state, action) => {
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
    // Google Auth (Unified)
    .addCase(googleAuth.pending, (state) => {
      state.loading = true;
    })
    .addCase(googleAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.message = null;
      state.error = null;
    })
    .addCase(googleAuth.rejected, (state, action) => {
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
    // Login
    .addCase(login.pending, (state) => {
      state.loading = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isVerified = true; // Login successful means user is verified
      state.user = action.payload;
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
    // Google Login
    .addCase(googleLogin.pending, (state) => {
      state.loading = true;
    })
    .addCase(googleLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(googleLogin.rejected, (state, action) => {
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
      state.message = action.payload;
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
      state.user = action.payload;
    })
    .addCase(editProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Create Listing
    .addCase(createListing.pending, (state) => {
      state.listingsLoading = true;
      state.listingsError = null;
      state.message = null;
    })
    .addCase(createListing.fulfilled, (state, action) => {
      state.listingsLoading = false;
      state.userListings.unshift(action.payload.listing);
      state.message = action.payload.message;
      state.listingsError = null;
    })
    .addCase(createListing.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
      state.message = null;
    })
    // Get All Listings
    .addCase(getAllListings.pending, (state) => {
      state.listingsLoading = true;
    })
    .addCase(getAllListings.fulfilled, (state, action) => {
      state.listingsLoading = false;
      state.allListings = action.payload.listings;
      state.listings = action.payload.listings;
    })
    .addCase(getAllListings.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
    })
    // Get User Listings
    .addCase(getUserListings.pending, (state) => {
      state.listingsLoading = true;
    })
    .addCase(getUserListings.fulfilled, (state, action) => {
      state.listingsLoading = false;
      state.userListings = action.payload.listings;
    })
    .addCase(getUserListings.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
    })
    // Update Listing
    .addCase(updateListing.pending, (state) => {
      state.listingsLoading = true;
      state.listingsError = null;
      state.message = null;
    })
    .addCase(updateListing.fulfilled, (state, action) => {
      state.listingsLoading = false;
      const index = state.userListings.findIndex(listing => listing._id === action.payload.listing._id);
      if (index !== -1) {
        state.userListings[index] = action.payload.listing;
      }
      const allIndex = state.allListings.findIndex(listing => listing._id === action.payload.listing._id);
      if (allIndex !== -1) {
        state.allListings[allIndex] = action.payload.listing;
      }
      state.message = action.payload.message;
      state.listingsError = null;
    })
    .addCase(updateListing.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
      state.message = null;
    })
    // Delete Listing
    .addCase(deleteListing.pending, (state) => {
      state.listingsLoading = true;
      state.listingsError = null;
      state.message = null;
    })
    .addCase(deleteListing.fulfilled, (state, action) => {
      state.listingsLoading = false;
      state.userListings = state.userListings.filter(listing => listing._id !== action.payload.id);
      state.allListings = state.allListings.filter(listing => listing._id !== action.payload.id);
      state.message = action.payload.message;
      state.listingsError = null;
    })
    .addCase(deleteListing.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
      state.message = null;
    })
    // Toggle Listing Status
    .addCase(toggleListingStatus.pending, (state) => {
      state.listingsLoading = true;
    })
    .addCase(toggleListingStatus.fulfilled, (state, action) => {
      state.listingsLoading = false;
      const index = state.userListings.findIndex(listing => listing._id === action.payload.listing._id);
      if (index !== -1) {
        state.userListings[index] = action.payload.listing;
      }
      const allIndex = state.allListings.findIndex(listing => listing._id === action.payload.listing._id);
      if (allIndex !== -1) {
        state.allListings[allIndex] = action.payload.listing;
      }
      state.message = action.payload.message;
    })
    .addCase(toggleListingStatus.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
    })
    // Approve Listing
    .addCase(approveListing.pending, (state) => {
      state.listingsLoading = true;
    })
    .addCase(approveListing.fulfilled, (state, action) => {
      state.listingsLoading = false;
      const index = state.userListings.findIndex(listing => listing._id === action.payload.listing._id);
      if (index !== -1) {
        state.userListings[index] = action.payload.listing;
      }
      const allIndex = state.allListings.findIndex(listing => listing._id === action.payload.listing._id);
      if (allIndex !== -1) {
        state.allListings[allIndex] = action.payload.listing;
      }
      state.message = action.payload.message;
    })
    .addCase(approveListing.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
    })
    // Reject Listing
    .addCase(rejectListing.pending, (state) => {
      state.listingsLoading = true;
    })
    .addCase(rejectListing.fulfilled, (state, action) => {
      state.listingsLoading = false;
      const index = state.userListings.findIndex(listing => listing._id === action.payload.listing._id);
      if (index !== -1) {
        state.userListings[index] = action.payload.listing;
      }
      const allIndex = state.allListings.findIndex(listing => listing._id === action.payload.listing._id);
      if (allIndex !== -1) {
        state.allListings[allIndex] = action.payload.listing;
      }
      state.message = action.payload.message;
    })
    .addCase(rejectListing.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
    })
    // Get Pending Listings
    .addCase(getPendingListings.pending, (state) => {
      state.listingsLoading = true;
    })
    .addCase(getPendingListings.fulfilled, (state, action) => {
      state.listingsLoading = false;
      state.allListings = action.payload.listings;
    })
    .addCase(getPendingListings.rejected, (state, action) => {
      state.listingsLoading = false;
      state.listingsError = action.payload as string;
    })
    // Create Category
    .addCase(createCategory.pending, (state) => {
      state.categoriesLoading = true;
    })
    .addCase(createCategory.fulfilled, (state, action) => {
      state.categoriesLoading = false;
      state.categories.unshift(action.payload.category);
      state.message = action.payload.message;
    })
    .addCase(createCategory.rejected, (state, action) => {
      state.categoriesLoading = false;
      state.categoriesError = action.payload as string;
    })
    // Get All Categories
    .addCase(getAllCategories.pending, (state) => {
      state.categoriesLoading = true;
    })
    .addCase(getAllCategories.fulfilled, (state, action) => {
      state.categoriesLoading = false;
      state.categories = action.payload.categories;
    })
    .addCase(getAllCategories.rejected, (state, action) => {
      state.categoriesLoading = false;
      state.categoriesError = action.payload as string;
    })
    // Get All Instruments
    .addCase(getAllInstruments.pending, (state) => {
      state.instrumentsLoading = true;
    })
    .addCase(getAllInstruments.fulfilled, (state, action) => {
      state.instrumentsLoading = false;
      state.instruments = action.payload.instruments;
    })
    .addCase(getAllInstruments.rejected, (state, action) => {
      state.instrumentsLoading = false;
      state.instrumentsError = action.payload as string;
    })
    // Update Category
    .addCase(updateCategory.pending, (state) => {
      state.categoriesLoading = true;
    })
    .addCase(updateCategory.fulfilled, (state, action) => {
      state.categoriesLoading = false;
      const index = state.categories.findIndex(category => category._id === action.payload.category._id);
      if (index !== -1) {
        state.categories[index] = action.payload.category;
      }
      state.message = action.payload.message;
    })
    .addCase(updateCategory.rejected, (state, action) => {
      state.categoriesLoading = false;
      state.categoriesError = action.payload as string;
    })
    // Delete Category
    .addCase(deleteCategory.pending, (state) => {
      state.categoriesLoading = true;
    })
    .addCase(deleteCategory.fulfilled, (state, action) => {
      state.categoriesLoading = false;
      state.categories = state.categories.filter(category => category._id !== action.payload.id);
      state.message = action.payload.message;
    })
    .addCase(deleteCategory.rejected, (state, action) => {
      state.categoriesLoading = false;
      state.categoriesError = action.payload as string;
    })
    // Toggle Category Status
    .addCase(toggleCategoryStatus.pending, (state) => {
      state.categoriesLoading = true;
    })
    .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
      state.categoriesLoading = false;
      const index = state.categories.findIndex(category => category._id === action.payload.category._id);
      if (index !== -1) {
        state.categories[index] = action.payload.category;
      }
      state.message = action.payload.message;
    })
    .addCase(toggleCategoryStatus.rejected, (state, action) => {
      state.categoriesLoading = false;
      state.categoriesError = action.payload as string;
    })
    // Get All Users
    .addCase(getAllUsers.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(getAllUsers.fulfilled, (state, action) => {
      state.usersLoading = false;
      state.allUsers = action.payload.users;
      state.userStats = action.payload.stats;
      state.message = action.payload.message;
    })
    .addCase(getAllUsers.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Delete User
    .addCase(deleteUser.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(deleteUser.fulfilled, (state, action) => {
      state.usersLoading = false;
      state.allUsers = state.allUsers.filter(user => user._id !== action.payload.id);
      state.message = action.payload.message;
    })
    .addCase(deleteUser.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Update User Role
    .addCase(updateUserRole.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(updateUserRole.fulfilled, (state, action) => {
      state.usersLoading = false;
      const index = state.allUsers.findIndex(user => user._id === action.payload.id);
      if (index !== -1) {
        state.allUsers[index].role = action.payload.role;
      }
      state.message = action.payload.message;
    })
    .addCase(updateUserRole.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Update User Status
    .addCase(updateUserStatus.pending, (state) => {
      state.usersLoading = true;
    })
    .addCase(updateUserStatus.fulfilled, (state, action) => {
      state.usersLoading = false;
      const index = state.allUsers.findIndex(user => user._id === action.payload.id);
      if (index !== -1) {
        state.allUsers[index].status = action.payload.status;
      }
      state.message = action.payload.message;
    })
    .addCase(updateUserStatus.rejected, (state, action) => {
      state.usersLoading = false;
      state.usersError = action.payload as string;
    })
    // Get Conversations
    .addCase(getConversations.pending, (state) => {
      state.messagesLoading = true;
    })
    .addCase(getConversations.fulfilled, (state, action) => {
      state.messagesLoading = false;
      state.conversations = action.payload.conversations;
      state.messagesError = null; // Clear any previous errors
    })
    .addCase(getConversations.rejected, (state, action) => {
      state.messagesLoading = false;
      state.messagesError = action.payload as string;
    })
    // Get Messages
    .addCase(getMessages.pending, (state) => {
      state.messagesLoading = true;
    })
    .addCase(getMessages.fulfilled, (state, action) => {
      state.messagesLoading = false;
      state.currentMessages = action.payload.messages;
      state.currentConversation = action.payload.conversation;
      state.messagesError = null; // Clear any previous errors
    })
    .addCase(getMessages.rejected, (state, action) => {
      state.messagesLoading = false;
      state.messagesError = action.payload as string;
    })
    // Send Message
    .addCase(sendMessage.pending, (state) => {
      state.messagesLoading = true;
    })
    .addCase(sendMessage.fulfilled, (state, action) => {
      state.messagesLoading = false;
      // Don't push message here to prevent duplicates
      // Messages will be loaded via getMessages or WebSocket
      
      // Update conversation in conversations list
      const conversationIndex = state.conversations.findIndex(
        conv => conv.id === action.payload.conversation._id
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = action.payload.message.content;
        state.conversations[conversationIndex].timestamp = action.payload.message.timestamp;
        // Move conversation to top
        const updatedConversation = state.conversations.splice(conversationIndex, 1)[0];
        state.conversations.unshift(updatedConversation);
      }
    })
    .addCase(sendMessage.rejected, (state, action) => {
      state.messagesLoading = false;
      state.messagesError = action.payload as string;
    })
    // Start Conversation
    .addCase(startConversation.pending, (state) => {
      state.messagesLoading = true;
    })
    .addCase(startConversation.fulfilled, (state, action) => {
      state.messagesLoading = false;
      state.messagesError = null; // Clear any previous errors
      
      // Check if conversation already exists before adding
      const existingIndex = state.conversations.findIndex(
        conv => conv.id === action.payload.conversation.id
      );
      
      if (existingIndex === -1) {
        // Add new conversation only if it doesn't exist
        state.conversations.unshift(action.payload.conversation);
      } else {
        // Update existing conversation
        state.conversations[existingIndex] = action.payload.conversation;
      }
      
      state.currentConversation = action.payload.conversation;
      state.currentMessages = [];
    })
    .addCase(startConversation.rejected, (state, action) => {
      state.messagesLoading = false;
      state.messagesError = action.payload as string;
    })
    // Get Unread Count
    .addCase(getUnreadCount.pending, (state) => {
      // No loading state needed for this action
    })
    .addCase(getUnreadCount.fulfilled, (state, action) => {
      // Only update unreadCount if payload is not null (304 response)
      if (action.payload !== null) {
        state.unreadCount = action.payload.unreadCount;
      }
    })
    .addCase(getUnreadCount.rejected, (state, action) => {
      state.messagesError = action.payload as string;
    })
    // Mark Messages as Read
    .addCase(markMessagesAsRead.pending, (state) => {
      // No loading state needed for this action
    })
    .addCase(markMessagesAsRead.fulfilled, (state, action) => {
      const { conversationId } = action.payload;
      
      // Mark messages from OTHER users as read (not current user's messages)
      // Current user's messages should only be marked as read when the other party reads them
      state.currentMessages = state.currentMessages.map(message => {
        if (message.senderId !== state.user?._id) {
          return {
            ...message,
            isRead: true
          };
        }
        return message;
      });
      
      // Update conversation unread count to 0
      const conversationIndex = state.conversations.findIndex(
        conv => conv.id === conversationId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].unreadCount = 0;
      }
      
      // Update total unread count
      state.unreadCount = Math.max(0, state.unreadCount - 
        (state.conversations.find(conv => conv.id === conversationId)?.unreadCount || 0)
      );
    })
    .addCase(markMessagesAsRead.rejected, (state, action) => {
      state.messagesError = action.payload as string;
    })
    // Mark User Messages as Read
    .addCase(markUserMessagesAsRead.pending, (state) => {
      // No loading state needed for this action
    })
    .addCase(markUserMessagesAsRead.fulfilled, (state, action) => {
      const { conversationId } = action.payload;
      
      // Mark current user's messages as read
      state.currentMessages = state.currentMessages.map(message => {
        if (message.senderId === state.user?._id) {
          return {
            ...message,
            isRead: true
          };
        }
        return message;
      });
    })
    .addCase(markUserMessagesAsRead.rejected, (state, action) => {
      state.messagesError = action.payload as string;
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
    // Clear Error
    .addCase(clearError.fulfilled, (state) => {
      state.error = null;
      state.message = null;
      state.listingsError = null;
      state.categoriesError = null;
      state.usersError = null;
      state.messagesError = null;
    });
});

export default userReducer;