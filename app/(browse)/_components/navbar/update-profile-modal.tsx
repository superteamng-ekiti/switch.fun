import { createUser, updateUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CategoriesSelector } from "./categories-selector";

export interface Category {
  id: string;
  name: string;
  slug: string;
  subCategories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface UpdateUserProfileModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  currentUser: {
    id: string;
    username: string;
    picture: string;
    interests: {
      subCategory: {
        id: string;
        name: string;
      };
    }[];
  };
}

const MIN_INTERESTS = 3;
const MAX_INTERESTS = 8;

export const UpdateUserProfileModal = React.memo(({
  open,
  setOpen,
  currentUser,
}: UpdateUserProfileModalProps) => {
  // Initialize state only once to prevent re-renders
  const [username, setUsername] = useState(() => currentUser?.username ?? "");
  const [submitting, setSubmitting] = useState(false);
  
  // Memoize initial interests to prevent unnecessary re-calculations
  const initialInterests = useMemo(() => 
    currentUser?.interests?.map((interest) => interest.subCategory.id) ?? [], 
    [currentUser?.interests]
  );
  
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(initialInterests);

  // Only update username when currentUser.username actually changes
  useEffect(() => {
    if (currentUser?.username && currentUser.username !== username) {
      setUsername(currentUser.username);
    }
  }, [currentUser?.username]); // More specific dependency

  // Reset interests when currentUser changes (only when needed)
  useEffect(() => {
    const newInterests = currentUser?.interests?.map((interest) => interest.subCategory.id) ?? [];
    const currentInterestsString = selectedSubCategories.sort().join(',');
    const newInterestsString = newInterests.sort().join(',');
    
    if (currentInterestsString !== newInterestsString) {
      setSelectedSubCategories(newInterests);
    }
  }, [currentUser?.interests]); // Only depend on interests

  // Memoize validation to prevent re-computation on every render
  const validation = useMemo(() => {
    const isValidInterests = selectedSubCategories.length >= MIN_INTERESTS && 
                            selectedSubCategories.length <= MAX_INTERESTS;
    const isValidUsername = username.trim().length >= 3;
    const canSubmit = isValidInterests && isValidUsername && !submitting;
    
    return { isValidInterests, isValidUsername, canSubmit };
  }, [selectedSubCategories.length, username, submitting]);

  // Memoize the submit handler to prevent re-creating on every render
  const handleOnSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.canSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      if (currentUser.username) {
        await updateUser({
          id: currentUser.id,
          username,
          interests: selectedSubCategories,
        });
      } else {
        await createUser({
          externalUserId: currentUser.id,
          username,
          imageUrl: currentUser.picture,
          interests: selectedSubCategories,
        });
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setSubmitting(false);
      setOpen(false);
    }
  }, [validation.canSubmit, currentUser, username, selectedSubCategories, setOpen]);

  // Memoize username change handler
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);

  // Show username validation error
  const showUsernameError = username.trim().length > 0 && username.trim().length < 3;

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogClose />
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <form className="py-4 px-2 space-y-6" onSubmit={handleOnSubmit}>
          <h1 className="text-center text-2xl font-bold font-sans">
            Update User Details
          </h1>

          {/* Username Section */}
          <div className="flex flex-col gap-y-2">
            <label className="text-sm font-medium font-sans" htmlFor="username">
              Username
            </label>
            <Input
              className="w-full"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Choose a username…"
              minLength={3}
              maxLength={20}
            />
            {showUsernameError && (
              <p className="text-xs text-red-600">
                Username must be at least 3 characters
              </p>
            )}
          </div>

          <CategoriesSelector
            selectedInterests={selectedSubCategories}
            setSelectedInterests={setSelectedSubCategories}
            open={open}
          />

          <DialogFooter className="mt-6 sticky bottom-0 bg-background border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button type="submit" disabled={!validation.canSubmit} className="w-full">
                {submitting ? "Updating…" : "Update User Details"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

UpdateUserProfileModal.displayName = "UpdateUserProfileModal";
