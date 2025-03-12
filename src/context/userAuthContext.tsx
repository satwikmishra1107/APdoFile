import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  applyActionCode
} from '@firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  emailVerificationNeeded: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signupWithEmail: (email: string, password: string) => Promise<void>;
  PasswordResetEmail: (email: string) => Promise<void>;  // Keep this type
  verifyEmail: (otp: string) => Promise<void>;
  resendEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);

      if (!userCredential.user.emailVerified) {
        setEmailVerificationNeeded(true);
        navigate('/verify-email');
      } else {
        navigate('/upload');
      }
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      navigate('/upload');
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (otp: string) => {
    try {
      if (!user) throw new Error('No user found');
      await applyActionCode(auth, otp);
      setEmailVerificationNeeded(false);
      navigate('/upload');
    } catch (error) {
      throw error;
    }
  };

  const resendEmail = async () => {
    try {
      if (!user) throw new Error('No user found');
      await sendEmailVerification(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/login');
    } catch (error) {
      throw error;
    }
  };

  const PasswordResetEmail = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // Add this function to your AuthProvider component
  const signupWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setEmailVerificationNeeded(true);
      navigate('/verify-email');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        emailVerificationNeeded,
        loginWithEmail,
        loginWithGoogle,
        logout,
        signupWithEmail,
        PasswordResetEmail,
        verifyEmail,
        resendEmail  
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};