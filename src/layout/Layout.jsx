import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [bIsSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bIsCollapsed, setIsCollapsed] = useState(false);
  const [bIsMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!bIsCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`  
          fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out
          ${bIsMobileSidebarOpen ? 'w-56' : 'w-0'} lg:${bIsSidebarOpen ? (bIsCollapsed? 'w-16' : 'w-56') : 'w-0'}
        `}
      >
        <Sidebar 
          onClose={() => setIsSidebarOpen(false)} 
          isCollapsed={bIsCollapsed} 
          onToggle={toggleSidebar} 
          isMobileOpen={bIsMobileSidebarOpen}
        />
      </div>

      {/* Overlay for mobile */}
      {bIsMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div 
        className={`
          flex flex-col min-h-screen transition-all duration-300
          ${bIsMobileSidebarOpen ? 'pl-56' : 'pl-0'}
          ${bIsSidebarOpen && bIsCollapsed ? 'lg:pl-16' : ''}
          ${bIsSidebarOpen && !bIsCollapsed ? 'lg:pl-56' : ''}
          {!bIsSidebarOpen ? 'lg:pl-0' : ''}
        `}
      >
        <Header onMenuClick={() => setIsMobileSidebarOpen(!bIsMobileSidebarOpen)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
