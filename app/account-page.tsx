'use client';

import { useState, useEffect, useRef } from 'react';
import { AppLogo, AppLogoWithLoading } from '@/components/app-logo';
import Image from 'next/image';
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
  HelpCircle,
  Grid3x3,
  Grip
} from 'lucide-react';
import { loadUser, editProfile, changePassword, verifyPassword, updateSettings, deleteAccount, switchUser, getAllSessions, removeSession, enable2FA, verify2FA, disable2FA, get2FAStatus } from '@/redux/actions/userActions';
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
import { activeDomains, getMainDomainUrl, server } from "@/config";
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
  const [showAppsMenu, setShowAppsMenu] = useState(false);

  // 2FA state
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [show2FAQRCode, setShow2FAQRCode] = useState(false);
  const [show2FAVerifyDialog, setShow2FAVerifyDialog] = useState(false);
  const [show2FADisableDialog, setShow2FADisableDialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [disable2FAPassword, setDisable2FAPassword] = useState('');

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
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isAuthenticated, error, message, sessions, twoFactor } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated, loading]);

  // Sessions'ı yükle
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getAllSessions());
    }
  }, [dispatch, isAuthenticated, user]);

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

  // Apps menüsünü dışına tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAppsMenu) {
        const target = event.target as Element;
        if (!target.closest('.apps-menu-container')) {
          setShowAppsMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAppsMenu]);

  // Yaş hesaplama fonksiyonu
  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age.toString() : '';
  };

  // Kullanıcı verilerini form'a yükle
  useEffect(() => {
    if (user) {
      const birthDateString = user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "";
      const calculatedAge = calculateAge(birthDateString);

      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        recoveryEmail: user.recoveryEmail || "",
        birthDate: birthDateString,
        age: calculatedAge || user.age || "",
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

      // Profil resmini yükle ve hata durumunu sıfırla
      setAvatarUrl(user.picture || user.profile?.picture || '');
      setImageError(false);

      // Settings'i yükle
      if (user.settings) {
        setSettings(prev => ({
          ...prev,
          ...user.settings
        }));
      }

      // Subdomainler arası ortak oturum listesi: mevcut kullanıcıyı localStorage userSessions'a senkronla
      try {
        const existingSessions = JSON.parse(localStorage.getItem("userSessions") || "[]");
        const idx = existingSessions.findIndex((s: any) => s.email === user.email);
        const sessionPayload = {
          email: user.email,
          token: null, // token çerezde, burada tutmuyoruz
          user: user,
          loginTime: new Date().toISOString()
        };
        if (idx >= 0) {
          existingSessions[idx] = sessionPayload;
        } else {
          existingSessions.push(sessionPayload);
        }
        localStorage.setItem("userSessions", JSON.stringify(existingSessions));
        // Seçili hesabı da garanti altına al
        localStorage.setItem('selectedAccountEmail', user.email);
      } catch (_) {}
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

  // 2FA status check
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(get2FAStatus());
    }
  }, [dispatch, isAuthenticated, user]);

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
    if (user?.picture) {
      return user.picture;
    }
    if (user?.profile?.picture) {
      return user.profile.picture;
    }
    // Return empty string instead of default to show initials
    return '';
  };

  // Check if user has a profile image
  const hasProfileImage = () => {
    return !!(avatarUrl || user?.picture || user?.profile?.picture);
  };

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    window.location.href = '/giris';
  };

  // Hesap değiştirme fonksiyonu
  const handleAccountSwitch = async (email: string) => {
    try {
      // Önce seçili hesabı localStorage'a yaz
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedAccountEmail', email);
      }
      // Daha önce oturum açılmışsa sunucuda aktif hesabı çerezle güncelle
      await fetch(`${server}/auth/switch-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      })
      window.location.reload();
    } catch (error: any) {
      console.error("Account switch failed:", error);
      toast.error("Hesap değiştirilemedi");
    }
  };

  // Hesap kaldırma fonksiyonu
  const handleRemoveAccount = async (email: string) => {
    try {
      await dispatch(removeSession(email)).unwrap();
      if (email === user?.email) {
        // Eğer aktif hesabı kaldırırsak, çıkış yap
        await handleLogout();
      } else {
        toast.success("Hesap kaldırıldı");
      }
    } catch (error: any) {
      console.error("Remove account failed:", error);
      toast.error("Hesap kaldırılamadı");
    }
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

  // Profile menüden link açma
  const handleOpenSection = (section: string) => {
    setActiveNav(section);
    setShowProfileMenu(false);
  };

  // Form düzenleme fonksiyonları
  const handleInputChange = (field: string, value: string) => {
    if (field === 'birthDate') {
      // Doğum tarihi değiştiğinde yaş otomatik hesaplanır
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({
        ...prev,
        [field]: value,
        age: calculatedAge
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Filter out empty values and prepare data
      const profileData: any = {};

      // Basic fields
      if (formData.name && formData.name.trim()) profileData.name = formData.name.trim();
      if (formData.surname && formData.surname.trim()) profileData.surname = formData.surname.trim();
      if (formData.recoveryEmail && formData.recoveryEmail.trim()) profileData.recoveryEmail = formData.recoveryEmail.trim();
      if (formData.birthDate) profileData.birthDate = formData.birthDate;
      if (formData.age && formData.age !== '') {
        const ageValue = parseInt(formData.age.toString());
        if (!isNaN(ageValue)) profileData.age = ageValue;
      }
      if (formData.gender) profileData.gender = formData.gender;
      if (formData.weight && formData.weight !== '') {
        const weightValue = parseFloat(formData.weight.toString());
        if (!isNaN(weightValue)) profileData.weight = weightValue;
      }
      if (formData.height && formData.height !== '') {
        const heightValue = parseInt(formData.height.toString());
        if (!isNaN(heightValue)) profileData.height = heightValue;
      }
      if (formData.phoneNumber && formData.phoneNumber.trim()) profileData.phoneNumber = formData.phoneNumber.trim();
      if (formData.bio && formData.bio.trim()) profileData.bio = formData.bio.trim();

      // Skills array
      if (formData.skills?.trim()) {
        profileData.skills = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      }

      // Address object - only include if at least one field has value
      const addressData: any = {};
      if (formData.street?.trim()) addressData.street = formData.street.trim();
      if (formData.city?.trim()) addressData.city = formData.city.trim();
      if (formData.state?.trim()) addressData.state = formData.state.trim();
      if (formData.postalCode?.trim()) addressData.postalCode = formData.postalCode.trim();
      if (formData.country?.trim()) addressData.country = formData.country.trim();

      // Only include address if it has at least one field
      if (Object.keys(addressData).length > 0) {
        profileData.address = addressData;
      }

      const result = await dispatch(editProfile(profileData));

      if (editProfile.fulfilled.match(result)) {
        setIsEditing(false);
        toast.success('Profil başarıyla güncellendi!');
      } else {
        console.error('Profile update failed:', result.payload);
        toast.error(result.payload as string || 'Profil güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil güncellenirken hata oluştu');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      const birthDateString = user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "";
      const calculatedAge = calculateAge(birthDateString);

      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        recoveryEmail: user.recoveryEmail || "",
        birthDate: birthDateString,
        age: calculatedAge || user.age || "",
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
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';

    // Mobilde seçim sorusu: Kamera mı Dosya mı?
    try {
      if (typeof window !== 'undefined') {
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          const useCamera = window.confirm('Kamera ile fotoğraf çekmek ister misiniz? İptal: Dosyadan seç');
          if (useCamera) {
            input.setAttribute('capture', 'environment');
          } else {
            input.removeAttribute('capture');
          }
        } else {
          input.removeAttribute('capture');
        }
      }
    } catch (_) {
      // Her durumda capture olmadan devam et
      input.removeAttribute('capture');
    }

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
        setImageError(false); // Yeni resim yüklendiğinde hata durumunu temizle
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

  // 2FA Functions
  const handleEnable2FA = async () => {
    try {
      await dispatch(enable2FA()).unwrap();
      setShow2FAQRCode(true);
      setShow2FAVerifyDialog(true);
    } catch (error: any) {
      console.error('Enable 2FA failed:', error);
      toast.error(error || '2FA aktifleştirilemedi');
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error('Lütfen 6 haneli kodu girin');
      return;
    }

    try {
      await dispatch(verify2FA(twoFactorCode)).unwrap();
      toast.success('2FA başarıyla aktifleştirildi!');
      setShow2FAVerifyDialog(false);
      setShow2FAQRCode(false);
      setTwoFactorCode('');
    } catch (error: any) {
      console.error('Verify 2FA failed:', error);
      toast.error(error || '2FA doğrulaması başarısız');
    }
  };

  const handleDisable2FA = async () => {
    if (!disable2FAPassword) {
      toast.error('Lütfen şifrenizi girin');
      return;
    }

    try {
      await dispatch(disable2FA(disable2FAPassword)).unwrap();
      toast.success('2FA başarıyla devre dışı bırakıldı!');
      setShow2FADisableDialog(false);
      setDisable2FAPassword('');
    } catch (error: any) {
      console.error('Disable 2FA failed:', error);
      toast.error(error || '2FA devre dışı bırakılamadı');
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <AppLogoWithLoading size="lg" />
          <div className="h-1 w-24 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
          <p className="text-muted-foreground text-sm mt-2">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa login sayfasını render et (URL değiştirmeden)
  if (!isAuthenticated && !loading) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <AppLogo size="sm" />
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleAbout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Google Apps Button */}
              <div className="relative apps-menu-container">
                <button
                  onClick={() => setShowAppsMenu(!showAppsMenu)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                >
                  <Grip className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* Apps Menu */}
                {showAppsMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Fitmail Uygulamaları</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => {
                            window.location.href = getMainDomainUrl('/mail');
                            setShowAppsMenu(false);
                          }}
                          className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="w-12 h-12 bg-[#490e6f]/10 rounded-lg flex items-center justify-center overflow-hidden">
                            <Image src="/logo.png" alt="Fitmail" width={36} height={36} />
                          </div>
                          <span className="text-xs text-gray-700 font-medium">Fitmail</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative profile-menu-container">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#490e6f] overflow-hidden">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>

                {/* Profile Menu - Gmail Style */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-y-auto">
                    {/* Active Account Section */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4 relative">
                        <h3 className="text-sm text-gray-900 flex-1 text-center">{user?.email}</h3>
                        <button
                          onClick={() => setShowProfileMenu(false)}
                          className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex flex-col items-center">
                        <button
                          onClick={handleAvatarClick}
                          className="w-24 h-24 rounded-full border-2 border-[#490e6f] overflow-hidden mb-3 relative group cursor-pointer"
                        >
                          {hasProfileImage() && getProfileImage() ? (
                            <img
                              src={getProfileImage()}
                              alt={getUserDisplayName()}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#490e6f] text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none">
                            <Camera className="w-5 h-5" />
                          </div>
                        </button>
                        <h2 className="text-xl text-gray-900 mb-1">
                          Merhaba, {getUserDisplayName()}!
                        </h2>
                        <button
                          onClick={() => {
                            handleOpenSection('personal');
                          }}
                          className="mt-4 px-4 py-2 text-[#490e6f] border border-[#490e6f] rounded-lg text-sm font-medium hover:bg-[#490e6f]/10 transition-colors"
                        >
                          Fitmail Hesabınızı yönetin
                        </button>
                      </div>
                    </div>

                    {/* Other Accounts Section */}
                    {sessions && sessions.length > 0 && (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-700">Diğer Hesaplar</h3>
                        </div>
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                          {(() => {
                            const activeEmail = user?.email;
                            const seen = new Set<string>();
                            const normalized = (sessions || []).filter((s: any) => s && s.email && s.email !== activeEmail)
                              .filter((s: any) => {
                                if (seen.has(s.email)) return false;
                                seen.add(s.email);
                                return true;
                              });
                            return normalized.map((session: any) => (
                              <div
                                key={session.email}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                                onClick={() => {
                                  handleAccountSwitch(session.email);
                                  setShowProfileMenu(false);
                                }}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                                    {session.user?.picture ? (
                                      <img
                                        src={session.user.picture}
                                        alt={`${session.user?.name || ''} ${session.user?.surname || ''}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.parentElement!.innerHTML = `
                                            <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                              <span class="text-white font-medium text-xs">${session.user?.name?.[0]?.toUpperCase() || ''}${session.user?.surname?.[0]?.toUpperCase() || ''}</span>
                                            </div>
                                          `;
                                        }}
                                      />
                                    ) : session.user?.profile?.picture ? (
                                      <img
                                        src={session.user.profile.picture}
                                        alt={`${session.user?.name || ''} ${session.user?.surname || ''}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.parentElement!.innerHTML = `
                                            <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                              <span class="text-white font-medium text-xs">${session.user?.name?.[0]?.toUpperCase() || ''}${session.user?.surname?.[0]?.toUpperCase() || ''}</span>
                                            </div>
                                          `;
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-medium text-xs">
                                          {(session.user?.name?.[0] || session.email?.[0] || '').toUpperCase()}
                                          {(session.user?.surname?.[0] || session.email?.split('@')[0]?.[1] || '').toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {(session.user?.name && session.user?.surname) ? `${session.user.name} ${session.user.surname}` : (session.email?.split('@')[0] || '')}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{session.email}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveAccount(session.email);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                >
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Add Account & Sign Out */}
                    <div className="p-4 border-t border-gray-200 space-y-2">
                      <button
                        onClick={() => {
                          window.open('/giris', '_blank');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#490e6f] hover:bg-[#490e6f]/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Başka bir hesap ekle
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Tüm hesapların oturumlarını kapat
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <button
                          onClick={() => handleOpenSection('about')}
                          className="hover:text-gray-700"
                        >
                          Gizlilik Politikası
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => handleOpenSection('about')}
                          className="hover:text-gray-700"
                        >
                          Hizmet Şartları
                        </button>
                      </div>
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
                    className={`flex items-center px-3 py-2 lg:px-4 lg:py-3 text-sm font-medium transition-all duration-200 rounded-lg lg:rounded-r-full ${isActive
                      ? 'bg-[#490e6f]/10 text-[#490e6f]'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 ${isActive ? 'text-[#490e6f]' : 'text-gray-600'}`} />
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
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#490e6f] overflow-hidden">
                    <img
                      src={getProfileImage()}
                      alt={getUserDisplayName()}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute -bottom-1 -right-1 bg-[#490e6f] text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-[#490e6f] transition-colors opacity-0 group-hover:opacity-100"
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
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#490e6f] focus:border-transparent"
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
                          <div className="w-8 h-8 bg-[#490e6f]/10 rounded-full flex items-center justify-center">
                            <suggestion.icon className="w-4 h-4 text-[#490e6f]" />
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
                    <h2 className="text-xl font-semibold text-gray-900">Ana Sayfa</h2>

                    {/* Profil Yönetimi Kartı */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Profiliniz</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        Fitmail hizmetlerinde profilinizin nasıl göründüğünü yönetin ve kişisel bilgilerinizi güncelleyin.
                      </p>
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#490e6f] overflow-hidden">
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
                        className="text-[#490e6f] hover:text-[#490e6f] text-xs sm:text-sm font-medium"
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
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#490e6f]/10 rounded-full flex items-center justify-center">
                            <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-[#490e6f]" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">Güvenlik</p>
                            <p className="text-xs text-gray-500">Aktif koruma</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveNav('privacy')}
                        className="text-[#490e6f] hover:text-[#490e6f] text-xs sm:text-sm font-medium"
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
                          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#490e6f]" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Dil ve Bölge</span>
                        </button>
                        <button
                          onClick={() => setActiveNav('accounts')}
                          className="flex items-center space-x-2 p-2 sm:p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#490e6f]" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Bağlı Hesaplar</span>
                        </button>
                        <button
                          onClick={() => setActiveNav('about')}
                          className="flex items-center space-x-2 p-2 sm:p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#490e6f]" />
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
                              disabled={true}
                              className="mt-1 bg-gray-50 cursor-not-allowed"
                              placeholder="Doğum tarihine göre otomatik hesaplanır"
                            />
                            <p className="text-xs text-gray-500 mt-1">Yaş, doğum tarihine göre otomatik hesaplanır</p>
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
                              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#490e6f] focus:border-transparent"
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
                            className="bg-[#490e6f] hover:bg-[#490e6f]"
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

                    {/* 2FA Bölümü */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">İki Faktörlü Doğrulama (2FA)</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">2FA Durumu</h4>
                              {twoFactor.enabled ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Pasif
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {twoFactor.enabled
                                ? 'Hesabınız iki faktörlü doğrulama ile korunuyor. Her girişte authenticator uygulamanızdan kod girmeniz gerekecek.'
                                : 'Hesabınıza ekstra bir güvenlik katmanı ekleyin. Giriş yaparken şifrenizin yanı sıra telefonunuzdaki bir uygulamadan kod girmeniz gerekecek.'
                              }
                            </p>
                          </div>
                          {twoFactor.enabled ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShow2FADisableDialog(true)}
                              className="ml-4"
                            >
                              Devre Dışı Bırak
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleEnable2FA}
                              className="ml-4 bg-[#490e6f] hover:bg-[#490e6f]"
                            >
                              Aktifleştir
                            </Button>
                          )}
                        </div>
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 ${twoFactor.enabled ? 'bg-green-500' : 'bg-gray-400'} rounded-full`}></div>
                            <span className="text-sm">İki faktörlü doğrulama</span>
                          </div>
                          {twoFactor.enabled && (
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
                      <div className="w-16 h-16 mx-auto mb-4 bg-[#490e6f]/10 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-[#490e6f]" />
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
                              const newSettings = { ...settings, language: value };
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
                              const newSettings = { ...settings, timezone: value };
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
                              const newSettings = { ...settings, dateFormat: value };
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
                              const newSettings = { ...settings, timeFormat: value };
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
                              <div className="w-2 h-2 bg-[#490e6f] rounded-full"></div>
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
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil Resmini Düzenle</DialogTitle>
            <DialogDescription>
              Profil resminizi kırparak düzenleyin. Kare şeklinde bir alan seçin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {previewUrl && (
              <div className="flex justify-center max-w-full overflow-hidden">
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
                    className="max-h-96 max-w-full object-contain"
                    style={{ maxHeight: '70vh' }}
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

      {/* 2FA QR Code ve Doğrulama Dialog'u */}
      <Dialog open={show2FAVerifyDialog} onOpenChange={setShow2FAVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>İki Faktörlü Doğrulamayı Aktifleştir</DialogTitle>
            <DialogDescription>
              Authenticator uygulamanızla (Google Authenticator, Authy, vb.) QR kodu tarayın ve oluşturulan 6 haneli kodu girin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {twoFactor.qrCode && (
              <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg">
                <img src={twoFactor.qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">Doğrulama Kodu</Label>
              <Input
                id="twoFactorCode"
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
              <p className="text-xs text-gray-500">
                Authenticator uygulamanızdan 6 haneli kodu girin
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShow2FAVerifyDialog(false);
                setShow2FAQRCode(false);
                setTwoFactorCode('');
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleVerify2FA}
              disabled={twoFactorCode.length !== 6}
            >
              Doğrula ve Aktifleştir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Devre Dışı Bırakma Dialog'u */}
      <Dialog open={show2FADisableDialog} onOpenChange={setShow2FADisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>İki Faktörlü Doğrulamayı Devre Dışı Bırak</DialogTitle>
            <DialogDescription>
              2FA'yı devre dışı bırakmak için şifrenizi girin. Bu işlem hesabınızın güvenliğini azaltacaktır.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disable2FAPassword">Şifre</Label>
              <Input
                id="disable2FAPassword"
                type="password"
                value={disable2FAPassword}
                onChange={(e) => setDisable2FAPassword(e.target.value)}
                placeholder="Şifrenizi girin"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShow2FADisableDialog(false);
                setDisable2FAPassword('');
              }}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={!disable2FAPassword}
            >
              Devre Dışı Bırak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}