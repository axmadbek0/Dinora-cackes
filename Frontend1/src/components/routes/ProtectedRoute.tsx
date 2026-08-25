import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from '../../modules/auth/LoginPage';
import { ToastContainer } from '../ui/ToastNotification';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Loading State: Wait until initial token check completes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dinora-bg flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-dinora-gold animate-spin mb-3" />
        <p className="text-sm font-medium text-dinora-chocolate font-serif">
          DINORA Admin Paneli Yuklanmoqda...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State: Show Login Page cleanly without infinite redirects
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // 3. Authenticated State: Render Protected Content
  return <>{children}</>;
};

export default ProtectedRoute;
