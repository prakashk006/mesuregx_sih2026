import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  // isPinned: false means default compact mini rail with hover-expansion!
  // true means permanently locked/pinned to 270px wide
  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem('mesuregx_sidebar_pinned') === 'true';
    } catch {
      return false;
    }
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mesuregx_sidebar_pinned', isPinned ? 'true' : 'false');
    } catch {
      // ignore storage errors
    }
  }, [isPinned]);

  const toggleSidebar = () => {
    setIsPinned((prev) => !prev);
  };

  const togglePin = () => {
    setIsPinned((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        isPinned,
        setIsPinned,
        togglePin,
        isHovered,
        setIsHovered,
        isCollapsed: !isPinned, // backward compatibility
        setIsCollapsed: (val) => setIsPinned(!val),
        toggleSidebar,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isPinned: false,
      setIsPinned: () => {},
      togglePin: () => {},
      isHovered: false,
      setIsHovered: () => {},
      isCollapsed: true,
      setIsCollapsed: () => {},
      toggleSidebar: () => {},
      isMobileOpen: false,
      setIsMobileOpen: () => {},
      toggleMobileSidebar: () => {},
      closeMobileSidebar: () => {},
    };
  }
  return context;
}
