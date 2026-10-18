"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type WidgetTab = "chat" | "voice";

interface AssistantWidgetContextType {
  isOpen: boolean;
  activeTab: WidgetTab;
  hasManuallyInteracted: boolean;
  openWidget: (tab?: WidgetTab) => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  setActiveTab: (tab: WidgetTab) => void;
}

const AssistantWidgetContext = createContext<AssistantWidgetContextType | undefined>(undefined);

const DISMISSAL_STORAGE_KEY = "mahad_widget_dismissed";
const AUTO_OPEN_STORAGE_KEY = "mahad_widget_auto_opened";

export function AssistantWidgetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WidgetTab>("chat");
  const [hasManuallyInteracted, setHasManuallyInteracted] = useState(false);

  // 5-second automatic visual-only opening (P13P.7.1 - P13P.7.13)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDismissed = sessionStorage.getItem(DISMISSAL_STORAGE_KEY);
    const hasAutoOpened = sessionStorage.getItem(AUTO_OPEN_STORAGE_KEY);

    if (isDismissed || hasAutoOpened || hasManuallyInteracted) {
      return;
    }

    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem(DISMISSAL_STORAGE_KEY);
      const autoOpened = sessionStorage.getItem(AUTO_OPEN_STORAGE_KEY);
      if (!dismissed && !autoOpened) {
        sessionStorage.setItem(AUTO_OPEN_STORAGE_KEY, "true");
        setActiveTab("chat");
        setIsOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasManuallyInteracted]);

  // Close on Escape key press (P13P.6.11)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setHasManuallyInteracted(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(DISMISSAL_STORAGE_KEY, "true");
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const openWidget = useCallback((tab?: WidgetTab) => {
    setIsOpen(true);
    if (tab) setActiveTab(tab);
    setHasManuallyInteracted(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(AUTO_OPEN_STORAGE_KEY, "true");
    }
  }, []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    setHasManuallyInteracted(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISSAL_STORAGE_KEY, "true");
    }
  }, []);

  const toggleWidget = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      setHasManuallyInteracted(true);
      if (typeof window !== "undefined") {
        if (!next) {
          sessionStorage.setItem(DISMISSAL_STORAGE_KEY, "true");
        } else {
          sessionStorage.setItem(AUTO_OPEN_STORAGE_KEY, "true");
        }
      }
      return next;
    });
  }, []);

  return (
    <AssistantWidgetContext.Provider
      value={{
        isOpen,
        activeTab,
        hasManuallyInteracted,
        openWidget,
        closeWidget,
        toggleWidget,
        setActiveTab,
      }}
    >
      {children}
    </AssistantWidgetContext.Provider>
  );
}

export function useAssistantWidget() {
  const context = useContext(AssistantWidgetContext);
  if (!context) {
    throw new Error("useAssistantWidget must be used within an AssistantWidgetProvider");
  }
  return context;
}
