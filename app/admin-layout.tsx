'use client';

import { useEffect } from 'react';
import { AppLogoWithLoading } from '@/components/app-logo';
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
    if (!isAuthenticated && !loading) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated, loading]);


  // Admin kontrolü
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <AppLogoWithLoading size="lg" />
          <div className="h-1 w-24 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AppLogoWithLoading size="lg" />
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
