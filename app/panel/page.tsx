'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { loadUser } from '@/redux/actions/userActions';
import { 
  getAllPremiums, 
  createPremium, 
  deletePremium, 
  togglePremiumStatus,
  CreatePremiumPayload,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  UpdateUserRolePayload,
  UpdateUserStatusPayload
} from '@/redux/actions/userActions';
import { 
  Users, 
  Crown, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';


export default function PanelPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isAuthenticated, allUsers } = useSelector((state: RootState) => state.user);
  const { premiums, loading: premiumLoading } = useSelector((state: RootState) => state.premium);
  
  const [activeTab, setActiveTab] = useState<'users' | 'premium'>('users');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [newDomain, setNewDomain] = useState({ name: '', price: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingDomain, setIsCreatingDomain] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !isAuthenticated && !loading) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated, loading]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      dispatch(getAllPremiums());
      dispatch(getAllUsers({}));
    }
  }, [dispatch, isAuthenticated, user]);

  // UUID generator for premium codes
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    
    // TODO: Implement add user API call
    toast.success('Kullanıcı ekleme özelliği yakında eklenecek');
    setNewUser({ name: '', email: '', role: 'user' });
    setShowAddUserDialog(false);
  };

  const handleAddDomain = async () => {
    if (!newDomain.name || !newDomain.price) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    
    setIsCreatingDomain(true);
    const premiumData: CreatePremiumPayload = {
      name: `${newDomain.name}@gozdedijital.xyz`,
      price: parseFloat(newDomain.price),
      duration: 30 // Default 30 days
    };
    
    try {
      await dispatch(createPremium(premiumData)).unwrap();
      setNewDomain({ name: '', price: '' });
      setShowAddDomainDialog(false);
      toast.success('Premium domain başarıyla eklendi');
    } catch (error) {
      toast.error('Premium domain eklenirken hata oluştu');
    } finally {
      setIsCreatingDomain(false);
    }
  };

  const handleUserStatusChange = async (userId: string, status: string) => {
    try {
      const payload: UpdateUserStatusPayload = { id: userId, status: status as 'active' | 'inactive' };
      await dispatch(updateUserStatus(payload)).unwrap();
      toast.success('Kullanıcı durumu güncellendi');
    } catch (error) {
      toast.error('Kullanıcı durumu güncellenirken hata oluştu');
    }
  };

  const handleUserRoleChange = async (userId: string, role: string) => {
    try {
      const payload: UpdateUserRolePayload = { id: userId, role: role as 'admin' | 'user' };
      await dispatch(updateUserRole(payload)).unwrap();
      toast.success('Kullanıcı yetkisi güncellendi');
    } catch (error) {
      toast.error('Kullanıcı yetkisi güncellenirken hata oluştu');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success('Kullanıcı silindi');
    } catch (error) {
      toast.error('Kullanıcı silinirken hata oluştu');
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      await dispatch(deletePremium(domainId)).unwrap();
      toast.success('Premium domain silindi');
    } catch (error) {
      toast.error('Premium domain silinirken hata oluştu');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    window.location.href = '/giris';
  };

  // Loading state
  if (loading || allUsers.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Auth check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giriş Gerekli</h1>
          <p className="text-gray-600 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
          <a 
            href="/giris" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Giriş Yap
          </a>
        </div>
      </div>
    );
  }

  // Admin check
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-6">Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor.</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Fitmail Admin Panel</h1>
                  <p className="text-blue-100 text-sm">Sistem Yönetimi</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg px-4 py-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-white">
                  <p className="text-sm font-medium">{user?.name} {user?.surname}</p>
                  <p className="text-xs text-blue-100 capitalize">{user?.role}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.users.length}</div>
              <p className="text-xs text-muted-foreground">
                +{allUsers.users.filter(u => u.status === 'active').length} aktif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Domainler</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{premiums.length}</div>
              <p className="text-xs text-muted-foreground">
                Aktif planlar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Kullanıcılar</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.users.filter(u => u.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">
                Bu ay
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Kullanıcılar</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.users.filter(u => u.role === 'admin').length}</div>
              <p className="text-xs text-muted-foreground">
                Sistem yöneticileri
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Kullanıcılar</span>
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'premium'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Crown className="w-5 h-5" />
              <span>Premium Domainler</span>
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
              <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Kullanıcı Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                    <DialogDescription>
                      Sisteme yeni bir kullanıcı ekleyin.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Kullanıcı adı"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="kullanici@example.com"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Yetki</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Kullanıcı</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                      İptal
                    </Button>
                    <Button onClick={handleAddUser}>
                      Ekle
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Listesi</CardTitle>
                <CardDescription>
                  Sistemdeki tüm kullanıcıları yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Yetki</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {user.profile?.picture ? (
                                <img 
                                  src={user.profile.picture} 
                                  alt={`${user.name} ${user.surname}`} 
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-600 text-sm font-medium">
                                  {user.name?.charAt(0)?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span>{user.name} {user.surname}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select 
                            value={user.role} 
                            onValueChange={(value) => handleUserRoleChange(user._id, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Kullanıcı</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={user.status} 
                            onValueChange={(value) => handleUserStatusChange(user._id, value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Aktif</SelectItem>
                              <SelectItem value="inactive">Pasif</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user._id)}>
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Premium Tab */}
        {activeTab === 'premium' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Premium Domain Yönetimi</h2>
              <Dialog open={showAddDomainDialog} onOpenChange={setShowAddDomainDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Domain Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni Premium Domain Ekle</DialogTitle>
                    <DialogDescription>
                      Yeni bir premium domain oluşturun. Kullanıcı adı yazın, @gozdedijital.xyz otomatik eklenecek.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="domainName">Domain Adı</Label>
                      <div className="flex items-center">
                        <div className="relative flex-1">
                          <Input
                            id="domainName"
                            value={newDomain.name}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Remove @ symbol if user tries to type it
                              value = value.replace('@', '');
                              // Remove gmail, google, yahoo, hotmail, outlook if user tries to type them
                              value = value.replace(/gmail|google|yahoo|hotmail|outlook/gi, '');
                              // Only allow alphanumeric characters, dots, underscores, and hyphens
                              value = value.replace(/[^a-zA-Z0-9._-]/g, '');
                              setNewDomain({ ...newDomain, name: value });
                            }}
                            placeholder="kullaniciadi"
                            className="rounded-r-none h-10"
                          />
                        </div>
                        <span className="bg-muted border border-l-0 border-input px-3 h-10 flex items-center text-sm text-muted-foreground rounded-r-md">
                          @gozdedijital.xyz
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sadece harf, rakam, nokta, alt çizgi ve tire kullanabilirsiniz.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="planPrice">Fiyat (₺)</Label>
                      <Input
                        id="planPrice"
                        type="number"
                        value={newDomain.price}
                        onChange={(e) => setNewDomain({ ...newDomain, price: e.target.value })}
                        placeholder="99.99"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDomainDialog(false)} disabled={isCreatingDomain}>
                      İptal
                    </Button>
                    <Button onClick={handleAddDomain} disabled={isCreatingDomain}>
                      {isCreatingDomain ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Ekleniyor...
                        </>
                      ) : (
                        'Ekle'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Premium Domains Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {premiums.map((plan) => (
                <Card key={plan._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{plan.name.includes('@gozdedijital.xyz') ? plan.name : `${plan.name}@gozdedijital.xyz`}</span>
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </CardTitle>
                    <CardDescription>
                      Premium domain detayları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fiyat:</span>
                        <span className="text-lg font-bold text-green-600">₺{plan.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Kod:</span>
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {plan.code}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(plan.code);
                              toast.success('Kod kopyalandı');
                            }}
                          >
                            Kopyala
                          </Button>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Domaini Sil
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Domaini Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu premium domaini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDomain(plan._id)}>
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}