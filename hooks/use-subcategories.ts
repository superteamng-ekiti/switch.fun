import { useQuery } from "@tanstack/react-query";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  category: {
    name: string;
  };
}

export function useSubCategories() {
  return useQuery({
    queryKey: ["subcategories"],
    queryFn: async (): Promise<SubCategory[]> => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to load categories");
      }

      // Flatten subcategories from all categories
      const allSubCategories = data.data.flatMap((category: any) => 
        category.subCategories.map((sub: any) => ({
          ...sub,
          category: { name: category.name }
        }))
      );

      return allSubCategories;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
