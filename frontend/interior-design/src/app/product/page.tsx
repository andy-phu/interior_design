"use client"
import { Undo2, SlidersHorizontal, Home, BookmarkIcon, Clock, ShoppingCart, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function ProductView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState("home")
  const [activeTopButton, setActiveTopButton] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/similar/1?filter=none&filter=none&filter=none&filter=none",
        )
        const data = await response.json()
        console.log("this is the data: ", data)
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const iconButtonClass = (isActive: boolean) =>
    cn(
      "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent active:scale-95",
    )

  const navButtonClass = (isActive: boolean) =>
    cn(
      "flex flex-col items-center justify-center gap-1 p-2 rounded-2xl transition-all duration-200",
      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent",
    )

  return (
    <div className="h-screen max-w-sm w-full mx-auto bg-background flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-5 h-20">
        <button
          className={iconButtonClass(activeTopButton === "undo")}
          onClick={() => {
            setActiveTopButton("undo")
            router.push("/previous-page") // 🔹 Redirects when clicked
          }}
        >
          <Undo2 className="w-6 h-6" />
        </button>

        <span className="font-bold text-2xl tracking-wide">OpenHouse</span>

        <button
          className={iconButtonClass(activeTopButton === "settings")}
          onClick={() => {
            setActiveTopButton("settings")
            router.push("/settings") // 🔹 Redirects when clicked
          }}
        >
          <SlidersHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Centered Image */}
        <div className="flex-1 flex items-center justify-center mb-8 px-4">
          <Image
            src="https://ashleyfurniture.scene7.com/is/image/AshleyFurniture/87213-38-SW-P1-KO?$AFHS-Grid-1X$"
            alt="Ashley Furniture Product"
            width={450}
            height={350}
            className="rounded-3xl object-cover"
            priority
          />
        </div>

        {/* Product Info Section */}
        <div className="space-y-5 mb-8 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium">Ancel Table Lamp</h1>
            <p className="text-2xl font-semibold">$69.00</p>
          </div>

          <div className="space-y-3">
            <p className="text-base text-muted-foreground">
              Modern design meets functionality in this elegant table lamp. Perfect for any contemporary living space.
            </p>
            <p className="text-sm text-muted-foreground">Materials: Ceramic base, natural wood accent, fabric shade</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="border-t bg-background">
        <nav className="flex justify-around items-center py-2 px-2">
          {[
            { icon: Home, label: "Home", id: "home", link: "/" },
            { icon: BookmarkIcon, label: "Saved", id: "saved", link: "/saved" },
            { icon: Clock, label: "History", id: "history", link: "/history" },
            { icon: ShoppingCart, label: "Cart", id: "cart", link: "/cart" },
            { icon: User, label: "Profile", id: "profile", link: "/profile" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                router.push(item.link) // 🔹 Redirects to the corresponding page
              }}
              className={navButtonClass(activeTab === item.id)}
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