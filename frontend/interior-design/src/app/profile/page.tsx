"use client"

import { useEffect, useState } from "react"
import ProfileSection from "./profile-section"
import { Undo2, Home, BookmarkIcon, Clock, ShoppingCart, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

const supabase = await createClient();

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState({
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        password: "SecurePassword1234",
        avatar: "",
    })
    
    useEffect(() => {
        // Simulate fetching user data
        const fetchUserData = async () => {
            try {
                // In a real app, you would fetch user data from an API
                // const response = await fetch('/api/user/profile')
                // const data = await response.json()
                // setUserData(data)
                const {data, error} = await supabase.auth.getUser();
                if (error){
                    console.error("Error fetching user data:", error);
                }
                console.log("data: ", data);
                const user = data?.user;

                const email = user?.email;
                console.log("email: ", email);
                
                if (!email){
                    console.error("Error fetching email:", error);
                }
                setUserData({
                    name: "Alex Johnson",
                    email: email? email: "alex.johnson@example.com",
                    password: "SecurePassword1234",
                    avatar: "/blank_pfp.jpeg",
                })


                // For demo purposes, we'll just use the default data
                setTimeout(() => {
                    setLoading(false)
                }, 1000)
            } catch (error) {
                console.error("Error fetching user data:", error)
                setLoading(false)
            }
        }

        fetchUserData()
    }, [])

    if (loading) {
        return (
            <div className="h-screen max-w-sm w-full mx-auto bg-[#f5f9f7] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 mb-4">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1B4332"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-full h-full animate-pulse"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <h1 className="text-[#1B4332] text-4xl font-bold tracking-tight">OpenHouse</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen max-w-sm w-full mx-auto bg-background flex flex-col">
            {/* Top Navigation */}
            <div className="flex items-center justify-between px-6 py-5 h-20 bg-white border-b">
                <button className="flex items-center justify-center w-10 h-10 rounded-full" onClick={() => router.push("/")}>
                    <Undo2 className="w-6 h-6" />
                </button>
                <span className="text-xl font-bold">Profile</span>
                <div className="w-10 h-10"></div> {/* Empty div for spacing */}
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto">
                <ProfileSection user={userData} />
            </div>

            {/* Bottom Navigation */}
            <div className="border-t bg-background">
                <nav className="flex justify-around items-center py-4">
                    {[
                        { icon: Home, label: "Home", link: "/" },
                        { icon: BookmarkIcon, label: "Saved", link: "/saved" },
                        { icon: Clock, label: "History", link: "/history" },
                        { icon: ShoppingCart, label: "Cart", link: "/cart" },
                        { icon: User, label: "Profile", link: "/profile", active: true },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => router.push(item.link)}
                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all duration-200 ${item.active ? "text-green-600" : "hover:bg-gray-200"
                                }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}

