import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/userAuthContext';
import LoginPage from './components/ui/LoginPage/LoginPage';
import FileUpload from './components/ui/FileUpload/FileUpload';
import OTPVerification from './components/EmailVerification/EmailVerification';

// Updated ProtectedRoute to use Firebase auth
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>; // Add a proper loading spinner here
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const VerificationRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, emailVerificationNeeded } = useAuth();
  
  if (!user || !emailVerificationNeeded) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/verify-email"
            element={
              <VerificationRoute>
                <OTPVerification />
              </VerificationRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <FileUpload />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;