import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from '../../../context/userAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
    const location = useLocation();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const [isFlipped, setIsFlipped] = useState(false);
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const { loginWithEmail, loginWithGoogle, signupWithEmail, PasswordResetEmail, user } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    useEffect(() => {

        if (location.search.includes('apiKey') && location.search.includes('mode=signIn')) {
            handleEmailLink();
        }
    }, [location]);

    const handleEmailLink = async () => {
        setError(null);
        setIsLoading(true);

        try {

            const email = localStorage.getItem('emailForSignIn');
            const password = localStorage.getItem('passwordForSignIn');

            if (!email) {
                throw new Error("Email not found. Please try signing up again.");
            }

            await signupWithEmail(email, password || '');

            localStorage.removeItem('emailForSignIn');
            localStorage.removeItem('passwordForSignIn');

            setSuccessMessage("Email verified successfully! You are now logged in.");

            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err: any) {
            setError('Email verification failed: ' + err.message);
            console.error('Email verification failed', err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark');
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
    
        try {

            if (!signupEmail) {
                throw new Error("Email is required");
            }
            if (!signupPassword || signupPassword.length < 6) {
                throw new Error("Password must be at least 6 characters");
            }
    
            await signupWithEmail(signupEmail, signupPassword);
    
            setSuccessMessage("Verification email sent! Please check your inbox and click the link to complete signup.");
        } catch (err: any) {
            setError('Failed to sign up: ' + err.message);
            console.error('Failed to sign up', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        setIsLoading(true);

        try {
            await loginWithEmail(email, password);
        } catch (err: any) {
            setError('Failed to login ' + err.message);
            console.log('Failed to login', err)
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);

        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError('Failed to login with Google ' + err.message);
            console.log('Failed to login with Google', err)
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setErrors({ ...errors, email: "Please enter your email to reset your password." });
            return;
        }
        try {
            await PasswordResetEmail(email);
            setSuccessMessage("Password reset email sent. Please check your inbox.");
            setError(null); // Clear any previous error
        } catch (err: any) {
            setError("Failed to send password reset email: " + err.message);
            setSuccessMessage(null); // Clear any previous success message
        }
    };

    // Background pattern component
    const BackgroundPattern = () => (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 animate-gradient-slow" />

            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        </div>
    );

    return (
        <div className="min-h-screen p-6 relative">
            {/* Theme Toggle Button */}
            <div className="absolute top-6 right-6 z-10">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border border-purple-200 bg-white/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                    onClick={toggleTheme}
                >
                    <div className="relative flex items-center justify-center w-full h-full">
                        {/* Sun */}
                        <div className="absolute transition-all dark:-rotate-0 dark:scale-0">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5 text-yellow-500"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                            </svg>
                        </div>
                        {/* Moon */}
                        <div className="absolute transition-all dark:rotate-90 dark:scale-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5 text-purple-500"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                            </svg>
                        </div>
                    </div>
                </Button>
            </div>

            <BackgroundPattern />

            <div className="relative w-full max-w-md mx-auto">
                <div
                    className={`preserve-3d relative transition-transform duration-700 ease-in-out w-full`}
                    style={{
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {/* Login Card */}
                    <Card
                        className="w-full border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl dark:text-white"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            position: 'relative',
                            zIndex: isFlipped ? 0 : 1
                        }}
                    >
                        <CardContent className="pt-8 pb-6 px-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-8 h-8 text-white"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                                    Welcome Back
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Sign in to your account
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-sm flex items-center">
                                        <AlertCircle size={16} className="mr-2" />
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400 text-sm flex items-center">
                                        <CheckCircle size={16} className="mr-2" />
                                        {successMessage}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        className={`bg-white/80 dark:bg-gray-700/80 ${errors.email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                            : 'border-purple-100 dark:border-purple-900 focus:border-purple-300 dark:focus:border-purple-700 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800'
                                            } dark:text-white`}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    {errors.email && (
                                        <div className="flex items-center text-red-500 text-sm">
                                            <AlertCircle size={16} className="mr-1" />
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Password
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        className={`bg-white/80 dark:bg-gray-700/80 ${errors.password
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                            : 'border-purple-100 dark:border-purple-900 focus:border-purple-300 dark:focus:border-purple-700 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800'
                                            } dark:text-white`}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    {errors.password && (
                                        <div className="flex items-center text-red-500 text-sm">
                                            <AlertCircle size={16} className="mr-1" />
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-purple-100 dark:border-purple-900 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        // fill="#4285F4"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        // fill="#34A853"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        // fill="#FBBC05"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        // fill="#EA4335"
                                        />
                                    </svg>
                                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                                </Button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </form>
                            <div className="text-center mt-6">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Not an existing user?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsFlipped(true)}
                                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                                    >
                                        Sign up
                                    </button>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Signup Card - Back */}
                    <Card
                        className="w-full border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl dark:text-white"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: isFlipped ? 1 : 0
                        }}
                    >
                        <CardContent className="pt-8 pb-6 px-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-8 h-8 text-white"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                                    Create Account
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Sign up for a new account
                                </p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-6">
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-sm flex items-center">
                                        <AlertCircle size={16} className="mr-2" />
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="bg-white/80 dark:bg-gray-700/80 border-purple-100 dark:border-purple-900 focus:border-purple-300 dark:focus:border-purple-700 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 dark:text-white"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Password
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Create a password"
                                        className="bg-white/80 dark:bg-gray-700/80 border-purple-100 dark:border-purple-900 focus:border-purple-300 dark:focus:border-purple-700 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 dark:text-white"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Signing up...' : 'Sign Up'}
                                </Button>

                                <div className="text-center mt-6">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setIsFlipped(false)}
                                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                                        >
                                            Sign in
                                        </button>
                                    </span>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}