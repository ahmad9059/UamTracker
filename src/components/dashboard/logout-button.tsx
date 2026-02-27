"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      disabled={isLoading}
      className="text-destructive focus:text-destructive cursor-pointer"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Sign Out
    </DropdownMenuItem>
  );
}

export function LogoutButtonStandalone() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </>
      )}
    </Button>
  );
}
