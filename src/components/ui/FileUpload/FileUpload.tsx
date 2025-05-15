import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileText, Loader2, AlertCircle, LogOut, Hash, ChevronDown, Bot } from "lucide-react";
import FileCard from "./FileCard";
import { useAuth } from '../../../context/userAuthContext';
import { saveFileMetadata, fetchUserFiles, deleteFileMetadata } from "@/firebaseUtils";
import { Alert, AlertDescription } from "../alert";
import { createPortal } from 'react-dom';
import { BOT_TOKEN1, BOT_TOKEN2, BOT_TOKEN3, CHANNEL_ID1, CHANNEL_ID2, CHANNEL_ID3, PORT } from "../../../config";

const BASE_URL = `http://3.7.162.84:${PORT}`;
// const BASE_URL = `http://localhost:${PORT}`;   

interface FileMetadata {
    fileName: string;
    fileSize: number;
    fileHash: string;
    mimetype?: string;
    size?: number;
    botToken?: string;
    channelId?: string
}

interface BotOption {
    value: string;
    label: string;
    token: string;
    description: string;  // Added description
    color: string;        // Added color for styling
    emoji?: string;       // Added emoji
}

interface ChannelOption {
    value: string;
    label: string;
    id: string;
    members: number;      // Added member count
    activity: "high" | "medium" | "low";  // Added activity level
}

export default function FileUploadPage() {

    console.log(PORT);
    
    const drawerRef = useRef<HTMLDivElement>(null);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    const { user, logout } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const username = user?.email ? user.email.split('@')[0] : 'Guest';
    const initials = username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

    const handleLogout = async () => {
        try {
            await logout();

        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [botToken, setBotToken] = useState("");
    const [channelId, setChannelId] = useState("");

    const [showBotDropdown, setShowBotDropdown] = useState(false);
    const [showChannelDropdown, setShowChannelDropdown] = useState(false);
    const [selectedBotIndex, setSelectedBotIndex] = useState<number | null>(null);
    const [selectedChannelIndex, setSelectedChannelIndex] = useState<number | null>(null);


    const BOT_OPTIONS: BotOption[] = [
        {
            value: "bot1",
            label: "ByteBot",
            token: `${BOT_TOKEN1}`,
            description: "Techy, simple, and catchy",
            color: "from-blue-500 to-indigo-600",
            emoji: "🚀"
        },
        {
            value: "bot2",
            label: "Vaulty",
            token: `${BOT_TOKEN2}`,
            description: "Secure and storage-related",
            color: "from-green-500 to-emerald-600",
            emoji: "🔒"
        },
        {
            value: "bot3",
            label: "NebulaDrop",
            token: `${BOT_TOKEN3}`,
            description: "Futuristic and cool-sounding",
            color: "from-orange-500 to-amber-600",
            emoji: "🌌"
        }
    ];

    const CHANNEL_OPTIONS: ChannelOption[] = [
        { value: "channel1", label: "# general", id: `${CHANNEL_ID1}`, members: 128, activity: "high" },
        { value: "channel2", label: "# resources", id: `${CHANNEL_ID2}`, members: 95, activity: "medium" },
        { value: "channel3", label: "# archive", id: `${CHANNEL_ID3}`, members: 42, activity: "low" }
    ];

    const [errors, setErrors] = useState<{
        botToken?: string;
        channelId?: string;
        file?: string;
    }>({});
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const botDropdownRef = useRef<HTMLButtonElement>(null);
    const channelDropdownRef = useRef<HTMLButtonElement>(null);


    useEffect(() => {
        const container = document.createElement('div');
        container.className = 'dropdown-portal';
        document.body.appendChild(container);
        setPortalContainer(container);

        return () => {
            document.body.removeChild(container);
        };
    }, []);

    //For drawer closing 
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('button')) {
                setIsDrawerOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    //For channel ID and bottoken section closing

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            if (!target.closest('.bot-dropdown') && !target.closest('.bot-selector')) {
                setShowBotDropdown(false);
            }
            if (!target.closest('.channel-dropdown') && !target.closest('.channel-selector')) {
                setShowChannelDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    //For Theme retention
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark');
    };

    //File Selection 
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    //Upload check
    const validateForm = () => {
        const newErrors: { botToken?: string; channelId?: string; file?: string } = {};

        if (!botToken.trim()) {
            newErrors.botToken = "Bot token is required";
        }

        if (!channelId.trim()) {
            newErrors.channelId = "Channel ID is required";
        }

        if (!selectedFile) {
            newErrors.file = "Please select a file to upload";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpload = async () => {
        if (!validateForm()) {
            return;
        }

        setIsUploading(true);

        try {

            // console.log(botToken);
            const formData = new FormData();
            formData.append('file', selectedFile!);
            formData.append('filename', selectedFile!.name);
            formData.append('botToken', botToken);
            formData.append('channelId', channelId);

            const response = await fetch(`${BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            // console.log("Server response:", data);

            if (response.ok) {

                const fileMetadata = {
                    fileName: data.fileDetails.filename,
                    fileHash: data.fileDetails.filehash,
                    size: data.fileDetails.size,
                    mimetype: data.fileDetails.mimetype,
                    botToken: botToken,
                    channelId: channelId
                };

                // console.log(user?.uid);

                if (!user?.uid) {
                    throw new Error('User not authenticated');
                }

                // console.log("Saving file metadata:", fileMetadata);
                await saveFileMetadata(user.uid, fileMetadata);

                const updatedFiles = await fetchUserFiles(user.uid);
                // console.log("Updated files:", updatedFiles);
                setFiles(updatedFiles);

                setSelectedFile(null);
                setErrors({});

            }
            else {
                setErrors({ file: data.error || 'Upload failed' });
            }
        }
        catch (error) {
            console.error("Error during upload process:", error);
            setErrors({
                file: error instanceof Error ? error.message : 'Upload failed. Please try again.'
            });
        }
        finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    //Fetching files 

    useEffect(() => {
        const loadUserFiles = async () => {
            if (!user?.uid) {
                setFiles([]);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const userFiles = await fetchUserFiles(user.uid);
                // console.log("Fetched files:", userFiles); // Add this to see what's coming back
                setFiles(userFiles);
            } catch (error) {
                console.error('Error loading files:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUserFiles();
    }, [user?.uid]);

    // Background pattern elements
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

    // const getFileColor = (type = "default") => {
    //     switch (type) {
    //         case "document": return "bg-blue-50 text-blue-600";
    //         case "image": return "bg-green-50 text-green-600";
    //         case "data": return "bg-purple-50 text-purple-600";
    //         default: return "bg-gray-50 text-gray-600";
    //     }
    // };

    const handleDeleteFile = async (fileHash: string) => {
        if (!user?.uid) {
            setDeleteError('Must be logged in to delete files');
            return;
        }

        try {
            // First remove from Firebase
            console.log(user.uid)
            await deleteFileMetadata(user.uid, fileHash);

            // Then update local state

            // => dignify the reference from previous state
            // Filtering out files whose file hash is not equal to the file hash of the file deleted
            setFiles(prevFiles => prevFiles.filter(file => file.fileHash !== fileHash));

            setDeleteError(null);

        } catch (error) {
            console.error('Error deleting file:', error);
            setDeleteError('Failed to delete file. Please try again.');
        }
    };
    return (
        <div className="min-h-screen p-6 relative">
            {/* Welcome Message */}
            <div className="absolute top-6 left-6 z-10">
                {/* Logout drawer button */}
                <div className="relative" ref={drawerRef}>
                    <div onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                        className="flex items-center space-x-4 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 animate-fade-in hover:scale-105 transition-transform duration-300">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">{initials}</span>
                        </div>
                        <div>
                            <p className="text-sm text-purple-600 font-semibold uppercase tracking-wider">Welcome back</p>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {username}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Logout Drawer */}
                <div
                    className={`absolute top-full left-0 right-0 mt-2 transition-all duration-300 ease-in-out transform ${isDrawerOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                        }`}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            handleLogout();
                        }}
                        className="w-full flex items-center space-x-2 bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-white/20 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Theme Toggle Button - Add after welcome message */}
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

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl dark:text-white">
                    <CardContent className="pt-8 pb-6 px-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                            <UploadCloud className="text-white" size={32} />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                            Cloud File Uploader
                        </h1>
                        <p className="text-gray-600 mt-3 text-lg">
                            Upload, manage, and share your files securely
                        </p>
                    </CardContent>
                </Card>

                {/* Configuration Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl dark:text-white">
                        <CardContent className="p-6">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">Select Bot</label>
                            <div className="relative" style={{ position: 'static' }}>
                                {/* Bot selector button */}
                                <button
                                    ref={botDropdownRef}
                                    onClick={() => setShowBotDropdown(!showBotDropdown)}
                                    className={`bot-selector w-full p-3 flex items-center justify-between rounded-lg border ${errors.botToken ? 'border-red-500' : 'border-purple-200 dark:border-purple-800'} bg-white/80 dark:bg-gray-700/80 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors duration-200`}
                                >
                                    {selectedBotIndex !== null ? (
                                        <div className="flex items-center">
                                            <div className={`h-8 w-8 rounded-md bg-gradient-to-r ${BOT_OPTIONS[selectedBotIndex].color} flex items-center justify-center shadow-md mr-3`}>
                                                <Bot size={16} className="text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-gray-800 dark:text-white">{BOT_OPTIONS[selectedBotIndex].label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{BOT_OPTIONS[selectedBotIndex].description}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-500">
                                            <Bot size={18} className="mr-2" />
                                            <span>Select a bot</span>
                                        </div>
                                    )}
                                    <ChevronDown size={18} className={`transform transition-transform duration-200 ${showBotDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Bot dropdown */}
                                {showBotDropdown && portalContainer && createPortal(
                                    <div
                                        className="bot-dropdown fixed z-50 shadow-xl overflow-hidden"
                                        style={{
                                            top: botDropdownRef.current?.getBoundingClientRect().bottom || 0,
                                            left: botDropdownRef.current?.getBoundingClientRect().left || 0,
                                            width: botDropdownRef.current?.offsetWidth || 0,
                                            borderRadius: '0.5rem',
                                            background: theme === 'dark' ? '#1F2937' : 'white',
                                            border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #E9D5FF',
                                        }}
                                    >
                                        {BOT_OPTIONS.map((bot, index) => (
                                            <div
                                                key={bot.value}
                                                className="p-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer transition-colors duration-150"
                                                onClick={() => {
                                                    setBotToken(bot.token);
                                                    setSelectedBotIndex(index);
                                                    setShowBotDropdown(false);
                                                    setErrors(prev => ({ ...prev, botToken: undefined }));
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`h-8 w-8 rounded-md bg-gradient-to-r ${bot.color} flex items-center justify-center shadow-md mr-3`}>
                                                        {/* <Bot size={16} className="text-white" /> */}
                                                        <span role="img" aria-label="bot-emoji">
                                                            {bot.emoji}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-800 dark:text-white">{bot.label}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{bot.description}</p>
                                                    </div>
                                                </div>

                                                {/* Token preview and copy */}
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 overflow-hidden overflow-ellipsis max-w-xs">
                                                        {bot.token.substring(0, 6)}......{bot.token.substring(bot.token.length - 6, bot.token.length)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>,
                                    portalContainer
                                )}

                                {errors.botToken && (
                                    <div className="flex items-center text-red-500 dark:text-red-400 text-sm mt-1">
                                        <AlertCircle size={16} className="mr-1" />
                                        {errors.botToken}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl dark:text-white">
                        <CardContent className="p-6">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">Select Channel</label>
                            <div className="relative" style={{ position: 'static' }}>
                                {/* Channel selector button */}
                                <button
                                    ref={channelDropdownRef}
                                    onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                                    className={`channel-selector w-full p-3 flex items-center justify-between rounded-lg border ${errors.channelId ? 'border-red-500' : 'border-purple-200 dark:border-purple-800'} bg-white/80 dark:bg-gray-700/80 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors duration-200`}
                                >
                                    {selectedChannelIndex !== null ? (
                                        <div className="flex items-center">
                                            <div className={`
                            h-8 w-8 rounded-md flex items-center justify-center shadow-md mr-3
                            ${CHANNEL_OPTIONS[selectedChannelIndex].activity === 'high' ? 'bg-green-500' :
                                                    CHANNEL_OPTIONS[selectedChannelIndex].activity === 'medium' ? 'bg-amber-500' : 'bg-gray-500'}
                        `}>
                                                <Hash size={16} className="text-white" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-gray-800 dark:text-white">{CHANNEL_OPTIONS[selectedChannelIndex].label}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {CHANNEL_OPTIONS[selectedChannelIndex].members} members •
                                                    {CHANNEL_OPTIONS[selectedChannelIndex].activity === 'high' ? ' Very active' :
                                                        CHANNEL_OPTIONS[selectedChannelIndex].activity === 'medium' ? ' Moderately active' : ' Low activity'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-gray-500">
                                            <Hash size={18} className="mr-2" />
                                            <span>Select a channel</span>
                                        </div>
                                    )}
                                    <ChevronDown size={18} className={`transform transition-transform duration-200 ${showChannelDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Channel dropdown */}
                                {showChannelDropdown && portalContainer && createPortal(
                                    <div className="channel-dropdown fixed z-50 mt-2 w-full rounded-lg border border-purple-100 dark:border-purple-800 bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
                                        style={{
                                            top: channelDropdownRef.current?.getBoundingClientRect().bottom || 0,
                                            left: channelDropdownRef.current?.getBoundingClientRect().left || 0,
                                            width: channelDropdownRef.current?.offsetWidth || 0,
                                            borderRadius: '0.5rem',
                                            background: theme === 'dark' ? '#1F2937' : 'white',
                                            border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #E9D5FF',
                                        }}>
                                        {CHANNEL_OPTIONS.map((channel, index) => (
                                            <div
                                                key={channel.value}
                                                className="p-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                onClick={() => {
                                                    setChannelId(channel.id);
                                                    setSelectedChannelIndex(index);
                                                    setShowChannelDropdown(false);
                                                    setErrors(prev => ({ ...prev, channelId: undefined }));
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`
                                    h-8 w-8 rounded-md flex items-center justify-center shadow-md mr-3
                                    ${channel.activity === 'high' ? 'bg-green-500' :
                                                            channel.activity === 'medium' ? 'bg-amber-500' : 'bg-gray-500'}
                                `}>
                                                        <Hash size={16} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-white">{channel.label}</p>
                                                        <div className="flex items-center mt-1">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                                                {channel.members} members
                                                            </p>
                                                            <span className={`
                                            inline-flex h-2 w-2 rounded-full mr-1
                                            ${channel.activity === 'high' ? 'bg-green-500' :
                                                                    channel.activity === 'medium' ? 'bg-amber-500' : 'bg-gray-500'}
                                        `}></span>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {channel.activity === 'high' ? 'Very active' :
                                                                    channel.activity === 'medium' ? 'Moderately active' : 'Low activity'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>,
                                    portalContainer
                                )}

                                {errors.channelId && (
                                    <div className="flex items-center text-red-500 dark:text-red-400 text-sm mt-1">
                                        <AlertCircle size={16} className="mr-1" />
                                        {errors.channelId}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upload Zone */}
                <Card
                    className={`border-2 border-dashed relative overflow-hidden transition-all duration-300 shadow-xl ${isDragging
                        ? 'border-purple-400 bg-purple-50/80 dark:bg-purple-900/30'
                        : 'border-gray-200 bg-white/90 dark:bg-gray-800/90 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/50'
                        }`}
                >
                    <CardContent className="p-16 text-center">
                        <div
                            className="absolute inset-0"
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                // Handle file drop here
                            }}
                        />
                        <div className={`transform transition-transform duration-300 ${isDragging ? 'scale-110' : 'scale-100'}`}>
                            {!selectedFile ? (
                                <>
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                                        <UploadCloud
                                            className={`transition-colors duration-300 ${isDragging ? 'text-purple-600' : 'text-purple-400'
                                                }`}
                                            size={40}
                                        />
                                    </div>
                                    <p className="text-xl font-medium text-gray-700 dark:text-gray-200 mt-4">
                                        Drag & drop your files here
                                    </p>
                                    <p className="text-gray-500 mt-2">or</p>
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                    >
                                        Browse Files
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-center space-x-4">
                                        <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                                            <FileText size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-800 dark:text-white">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center space-x-4">
                                        <Button
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                'Upload'
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                    {errors.file && (
                                        <div className="flex items-center justify-center text-red-500 dark:text-red-400 text-sm mt-4">
                                            <AlertCircle size={16} className="mr-1" />
                                            {errors.file}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </CardContent>
                </Card>

                {/* Files List with Demo Data */}

                <Card className="border-none shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                            Your Files
                        </h2>

                        {deleteError && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{deleteError}</AlertDescription>
                            </Alert>
                        )}

                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No files uploaded yet
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {files.map((file) => (
                                    <FileCard
                                        key={file.fileHash}
                                        file={file}
                                        botToken={file.botToken || botToken}
                                        channelId={channelId}
                                        downloadProgress={0}
                                        onDelete={async (fileHash) => {
                                            await handleDeleteFile(fileHash);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
