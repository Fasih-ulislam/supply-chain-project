'use client';

import { ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills';
}

export function Tabs({ items, defaultTab, onChange, variant = 'default' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabChange = (tabId: string) => {
    const tab = items.find(item => item.id === tabId);
    if (tab?.disabled) return;
    
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeContent = items.find(item => item.id === activeTab)?.content;

  return (
    <div>
      <div className={`border-b border-gray-200 ${variant === 'pills' ? 'border-0' : ''}`}>
        <nav className={`flex ${variant === 'pills' ? 'gap-2' : '-mb-px'}`}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              disabled={item.disabled}
              className={`
                ${variant === 'pills' 
                  ? `px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`
                  : `px-4 py-3 border-b-2 font-medium transition-colors ${
                      activeTab === item.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`
                }
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {activeContent}
      </div>
    </div>
  );
}
