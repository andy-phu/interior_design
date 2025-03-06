"use client"

import { useEffect, useState } from "react"
import { Home, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import {createClient} from '@/utils/supabase/client'
import { useRouter } from "next/navigation"

export default function SplashScreen() {
  // const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase =  createClient()

  useEffect(() => {

    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // ⏳ Simulate 2s splash screen
      const { data, error } = await supabase.auth.getUser()

      if (error || !data?.user) {
        // router.push("/login") // 🔒 Redirect to login if not authenticated
        console.log("NOT AUTHENTICATED")
      } else {
        router.push("/product") // 🚀 Redirect to the main app if authenticated
      }
    }

    checkAuth()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
      <div className="relative flex flex-col items-center justify-center space-y-6 px-4 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Home className="h-16 w-16 text-emerald-600" strokeWidth={1.5} />
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute left-0 top-0 h-16 w-16"
          >
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl font-bold tracking-tight text-emerald-900 sm:text-5xl"
        >
          OpenHouse
        </motion.h1>

        {/* {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-2 text-emerald-600"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </motion.div>
        )} */}
      </div>
    </div>
  )
}

