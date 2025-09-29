"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubCategories } from "@/hooks/use-subcategories";

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const CategorySelector = ({
  value,
  onValueChange,
  disabled = false,
}: CategorySelectorProps) => {
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

  const selectedSubCategory = subCategories.find((sub) => sub.id === value);

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-black border-border text-white hover:bg-border h-12"
          disabled={disabled}
        >
          {selectedSubCategory ? (
            <div className="flex flex-col items-start">
              <span className="text-sm">{selectedSubCategory.name}</span>
              <span className="text-xs text-gray-400">
                {selectedSubCategory.category.name}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">Select category...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 bg-black border-border"
        align="start"
      >
        <div className="flex items-center border-b border-gray-700 px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full border-0 rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus:bg-transparent focus:border-0 focus:ring-0 active:border-0 active:ring-0 active:bg-transparent active:outline-0"
          />
        </div>
        <div className="max-h-60 overflow-auto p-1">
          {filteredSubCategories.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">
              No categories found.
            </div>
          ) : (
            filteredSubCategories.map((subCategory) => (
              <div
                key={subCategory.id}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-700 focus:bg-gray-700",
                  value === subCategory.id && "bg-gray-700"
                )}
                onClick={() => {
                  onValueChange(subCategory.id);
                  setOpen(false);
                  setSearchTerm("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === subCategory.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="text-white">{subCategory.name}</span>
                  <span className="text-xs text-gray-400">
                    {subCategory.category.name}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
