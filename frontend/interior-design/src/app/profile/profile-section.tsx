"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Lock,
    LogOut,
    ChevronRight,
    Eye,
    EyeOff,
    Camera,
    Edit,
} from "lucide-react";
import Image from "next/image";
import {createClient} from "@/utils/supabase/client";

const supabase = createClient();


interface ProfileProps {
    user: {
        name: string;
        email: string;
        password: string;
        avatar?: string;
    };
}

export default function ProfileSection({ user }: ProfileProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    // Mask password to show only last 4 characters
    const maskPassword = (password: string) => {
        if (password.length <= 4) return password;
        const visiblePart = password.slice(-4);
        const maskedPart = "•".repeat(password.length - 4);
        return showPassword ? password : `${maskedPart}${visiblePart}`;
    };

    const handleLogout = () => {
        console.log("Logging out...");
        supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="h-full w-full bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white px-6 py-8 flex flex-col items-center border-b">
                <div className="relative mb-4">
                    {user.avatar ? (
                        <Image
                            src="/blank_pfp.jpeg"
                            alt={user.name}
                            width={100}
                            height={100}
                            className="rounded-full object-cover w-24 h-24 border-4 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-md">
                            <User className="w-12 h-12 text-green-600" />
                        </div>
                    )}
                    <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-md">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                <button
                    className="mt-4 text-sm font-medium text-green-600 flex items-center"
                    onClick={() => router.push("/edit-profile")}
                >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Profile
                </button>
            </div>

            {/* Account Information */}
            <div className="px-6 py-12">
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Email Section */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <Mail className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Password Section */}
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <Lock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Password</p>
                                <div className="flex items-center">
                                    <p className="font-medium font-mono">
                                        {maskPassword(user.password)}
                                    </p>
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="ml-2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </div>

                {/* App Settings */}
                {/* <h2 className="text-lg font-semibold mt-8 mb-4">App Settings</h2> */}
                {/* <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                        className="p-4 w-full flex items-center text-left"
                        onClick={() => router.push("/settings")}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <svg
                                className="w-5 h-5 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0..."
                                />
                            </svg>
                        </div>
                        <span>Settings</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </button>
                </div> */}
            </div>

            {/* Logout Button */}
            <div className="px-6 py-12 border-t">
                <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium flex items-center justify-center"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Log Out
                </button>
            </div>
        </div>
    );
}
