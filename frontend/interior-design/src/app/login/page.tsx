"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signup, login } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EyeIcon, EyeOffIcon } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const response = await login(formData)

    if (response?.error) {
      setError(response.error)
    } else {
      console.log("user logged in succesfully")
      router.push("/")
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const response = await signup(formData)

    if (response?.error) {
      setError(response.error)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-0">
      <div className="mx-auto max-w-[400px] space-y-6 pt-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground">Stay updated on your professional world</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input name="email" type="text" placeholder="Email or Phone" required className="h-12" />
              </div>
              <div className="relative space-y-2">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-blue-600"
                >
                  {showPassword ? <EyeOffIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                </button>
              </div>
              <Link href="/forgot-password" className="inline-block text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
              <Button type="submit" className="h-12 w-full text-base">
                Sign in
              </Button>
              {error && <p className="text-center text-sm text-red-500">{error}</p>}
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input name="email" type="email" placeholder="Email" required className="h-12" />
              </div>
              <div className="relative space-y-2">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-blue-600"
                >
                  {showPassword ? <EyeOffIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                </button>
              </div>
              <Button type="submit" className="h-12 w-full text-base">
                Sign up
              </Button>
              {error && <p className="text-center text-sm text-red-500">{error}</p>}
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm">
          {activeTab === "login" ? (
            <p>
              New to our platform?{" "}
              <button onClick={() => setActiveTab("signup")} className="text-blue-600 hover:underline">
                Join now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button onClick={() => setActiveTab("login")} className="text-blue-600 hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}













// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signup, login } from "./actions";

// export default function LoginPage() {
//   const router = useRouter();
//   const [error, setError] = useState("");

//   const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);

//     const response = await login(formData); // 🔥 Calls login Server Action

//     if (response?.error) {
//       setError(response.error);
//     } else {
//       router.push("/"); // ✅ Redirect on successful login
//     }
//   };

//   const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);

//     const response = await signup(formData); // 🔥 Calls signup Server Action

//     if (response?.error) {
//       setError(response.error);
//     } else {
//       router.push("/"); // ✅ Redirect on successful signup
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleLoginSubmit}> {/* ✅ Separate form for login */}
//         <label htmlFor="email">Email:</label>
//         <input id="email" name="email" type="email" required />
//         <label htmlFor="password">Password:</label>
//         <input id="password" name="password" type="password" required />
//         <button type="submit">Login</button>
//         {error && <p className="text-red-500">{error}</p>}
//       </form>

//       <h2>Sign Up</h2>
//       <form onSubmit={handleSignupSubmit}> {/* ✅ Separate form for signup */}
//         <label htmlFor="email">Email:</label>
//         <input id="email" name="email" type="email" required />
//         <label htmlFor="password">Password:</label>
//         <input id="password" name="password" type="password" required />
//         <button type="submit">Sign Up</button>
//         {error && <p className="text-red-500">{error}</p>}
//       </form>
//     </div>
//   );
// }