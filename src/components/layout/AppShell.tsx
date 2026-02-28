import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Hexagon } from 'lucide-react';

interface AppShellProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedClient?: string | null;
  setSelectedClient?: (client: string | null) => void;
  authLevel: 'ceo' | 'team';
  onLogout: () => void;
  children: ReactNode;
}

export default function AppShell({
  activeView,
  setActiveView,
  selectedClient,
  setSelectedClient,
  authLevel,
  onLogout,
  children
}: AppShellProps) {

  return (
    <div className="min-h-screen bg-onyx flex">
      {/* Sidebar — fixed left on desktop, fixed bottom on mobile */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        authLevel={authLevel}
        onLogout={onLogout}
      />

      {/* Main content — shifts right on desktop, no left-shift on mobile */}
      <main className="flex-1 min-h-screen transition-all duration-300 flex flex-col
                       md:ml-[80px] lg:ml-[210px]
                       pb-[70px] md:pb-0">

        {/* Global Context Bar — hidden on mobile (too cramped) */}
        <header className="hidden md:flex h-[60px] border-b border-border-dark bg-card items-center justify-between px-8 flex-shrink-0 z-40 relative">
          <div className="flex items-center gap-2 text-text-muted">
            <Hexagon size={16} />
            <span className="font-mono text-[13px] font-medium tracking-wide">System Operations</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-medium text-text-muted">Active Context:</span>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-card-alt  rounded-sm hover:border-primary transition-colors min-w-[160px] justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {selectedClient || 'Global View'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
