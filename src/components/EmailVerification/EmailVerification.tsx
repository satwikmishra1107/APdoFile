import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/userAuthContext';
import Logo from '../../assets/Something-removebg-preview.png';

export default function OTPVerification() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loginMessage] = useState<string | null>("After verifying your email, please login with your registered email address.");
    // const [setTheme] = useState<'light' | 'dark'>('light');
    const [countdown, setCountdown] = useState(30);
    const navigate = useNavigate();
    const { resendEmail } = useAuth();

    // useEffect(() => {
    //     const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    //     setTheme(savedTheme);
    //     document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    // }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = async () => {
        try {
            setCountdown(30);
            await resendEmail();
            setSuccess('Email resent successfully!');
            setError(null);
        } catch (err: any) {
            setError('Failed to resend Email');
        }
    };

    // Background pattern component (same as your LoginPage)
    const BackgroundPattern = () => (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 animate-gradient-slow" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDBNIDAgMjAgTCA0MCAyMCBNIDIwIDAgTCAyMCA0MCBNIDAgMzAgTCA0MCAzMCBNIDMwIDAgTCAzMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        </div>
    );

    return (
        <div className="min-h-screen p-6 relative">
            <BackgroundPattern />

            <div className="relative w-full max-w-md mx-auto">
                <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl dark:text-white">
                    <CardContent className="pt-8 pb-6 px-8">
                        <button
                            onClick={() => navigate('/login')}
                            className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                                {/* <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-8 h-8 text-white"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.5 7.5 0 004.5 10.5m0 0a7.5 7.5 0 01-1.568 8.268M4.5 10.5L19.5 10.5" />
                                </svg> */}

                                <img
                                    src={Logo}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                                Verify Your Email
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Please click on the verification link sent in you mail
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-sm flex items-center mb-6">
                                <AlertCircle size={16} className="mr-2" />
                                {error}
                            </div>
                        )}

                        {loginMessage && (
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 text-sm flex items-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                {loginMessage}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-500 dark:text-green-400 text-sm flex items-center mb-6">
                                <CheckCircle size={16} className="mr-2" />
                                {success}
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                onClick={handleResend}
                                disabled={countdown > 0}
                                className={`text-sm ${countdown > 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                                    }`}
                            >
                                {countdown > 0
                                    ? `Resend Verification link in ${countdown}s`
                                    : 'Resend Verification link'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}