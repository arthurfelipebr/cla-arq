import React from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  navigateTo: (path: string) => void;
  currentPath: string; // Added currentPath prop
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, navigateTo, currentPath }) => {
  return (
    <div className="flex h-screen bg-clarissa-background text-clarissa-text">
      <Sidebar navigateTo={navigateTo} currentPath={currentPath} />
      <main className="flex-1 overflow-y-auto clarissa-scrollbar p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};
