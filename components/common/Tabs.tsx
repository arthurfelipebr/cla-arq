
import React, { useState } from 'react';

interface Tab {
  label: string;
  id: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
  children: (activeTabId: string) => React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTabId, onTabChange, children, className }) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className={className}>
      <div className="border-b border-clarissa-secondary/30">
        <nav className="-mb-px flex space-x-4 overflow-x-auto pb-px clarissa-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-clarissa-primary/50 rounded-t-md
                flex items-center
                ${
                  activeTab === tab.id
                    ? 'border-clarissa-primary text-clarissa-primary'
                    : 'border-transparent text-clarissa-secondary hover:text-clarissa-dark hover:border-clarissa-secondary/50'
                }
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tab-panel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              {tab.icon && <span className="mr-2 h-5 w-5">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`tab-panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
            tabIndex={0} // Make panel focusable when active
            className="focus:outline-none" // Remove default focus outline if not needed or style appropriately
          >
            {activeTab === tab.id && children(activeTab)}
          </div>
        ))}
      </div>
    </div>
  );
};
