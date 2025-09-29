"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubCategories } from "@/hooks/use-subcategories";

interface MultiCategorySelectorProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
  maxSelections?: number;
  placeholder?: string;
}

export const MultiCategorySelector = ({
  value = [],
  onValueChange,
  disabled = false,
  maxSelections = 5,
  placeholder = "Select categories...",
}: MultiCategorySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  // Use TanStack Query hook for data fetching
  const { data: subCategories = [], isLoading, error } = useSubCategories();

  // Filter subcategories based on search term
  const filteredSubCategories = useMemo(() => {
    if (!searchTerm) return subCategories;
    return subCategories.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subCategories, searchTerm]);

  // Get selected subcategories for display
  const selectedSubCategories = subCategories.filter((sub) => 
    value.includes(sub.id)
  );

  const handleToggleCategory = (categoryId: string) => {
    const isSelected = value.includes(categoryId);
    
    if (isSelected) {
      // Remove from selection
      onValueChange(value.filter(id => id !== categoryId));
    } else {
      // Add to selection (if under limit)
      if (value.length < maxSelections) {
        onValueChange([...value, categoryId]);
      }
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    onValueChange(value.filter(id => id !== categoryId));
  };

  const clearAll = () => {
    onValueChange([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-800 border border-gray-700 rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-400">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700 rounded-md">
        <span className="text-sm text-red-400">Failed to load categories</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected Categories Display */}
      {selectedSubCategories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              Selected Categories ({selectedSubCategories.length}/{maxSelections})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 px-2 text-xs text-gray-400 hover:text-white"
            >
              Clear all
            </Button>
          </div>
          <div className="space-y-2">
            {selectedSubCategories.map((subCategory) => (
              <div
                key={subCategory.id}
                className="flex items-center justify-between p-3 bg-blue-600/20 border border-blue-600/30 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {subCategory.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {subCategory.category.name}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCategory(subCategory.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-red-600/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-black border-border text-white hover:bg-border h-12"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-400">{placeholder}</span>
              {value.length > 0 && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  {value.length} selected
                </span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0 bg-black border-border"
          align="start"
        >
          {/* Search Header */}
          <div className="flex items-center border-b border-gray-700 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full border-0 rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus:bg-transparent focus:border-0 focus:ring-0 active:border-0 active:ring-0 active:bg-transparent active:outline-0"
            />
          </div>

          {/* Selection Limit Warning */}
          {value.length >= maxSelections && (
            <div className="px-3 py-2 bg-yellow-900/20 border-b border-yellow-700/30">
              <span className="text-xs text-yellow-400">
                Maximum {maxSelections} categories selected
              </span>
            </div>
          )}

          {/* Categories List */}
          <div className="max-h-60 overflow-auto p-1">
            {filteredSubCategories.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                No categories found.
              </div>
            ) : (
              filteredSubCategories.map((subCategory) => {
                const isSelected = value.includes(subCategory.id);
                const isDisabled = !isSelected && value.length >= maxSelections;
                
                return (
                  <div
                    key={subCategory.id}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2.5 text-sm outline-none hover:bg-gray-700 focus:bg-gray-700",
                      isSelected && "bg-blue-600/20",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isDisabled && handleToggleCategory(subCategory.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="mr-3 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {subCategory.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {subCategory.category.name}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
