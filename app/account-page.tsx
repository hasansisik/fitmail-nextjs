'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import { 
  User, 
  Shield, 
  Users, 
  Info, 
  Search, 
  Lock,
  Smartphone,
  Key,
  Activity,
  Mail,
  Settings,
  Bell,
  Globe,
  LogOut,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Trash2,
  Camera,
  Home,
  UserCheck,
  ShieldCheck,
  Link,
  Languages,
  HelpCircle
} from 'lucide-react';
import { loadUser, editProfile, changePassword, verifyPassword, updateSettings, deleteAccount } from '@/redux/actions/userActions';
import { RootState, AppDispatch } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/dateUtils';
import { uploadFileToCloudinary } from '@/utils/cloudinary';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { activeDomains } from "@/config";
import LoginPage from "./(logged-out)/giris/page";
import RegisterPage from "./(logged-out)/kayit-ol/page";

const navigationItems = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'personal', label: 'Kişisel Veriler', icon: UserCheck },
  { id: 'privacy', label: 'Güvenlik ve Şifre', icon: ShieldCheck },
  { id: 'accounts', label: 'Bağlı Hesaplar', icon: Link },
  { id: 'language', label: 'Dil ve Bölge', icon: Languages },
  { id: 'about', label: 'Hakkında', icon: HelpCircle },
];

const quickActions = [
  { id: 'home', label: 'Ana Sayfa', icon: Home },
  { id: 'personal', label: 'Kişisel Veriler', icon: UserCheck },
  { id: 'privacy', label: 'Güvenlik ve Şifre', icon: ShieldCheck },
  { id: 'accounts', label: 'Bağlı Hesaplar', icon: Link },
  { id: 'language', label: 'Dil ve Bölge', icon: Languages },
  { id: 'about', label: 'Hakkında', icon: HelpCircle },
];

export default function AccountPage() {
  const pathname = usePathname();
  
  // All hooks must be called before any conditional returns
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  
  // Kişisel veriler için state'ler
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    recoveryEmail: "",
    birthDate: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    phoneNumber: "",
    bio: "",
    skills: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Turkey"
  });
  
  // Şifre değiştirme için state'ler
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'current' | 'new'>('current');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  
  // Dil ve bölge ayarları için state'ler
  const [settings, setSettings] = useState({
    language: "tr",
    timezone: "Europe/Istanbul",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24"
  });

  // Profil resmi için state'ler
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isAuthenticated, error, message } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Sadece client-side'da çalış
    if (typeof window === 'undefined') return;
    
    // Token kontrolü
    const token = localStorage.getItem("accessToken");
    
    if (token && !isAuthenticated && !loading && !user?.email) {
      // Token varsa kullanıcı bilgilerini yükle
      dispatch(loadUser());
    } else if (!token && !loading) {
      // Token yoksa giriş sayfasına yönlendir
      // Giriş sayfasına yönlendir
      window.location.href = '/giris';
    }
  }, [dispatch, isAuthenticated, loading, user?.email]);

  // Profil menüsünü dışına tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        const target = event.target as Element;
        if (!target.closest('.profile-menu-container')) {
          setShowProfileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Arama önerileri dışına tıklayınca kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSearchSuggestions) {
        const target = event.target as Element;
        if (!target.closest('.search-container')) {
          setShowSearchSuggestions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchSuggestions]);

  // Kullanıcı verilerini form'a yükle
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        recoveryEmail: user.recoveryEmail || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
        age: user.age || "",
        gender: user.gender || "",
        weight: user.weight || "",
        height: user.height || "",
        phoneNumber: user.profile?.phoneNumber || "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills?.join(', ') || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        postalCode: user.address?.postalCode || "",
        country: user.address?.country || "Turkey"
      });
      
      // Profil resmini yükle
      setAvatarUrl(user.profile?.picture || '');
      
      // Settings'i yükle
      if (user.settings) {
        setSettings(prev => ({
          ...prev,
          ...user.settings
        }));
      }
    }
  }, [user]);

  // Success/error mesajları
  useEffect(() => {
    if (message) {
      toast.success(message);
    }
    if (error) {
      if (error.includes('Oturum süreniz dolmuş') || error.includes('requiresLogout')) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        window.location.href = '/giris';
      } else {
        toast.error(error);
      }
    }
  }, [message, error]);

  // Giriş sayfalarını render et
  if (pathname === '/giris') {
    return <LoginPage />;
  }
  
  if (pathname === '/kayit-ol') {
    return <RegisterPage />;
  }

  // Kullanıcı adını oluştur
  const getUserDisplayName = () => {
    if (user?.name && user?.surname) {
      return `${user.name} ${user.surname}`;
    }
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Kullanıcı';
  };

  // Profil fotoğrafı URL'si
  const getProfileImage = () => {
    if (avatarUrl) {
      return avatarUrl;
    }
    if (user?.profile?.picture) {
      return user.profile.picture;
    }
    // Varsayılan profil fotoğrafı
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=random&color=fff&size=200`;
  };

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    window.location.href = '/giris';
  };

  // Arama önerileri
  const searchSuggestions = [
    { id: 'personal', label: 'Kişisel Veriler', icon: UserCheck, description: 'Ad, soyad, doğum tarihi ve diğer bilgiler' },
    { id: 'privacy', label: 'Güvenlik ve Şifre', icon: ShieldCheck, description: 'Şifre değiştirme ve güvenlik ayarları' },
    { id: 'language', label: 'Dil ve Bölge', icon: Languages, description: 'Dil, saat dilimi ve tarih formatı' },
    { id: 'accounts', label: 'Bağlı Hesaplar', icon: Link, description: 'Google, Microsoft ve diğer platformlar' },
    { id: 'about', label: 'Hakkında', icon: HelpCircle, description: 'Fitmail hesap bilgileri ve sürüm' }
  ];

  // Filtrelenmiş öneriler
  const filteredSuggestions = searchSuggestions.filter(suggestion =>
    suggestion.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Arama fonksiyonu
  const handleSearch = (suggestionId?: string) => {
    if (suggestionId) {
      setActiveNav(suggestionId);
      setSearchQuery('');
      setShowSearchSuggestions(false);
    } else if (searchQuery.trim()) {
      // Genel arama - ilk eşleşen öneriyi göster
      const firstMatch = filteredSuggestions[0];
      if (firstMatch) {
        setActiveNav(firstMatch.id);
        setSearchQuery('');
        setShowSearchSuggestions(false);
      }
    }
  };

  // Arama input değişikliği
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchSuggestions(value.length > 0);
  };

  // Hakkında sayfası açma
  const handleAbout = () => {
    setActiveNav('about');
  };

  // Form düzenleme fonksiyonları
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const profileData = {
        name: formData.name,
        surname: formData.surname,
        recoveryEmail: formData.recoveryEmail,
        birthDate: formData.birthDate,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        }
      };
      
      await dispatch(editProfile(profileData));
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        recoveryEmail: user.recoveryEmail || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
        age: user.age || "",
        gender: user.gender || "",
        weight: user.weight || "",
        height: user.height || "",
        phoneNumber: user.profile?.phoneNumber || "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills?.join(', ') || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        postalCode: user.address?.postalCode || "",
        country: user.address?.country || "Turkey"
      });
    }
  };

  // Şifre değiştirme fonksiyonları
  const handlePasswordChange = () => {
    setShowPasswordDialog(true);
    setPasswordStep('current');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
  };

  const handleCurrentPasswordSubmit = async () => {
    try {
      setPasswordError('');
      const result = await dispatch(verifyPassword(passwordData.currentPassword));
      
      if (result.payload?.isValid) {
        setPasswordStep('new');
        setPasswordError('');
      } else {
        setPasswordError('Mevcut şifre yanlış');
      }
    } catch (error: any) {
      setPasswordError(error || 'Şifre doğrulama sırasında hata oluştu');
    }
  };

  const handleNewPasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalı');
      return;
    }
    
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }));
      
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
      setPasswordStep('current');
    } catch (error) {
      setPasswordError('Şifre değiştirme sırasında hata oluştu');
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setPasswordStep('current');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  // Profil resmi fonksiyonları
  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    ));
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

    try {
      setIsUploading(true);
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Blob'u File'a çevir
      const file = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' });
      
      // Cloudinary'ye yükle
      const uploadResult = await uploadFileToCloudinary(file);
      
      if (uploadResult) {
        // Profil resmini güncelle
        await dispatch(editProfile({ 
          picture: uploadResult
        }));
        
        setAvatarUrl(uploadResult);
        setShowCropModal(false);
        setPreviewUrl('');
        setSelectedFile(null);
        toast.success('Profil resmi başarıyla güncellendi!');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Profil resmi yüklenirken hata oluştu!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setPreviewUrl('');
    setSelectedFile(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  // Hesap silme fonksiyonu
  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccount());
      toast.success('Hesabınız başarıyla silindi');
      // Çıkış yap ve login sayfasına yönlendir
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      window.location.href = '/giris';
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Hesap silinirken hata oluştu');
    } finally {
      setShowDeleteAccountDialog(false);
    }
  };

  // Dil ve bölge ayarları
  const handleSaveSettings = async () => {
    try {
      await dispatch(updateSettings(settings));
    } catch (error) {
      console.error('Settings update failed:', error);
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
          </div>
          </div>
    );
  }

  // Kullanıcı giriş yapmamışsa (client-side kontrol)
  if (typeof window !== 'undefined' && !isAuthenticated && !user?.email && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-gray-900 font-bold text-lg sm:text-xl">Fitmail</span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => handleSearch()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button 
                onClick={handleAbout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="relative profile-menu-container">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-blue-500 overflow-hidden">
                    <img 
                      src={getProfileImage()} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
                
                {/* Profile Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
            <aside className="w-full lg:w-64 mb-6 lg:mb-0 lg:pr-8">
              <nav className="flex flex-wrap lg:flex-col lg:space-y-1 space-x-2 lg:space-x-0 justify-center lg:justify-start">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center px-3 py-2 lg:px-4 lg:py-3 text-sm font-medium transition-all duration-200 rounded-lg lg:rounded-r-full ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 ${isActive ? 'text-blue-700' : 'text-gray-600'}`} />
                      <span className="text-xs sm:text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-2xl">
              {/* Profile Section */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-500 overflow-hidden">
                    <img 
                      src={getProfileImage()} 
                      alt={getUserDisplayName()} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Hoş geldiniz {getUserDisplayName()}
            </h1>
                <p className="text-sm sm:text-base text-gray-600 mb-4 px-4 sm:px-0">
                  Fitmail'den en iyi şekilde yararlanmak için bilgi, gizlilik ve güvenliğinizi yönetin.
                </p>
                
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                    Premium
                  </span>
          </div>

                {user?.email && (
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    {user.email}
                  </p>
                )}
  
          </div>

              {/* Search Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="relative search-container">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Fitmail Hesabında ara"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => searchQuery.length > 0 && setShowSearchSuggestions(true)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Arama Önerileri */}
                  {showSearchSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {filteredSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSearch(suggestion.id)}
                          className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <suggestion.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{suggestion.label}</p>
                            <p className="text-sm text-gray-500">{suggestion.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Sonuç bulunamadı */}
                  {showSearchSuggestions && searchQuery.length > 0 && filteredSuggestions.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                      <p className="text-gray-500 text-center">"{searchQuery}" için sonuç bulunamadı</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Content Based on Active Tab */}
              <div className="mt-12">
                {activeNav === 'home' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Ana Sayfa</h2>
                    
                    {/* Profil Yönetimi Kartı */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Profiliniz</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        Fitmail hizmetlerinde profilinizin nasıl göründüğünü yönetin ve kişisel bilgilerinizi güncelleyin.
                      </p>
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-blue-500 overflow-hidden">
                          <img 
                            src={getProfileImage()} 
                            alt={getUserDisplayName()} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{getUserDisplayName()}</h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveNav('personal')}
                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                      >
                        Profili düzenle →
                      </button>
                    </div>

                    {/* Güvenlik ve Gizlilik Kartı */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Güvenlik ve Gizlilik</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        Hesabınızın güvenliğini artırın ve gizlilik ayarlarınızı yönetin.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Şifre</p>
                            <p className="text-xs text-gray-500">Son güncelleme: Bu ay</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Güvenlik</p>
                            <p className="text-xs text-gray-500">Aktif koruma</p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveNav('privacy')}
                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                      >
                        Güvenlik ayarları →
                      </button>
          </div>

                    {/* Hızlı Erişim Kartı */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Hızlı Erişim</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        Sık kullanılan ayarlara hızlıca erişin.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        <button 
                          onClick={() => setActiveNav('language')}
                          className="flex items-center space-x-2 p-2 sm:p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Dil ve Bölge</span>
                        </button>
                        <button 
                          onClick={() => setActiveNav('accounts')}
                          className="flex items-center space-x-2 p-2 sm:p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Bağlı Hesaplar</span>
                        </button>
                        <button 
                          onClick={() => setActiveNav('about')}
                          className="flex items-center space-x-2 p-2 sm:p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Hakkında</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeNav === 'personal' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Kişisel Veriler</h2>
                        <p className="text-gray-600">
                          Kişisel bilgilerinizi buradan yönetebilirsiniz.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        {isEditing ? 'İptal' : 'Düzenle'}
            </Button>
          </div>

                    <div>
                      {/* Temel Bilgiler */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Ad</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="surname">Soyad</Label>
                            <Input
                              id="surname"
                              value={formData.surname}
                              onChange={(e) => handleInputChange('surname', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                              id="email"
                              value={formData.email}
                              disabled
                              className="mt-1 bg-gray-50"
                            />
                          </div>
                          <div>
                            <Label htmlFor="recoveryEmail">Kurtarma E-postası</Label>
                            <Input
                              id="recoveryEmail"
                              value={formData.recoveryEmail}
                              onChange={(e) => handleInputChange('recoveryEmail', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Kişisel Detaylar */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Detaylar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="birthDate">Doğum Tarihi</Label>
                            <Input
                              id="birthDate"
                              type="date"
                              value={formData.birthDate}
                              onChange={(e) => handleInputChange('birthDate', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="age">Yaş</Label>
                            <Input
                              id="age"
                              type="number"
                              value={formData.age}
                              onChange={(e) => handleInputChange('age', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="gender">Cinsiyet</Label>
                            <Select
                              value={formData.gender}
                              onValueChange={(value) => handleInputChange('gender', value)}
                              disabled={!isEditing}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Cinsiyet seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Erkek</SelectItem>
                                <SelectItem value="female">Kadın</SelectItem>
                                <SelectItem value="other">Diğer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="phoneNumber">Telefon Numarası</Label>
                            <Input
                              id="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                              disabled={!isEditing}
                              placeholder="+90 5XX XXX XX XX"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="weight">Kilo (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              value={formData.weight}
                              onChange={(e) => handleInputChange('weight', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="height">Boy (cm)</Label>
                            <Input
                              id="height"
                              type="number"
                              value={formData.height}
                              onChange={(e) => handleInputChange('height', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Profil Bilgileri */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil Bilgileri</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="bio">Biyografi</Label>
                            <textarea
                              id="bio"
                              value={formData.bio}
                              onChange={(e) => handleInputChange('bio', e.target.value)}
                              disabled={!isEditing}
                              rows={3}
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="skills">Fitness Yetenekleri</Label>
                            <Input
                              id="skills"
                              value={formData.skills}
                              onChange={(e) => handleInputChange('skills', e.target.value)}
                              disabled={!isEditing}
                              placeholder="Fitness yeteneklerinizi virgülle ayırarak yazın (örn: Kardiyo, Ağırlık Antrenmanı, Yoga, Pilates, Koşu)"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Adres Bilgileri */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="street">Cadde/Sokak</Label>
                            <Input
                              id="street"
                              value={formData.street}
                              onChange={(e) => handleInputChange('street', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">İl</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">İlçe</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="postalCode">Posta Kodu</Label>
                            <Input
                              id="postalCode"
                              value={formData.postalCode}
                              onChange={(e) => handleInputChange('postalCode', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Ülke</Label>
                            <Input
                              id="country"
                              value={formData.country}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end gap-2 mt-6">
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                          >
                            İptal
                          </Button>
                          <Button
                            onClick={handleSaveProfile}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Kaydet
            </Button>
                        </div>
                      )}
          </div>

              </div>
                )}
                
                {activeNav === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Güvenlik ve Şifre</h2>
                    <p className="text-gray-600">
                      Hesap güvenliğinizi ve şifre ayarlarınızı buradan yönetebilirsiniz.
                    </p>

                    {/* Şifre Bölümü */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Şifre</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Şifre</h4>
                          {user?.auth?.passwordChangedAt && (
                            <p className="text-sm text-gray-500">
                              Son değişiklik: {formatRelativeTime(user.auth.passwordChangedAt)}
                            </p>
                          )}
            </div>
                        <Button variant="outline" size="sm" onClick={handlePasswordChange}>
                          Değiştir
                        </Button>
              </div>
                    </div>

                    {/* Güvenlik Durumu */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik Durumu</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">E-posta doğrulandı</span>
                          </div>
                          {user?.isVerified && (
                            <span className="text-xs text-green-600 font-medium">✓ Aktif</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hesap Silme */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tehlikeli Bölge</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-red-900 mb-1">Hesabınızı Silin</h4>
                            <p className="text-sm text-red-700 mb-3">
                              Hesabınızı silmek geri alınamaz bir işlemdir. Tüm verileriniz kalıcı olarak silinecektir.
              </p>
            </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setShowDeleteAccountDialog(true)}
                            className="ml-4"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hesabı Sil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                  {activeNav === 'accounts' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900">Bağlı Hesaplar</h2>
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Yakında Gelecek</h3>
                        <p className="text-gray-600 text-sm">
                          Artık hesabınız ile platformlara doğrudan erişim sağlayacaksınız. Google, Microsoft ve diğer platformlarla entegrasyon yakında aktif olacak.
                        </p>
                      </div>
                    </div>
                  )}
                
                {activeNav === 'language' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">Dil ve Bölge</h2>
                      <p className="text-gray-600">
                        Dil ve bölge ayarlarınızı buradan değiştirebilirsiniz. Değişiklikler otomatik olarak kaydedilir.
                      </p>
                    </div>

                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="language">Dil</Label>
                          <Select 
                            value={settings.language} 
                            onValueChange={(value) => {
                              const newSettings = {...settings, language: value};
                              setSettings(newSettings);
                              dispatch(updateSettings(newSettings));
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tr">Türkçe</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="de">Deutsch</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="timezone">Saat Dilimi</Label>
                          <Select 
                            value={settings.timezone} 
                            onValueChange={(value) => {
                              const newSettings = {...settings, timezone: value};
                              setSettings(newSettings);
                              dispatch(updateSettings(newSettings));
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                              <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                              <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                              <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="dateFormat">Tarih Formatı</Label>
                          <Select 
                            value={settings.dateFormat} 
                            onValueChange={(value) => {
                              const newSettings = {...settings, dateFormat: value};
                              setSettings(newSettings);
                              dispatch(updateSettings(newSettings));
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="timeFormat">Saat Formatı</Label>
                          <Select 
                            value={settings.timeFormat} 
                            onValueChange={(value) => {
                              const newSettings = {...settings, timeFormat: value};
                              setSettings(newSettings);
                              dispatch(updateSettings(newSettings));
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24">24 Saat</SelectItem>
                              <SelectItem value="12">12 Saat (AM/PM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
              </div>
                )}
                
                {activeNav === 'about' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Hakkında</h2>
                    <p className="text-gray-600">
                      Fitmail hesap yönetim sayfası hakkında bilgiler.
                    </p>

                    <div className="space-y-6">
                      {/* Fitmail Hakkında */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Fitmail Hesap Yönetimi</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Bu sayfa Fitmail hesabınızı yönetmek için tasarlanmış kapsamlı bir hesap yönetim panelidir. 
                          Kişisel bilgilerinizi düzenleyebilir, güvenlik ayarlarınızı yönetebilir ve hesap tercihlerinizi 
                          özelleştirebilirsiniz.
                        </p>
                      </div>

                      {/* Özellikler */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Özellikler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium">Kişisel Veri Yönetimi</span>
              </div>
                            <p className="text-xs text-gray-500 ml-4">Ad, soyad, e-posta ve kişisel bilgilerinizi güncelleyin</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium">Güvenlik Kontrolü</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-4">Şifre değiştirme ve güvenlik durumu takibi</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-sm font-medium">Dil ve Bölge</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-4">Dil, saat dilimi ve format ayarları</p>
            </div>
            <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-sm font-medium">Bağlı Hesaplar</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-4">Bağlı hesaplarınızı yönetin</p>
                          </div>
                        </div>
                      </div>

                      {/* Sürüm Bilgileri */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sürüm Bilgileri</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sürüm:</span>
                            <span className="font-medium">1.0.0</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Son Güncelleme:</span>
                            <span className="font-medium">2025</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Platform:</span>
                            <span className="font-medium">Web</span>
                          </div>
                        </div>
              </div>

                      {/* İletişim */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Destek</h3>
                        <p className="text-gray-600 text-sm">
                          Hesabınızla ilgili sorularınız için destek ekibimizle iletişime geçebilirsiniz. 
                          Güvenlik konularında herhangi bir endişeniz varsa lütfen derhal bizimle iletişime geçin.
              </p>
            </div>
          </div>
        </div>
                )}
      </div>
            </div>
          </main>
        </div>
      </div>

      {/* Şifre Değiştirme Dialog'u */}
      <Dialog open={showPasswordDialog} onOpenChange={handlePasswordDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {passwordStep === 'current' ? 'Mevcut Şifrenizi Girin' : 'Yeni Şifre Belirleyin'}
            </DialogTitle>
            <DialogDescription>
              {passwordStep === 'current' 
                ? 'Şifrenizi değiştirmek için önce mevcut şifrenizi girin.'
                : 'Hesabınız için yeni bir şifre belirleyin.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {passwordStep === 'current' ? (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Mevcut şifrenizi girin"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Yeni şifrenizi girin"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handlePasswordDialogClose}>
              İptal
            </Button>
            <Button 
              onClick={passwordStep === 'current' ? handleCurrentPasswordSubmit : handleNewPasswordSubmit}
              disabled={
                passwordStep === 'current' 
                  ? !passwordData.currentPassword 
                  : !passwordData.newPassword || !passwordData.confirmPassword
              }
            >
              {passwordStep === 'current' ? 'Devam Et' : 'Şifreyi Değiştir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profil Resmi Kırpma Modalı */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profil Resmini Düzenle</DialogTitle>
            <DialogDescription>
              Profil resminizi kırparak düzenleyin. Kare şeklinde bir alan seçin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewUrl && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={previewUrl}
                    onLoad={onImageLoad}
                    className="max-h-96"
                  />
                </ReactCrop>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCropCancel}
              disabled={isUploading}
            >
              İptal
            </Button>
            <Button
              onClick={handleCropComplete}
              disabled={!completedCrop || isUploading}
            >
              {isUploading ? 'Yükleniyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hesap Silme Onay Dialog'u */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabınızı Silmek İstediğinizden Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir. 
              Bu işlemden sonra hesabınıza tekrar erişemeyeceksiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Evet, Hesabımı Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}