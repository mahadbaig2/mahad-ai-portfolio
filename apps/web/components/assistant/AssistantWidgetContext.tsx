"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type WidgetTab = "chat" | "voice";

interface AssistantWidgetContextType {
  isOpen: boolean;
  invitationVisible: boolean;
  activeTab: WidgetTab;
  hasManuallyInteracted: boolean;
  openWidget: (tab?: WidgetTab) => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  dismissInvitation: () => void;
  setActiveTab: (tab: WidgetTab) => void;
}

const AssistantWidgetContext = createContext<AssistantWidgetContextType | undefined>(undefined);

const DISMISSAL_STORAGE_KEY = "mahad_widget_dismissed";
const AUTO_INVITE_STORAGE_KEY = "mahad_widget_auto_invited";

export function AssistantWidgetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [invitationVisible, setInvitationVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<WidgetTab>("chat");
  const [hasManuallyInteracted, setHasManuallyInteracted] = useState(false);

  // 5-second automatic visual-only invitation (Section 17)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isDismissed = sessionStorage.getItem(DISMISSAL_STORAGE_KEY);
    const hasAutoInvited = sessionStorage.getItem(AUTO_INVITE_STORAGE_KEY);

    if (isDismissed || hasAutoInvited || hasManuallyInteracted || isOpen) {
      return;
    }

    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem(DISMISSAL_STORAGE_KEY);
      const autoInvited = sessionStorage.getItem(AUTO_INVITE_STORAGE_KEY);
      if (!dismissed && !autoInvited && !isOpen) {
        sessionStorage.setItem(AUTO_INVITE_STORAGE_KEY, "true");
        setInvitationVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasManuallyInteracted, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isOpen) {
          setIsOpen(false);
          setHasManuallyInteracted(true);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(DISMISSAL_STORAGE_KEY, "true");
          }
        }
        if (invitationVisible) {
          setInvitationVisible(false);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(DISMISSAL_STORAGE_KEY, "true");
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, invitationVisible]);

  const dismissInvitation = useCallback(() => {
    setInvitationVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISSAL_STORAGE_KEY, "true");
    }
  }, []);

  const openWidget = useCallback((tab?: WidgetTab) => {
    setInvitationVisible(false);
    setIsOpen(true);
    if (tab) setActiveTab(tab);
    setHasManuallyInteracted(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(AUTO_INVITE_STORAGE_KEY, "true");
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
    setInvitationVisible(false);
    setIsOpen((prev) => {
      const next = !prev;
      setHasManuallyInteracted(true);
      if (typeof window !== "undefined") {
        if (!next) {
          sessionStorage.setItem(DISMISSAL_STORAGE_KEY, "true");
        } else {
          sessionStorage.setItem(AUTO_INVITE_STORAGE_KEY, "true");
        }
      }
      return next;
    });
  }, []);

  return (
    <AssistantWidgetContext.Provider
      value={{
        isOpen,
        invitationVisible,
        activeTab,
        hasManuallyInteracted,
        openWidget,
        closeWidget,
        toggleWidget,
        dismissInvitation,
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
