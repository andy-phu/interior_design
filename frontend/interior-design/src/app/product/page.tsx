"use client"
import { Undo2, SlidersHorizontal, Home, BookmarkIcon, Clock, ShoppingCart, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface Product {
  name: string;
  image: string;
  price: number; 
  material: string;
  productLink: string;
  description: string;
}






export default function ProductView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([]) // Array of image URLs
  const [currentIndex, setCurrentIndex] = useState(0) // Track current image

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/similar/1?filter=none&filter=none&filter=none&filter=none",
        )
        const data = await response.json()
        // console.log("this is the data: ", data)
        const products = data.products;
        let productArray = []

        for(let i = 0; i < products.length; i++) {
          let tempProduct = {
            id: products[i].ID,
            name: products[i].Name,
            image: products[i].Image,
            price: products[i].Price,
            description: products[i].Description,
            material: products[i].Material,
            productLink: products[i].ProductLink
          }
          productArray.push(tempProduct)
        }
        console.log("these are the products", productArray)
        setProducts(productArray) // Assuming API returns { products: ["image1.jpg", "image2.jpg"] }
        
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Handle swipe gesture
  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100 // Minimum swipe distance to register a change
    if (info.offset.x > swipeThreshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1) // Swipe right: go back
    } else if (info.offset.x < -swipeThreshold && currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1) // Swipe left: go forward
    }
  }

  return (
    <div className="h-screen max-w-sm w-full mx-auto bg-background flex flex-col">
      {/* ✅ Top Navigation */}
      <div className="flex items-center justify-between px-6 py-5 h-20">
        <button className="flex items-center justify-center w-10 h-10 rounded-full" onClick={() => router.push("/previous-page")}>
          <Undo2 className="w-6 h-6" />
        </button>

        <span className="font-bold text-2xl tracking-wide">OpenHouse</span>

        <button className="flex items-center justify-center w-10 h-10 rounded-full" onClick={() => router.push("/settings")}>
          <SlidersHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* ✅ Swipeable Image */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center mb-8 px-4 relative">
          {products.length > 0 ? (
            <motion.div
              drag="x" // Enable horizontal dragging
              dragConstraints={{ left: 0, right: 0 }} // Constrain swipe movement
              onDragEnd={handleDragEnd} // Detect swipe gesture
              className="cursor-grab active:cursor-grabbing"
            >
              <Image
                src={products[currentIndex].image} // Display the current image
                alt="Furniture Product"
                width={450}
                height={350}
                className="rounded-3xl object-cover"
                priority
              />
            </motion.div>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        {/* ✅ Product Info */}
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

      {/* ✅ Bottom Navigation */}
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
    </div>
  )
}