import { Undo2, SlidersHorizontal, Home, BookmarkIcon, Clock, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductView() {
  return (
    <div className="h-screen max-w-sm w-full mx-auto bg-background flex flex-col">
      {/* ✅ Top Navigation - More Padding for Clickability */}
      <div className="px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Undo2 className="h-6 w-6 md:h-7 md:w-7" />
          </Button>
          <span className="font-semibold text-lg md:text-xl">OpenHouse</span>
          <Button variant="ghost" size="icon" className="rounded-full">
            <SlidersHorizontal className="h-6 w-6 md:h-7 md:w-7" />
          </Button>
        </div>
      </div>

      {/* ✅ Main Content - Flexible Layout */}
      <main className="flex-1 flex flex-col md:px-2 ">
        {/* ✅ Responsive Image Placeholder */}
        <div className="flex-1 bg-red-500 rounded-3xl mb-4 h-64 md:h-80 lg:h-96 w-full" />

        {/* ✅ Product Info - Scales Better on Small Screens */}
        <div className="flex justify-between items-center px-1 py-3 md:py-4">
          <h1 className="text-lg font-medium md:text-xl">Ancel Table Lamp</h1>
          <p className="text-lg font-semibold md:text-xl">$69.00</p>
        </div>
      </main>

      {/* ✅ Bottom Navigation - Improved Clickability */}
      <div className="border-t bg-background">
        <nav className="flex justify-around py-3 md:py-4">
          <Button variant="ghost" size="icon" aria-label="Home">
            <Home className="h-7 w-7 md:h-8 md:w-8" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Bookmarks">
            <BookmarkIcon className="h-7 w-7 md:h-8 md:w-8" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="History">
            <Clock className="h-7 w-7 md:h-8 md:w-8" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cart">
            <ShoppingCart className="h-7 w-7 md:h-8 md:w-8" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Profile">
            <User className="h-7 w-7 md:h-8 md:w-8" />
          </Button>
        </nav>
      </div>
    </div>
  )
}