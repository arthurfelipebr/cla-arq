import React from 'react';
import { NAVIGATION_ITEMS, SETTINGS_NAV_ITEMS, MOCK_USER } from '../../constants';
import { NavItem as NavItemType } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Lightbulb } from 'lucide-react'; // Import Lightbulb or other preferred icon

interface NavLinkProps {
  item: NavItemType;
  isActive: boolean;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  const activeClasses = 'bg-clarissa-primary/20 text-clarissa-primary';
  const inactiveClasses = 'text-clarissa-dark hover:bg-clarissa-secondary/20 hover:text-clarissa-dark';
  
  return (
    <a
      href={item.href} 
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      {item.name}
    </a>
  );
};

interface SidebarProps {
  navigateTo: (path: string) => void;
  currentPath: string; 
}

export const Sidebar: React.FC<SidebarProps> = ({ navigateTo, currentPath }) => {
  const { user, logout } = useAuth();
  const currentUser = user || MOCK_USER; 

  const handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout(); 
    navigateTo('/'); 
  };

  const handleNavigationClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault(); 
    navigateTo(path);
  };

  return (
    <div className="flex flex-col h-full w-64 bg-clarissa-background border-r border-clarissa-secondary/30 shadow-md">
      {/* Sidebar Header */}
      <div className="flex items-center justify-center h-20 border-b border-clarissa-secondary/30">
        <h1 className="text-2xl font-bold text-clarissa-primary">C. Dario</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto clarissa-scrollbar">
        {NAVIGATION_ITEMS.map((item) => (
          <NavLink 
            key={item.name} 
            item={item} 
            isActive={item.exact ? currentPath === item.href : currentPath.startsWith(item.href)}
            onClick={(e) => handleNavigationClick(e, item.href)}
          />
        ))}
      </nav>

      {/* Footer / User Area */}
      <div className="border-t border-clarissa-secondary/30 p-4">
         {SETTINGS_NAV_ITEMS.map((item) => {
           if (item.href === '#logout') { 
             return (
                <NavLink 
                    key={item.name} 
                    item={item} 
                    isActive={false} 
                    onClick={handleLogoutClick}
                />
             );
           }
           return (
            <NavLink 
                key={item.name} 
                item={item} 
                isActive={item.exact ? currentPath === item.href : currentPath.startsWith(item.href)}
                onClick={(e) => handleNavigationClick(e, item.href)}
            />
           )
         })}
        <div className="mt-4 flex items-center">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=CB956F&color=fff`}
            alt={`${currentUser.name}'s avatar`}
          />
          <div className="ml-3">
            <p className="text-sm font-semibold text-clarissa-dark">{currentUser.name}</p>
            <p className="text-xs text-clarissa-secondary">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
