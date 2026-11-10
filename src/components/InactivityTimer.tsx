"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function InactivityTimer() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Define inactivity duration (e.g., 15 minutes = 15 * 60 * 1000 ms)
    const TIMEOUT_DURATION = 15 * 60 * 1000; 

    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, TIMEOUT_DURATION);
    };

    // Events that indicate user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    // Attach event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer on load
    resetTimer();

    // Cleanup listeners on unmount
    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [router, supabase]);

  return null; // This component runs silently in the background
}