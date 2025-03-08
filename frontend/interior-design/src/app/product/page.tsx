"use client"
import {
  Undo2,
  SlidersHorizontal,
  Home,
  BookmarkIcon,
  Clock,
  ShoppingCart,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import TinderCard from "react-tinder-card";
import { swipeLogic } from "./swipeHandler";
import { createClient } from "@/utils/supabase/client";
import FilterOptions from "@/app/components/filter"; // ✅ Fixed import path

interface Product {
  id: string
  name: string
  image: string
  price: string
  material: string
  productLink: string
  description: string
  productType: string
}

type FilterState = {
  Category: string[]
  Material: string[]
  Style: string[]
  ProductType: string[]
}

export default function ProductView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    Category: [],
    Material: [],
    Style: [],
    ProductType: [],
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supabase = await createClient();
        const userId = await supabase.auth.getUser()

        // Build filter query params
        const filterParams = Object.entries(activeFilters)
          .flatMap(([key, values]) =>
            values.length > 0
              ? values.map((value) => `filter=${value}`)
              : "filter=none",
          )
          .join("&")
        
        console.log("filterParams:", filterParams)
        
        //category, material, style, product type
        const response = await fetch(`http://localhost:8080/api/similar/${userId}?${filterParams}`)
        const data = await response.json()
        console.log("this is the data: ", data);
        const productArray = data.products.map((item: any) => ({
          id: item.ID,
          name: item.Name,
          image: item.Image,
          price: item.Price.toString(),
          description: item.Description,
          material: item.Material,
          productLink: item.ProductLink,
          productType: item.ProductType,
        }))
        setProducts(productArray)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [activeFilters])

  const handleSwipe = (direction: string, productId: string) => {
    swipeLogic(direction, productId)
    setCurrentIndex((prevIndex) => (prevIndex < products.length - 1 ? prevIndex + 1 : 0))
  }

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters)
    setCurrentIndex(0) // Reset to first product when filters change
  }

  return (
    <div className="h-screen max-w-sm w-full mx-auto bg-background flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-5 h-20">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full"
          onClick={() => router.push("/previous-page")}
        >
          <Undo2 className="w-6 h-6" />
        </button>
        <span className="ramaraja font-extrabold text-4xl tracking-wide">OpenHouse</span>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full"
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Swipeable Cards */}
      <main className="flex-1 flex flex-col">
        <div className="relative flex-1">
          {products.length > 0 ? (
            <div className="absolute inset-0">
              {products.slice(currentIndex, currentIndex + 1).map((product) => (
                <TinderCard
                  key={product.id}
                  onSwipe={(dir) => handleSwipe(dir, product.id)}
                  preventSwipe={["up", "down"]}
                  swipeRequirementType="velocity"
                  swipeThreshold={1}
                  className="absolute w-full h-full"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name || "Product"}
                      fill
                      className="object-cover"
                      priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black via-black/50 to-black/10 rounded-2xl" />
                    {/* Product Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex justify-between">
                        {/* Left Side: Product Name & Material */}
                        <div className="flex flex-col justify-between">
                          <h1 className="text-xl font-extrabold leading-tight">{product.name}</h1>
                          <p className="relative bottom-0 text-md text-white/80">{product.material}</p>
                        </div>

                        <div className="flex flex-col ml-8 justify-between">
                          {/* Right Side: Price */}
                          <p className="text-2xl font-extrabold">{product.price}</p>
                          <p className="relative bottom-0 whitespace-nowrap">{product.productType}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TinderCard>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-[#f5f9f7]">
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
                <h1 className="text-[#1B4332] text-2xl font-bold tracking-tight">Loading Products...</h1>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="border-t bg-background">
        <nav className="flex justify-around items-center py-4">
          {[
            { icon: Home, label: "Home", link: "/" },
            { icon: BookmarkIcon, label: "Saved", link: "/saved" },
            { icon: Clock, label: "History", link: "/history" },
            { icon: ShoppingCart, label: "Cart", link: "/cart" },
            { icon: User, label: "Profile", link: "/profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.link)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl hover:bg-gray-200 transition-all duration-200"
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Modal - Only shown when showFilters is true */}
      {showFilters && <FilterOptions onApplyFilters={handleApplyFilters} onClose={() => setShowFilters(false)} />}
    </div>
  )
}

