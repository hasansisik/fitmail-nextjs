'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { loadUser } from '@/redux/actions/userActions';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !isAuthenticated && !loading) {
      dispatch(loadUser());
    } else if (!token && !loading) {
      // No token, redirect to login
      window.location.href = '/giris';
    }
  }, [dispatch, isAuthenticated, loading]);

  console.log(user.role);

  // Admin kontrolü
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-black mb-4">Giriş Gerekli1</h1>
          <p className="text-gray-600 mb-6">Bu sayfaya erişmek için giriş yapmanız gerekiyor.</p>
          <a 
            href="/giris" 
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Giriş Yap
          </a>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-6">Erişim yetkiniz bulunmamaktadır</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-gray-800"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
