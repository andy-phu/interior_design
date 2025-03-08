"use client"

import { useState } from "react"
import { X, ChevronDown, ChevronUp, Check } from "lucide-react"

// Define filter options for each category
const filterOptions = {
  Category: ["Furniture", "Decor", "Lighting", "Textiles", "Kitchen", "Bathroom"],
  Material: ["Fabric", "Polyester", "Wood", "Wood and Metal", "Stainless Steal", "Faux Leather", "Velvet", "Leather", "Metal", "Linen"],
  Style: ["Traditional", "Bohemian", "Casual", "Contemporary", "Farmhouse", "Rustic", "Coastal", "Shabby Chic", "Cottage"],
  ProductType: ["Chair", "Dining Table", "Sofa", "Bar Stool"],
}

type FilterState = {
  Category: string[]
  Material: string[]
  Style: string[]
  ProductType: string[]
}

export default function FilterOptions({
  onApplyFilters,
  onClose,
}: {
  onApplyFilters: (filters: FilterState) => void
  onClose: () => void
}) {
  // Initialize state with empty arrays for each filter category
  const [filters, setFilters] = useState<FilterState>({
    Category: [],
    Material: [],
    Style: [],
    ProductType: [],
  })

  // Track which accordion sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Category: true,
    Material: false,
    Style: false,
    ProductType: false,
  })

  // Toggle a filter option selection
  const toggleFilter = (category: keyof FilterState, option: string) => {
    setFilters((prev) => {
      const updatedCategory = prev[category].includes(option)
        ? prev[category].filter((item) => item !== option)
        : [...prev[category], option]

      return {
        ...prev,
        [category]: updatedCategory,
      }
    })
  }

  // Toggle accordion section
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      Category: [],
      Material: [],
      Style: [],
      ProductType: [],
    })
  }

  // Apply the selected filters
  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  // Count total selected filters
  const selectedCount = Object.values(filters).flat().length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-sm h-full overflow-y-auto animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close filters">
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedCount > 0 && (
            <div className="px-4 pb-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {selectedCount} {selectedCount === 1 ? "filter" : "filters"} selected
              </span>
              <button onClick={clearFilters} className="text-sm text-green-600 font-medium">
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {(Object.keys(filterOptions) as Array<keyof typeof filterOptions>).map((category) => (
            <div key={category} className="border rounded-lg overflow-hidden">
              <button
                className="w-full p-4 flex items-center justify-between bg-gray-50"
                onClick={() => toggleSection(category)}
              >
                <span className="font-medium">{category}</span>
                {openSections[category] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {openSections[category] && (
                <div className="p-4 grid grid-cols-2 gap-2">
                  {filterOptions[category].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          filters[category as keyof FilterState].includes(option)
                            ? "bg-green-600 border-green-600"
                            : "border-gray-300"
                        }`}
                        onClick={() => toggleFilter(category as keyof FilterState, option)}
                      >
                        {filters[category as keyof FilterState].includes(option) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 p-4 bg-white border-t">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
            onClick={handleApply}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

