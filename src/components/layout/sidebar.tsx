import { 
  Bot, 
  Map, 
  Sliders, 
  Truck, 
  UserCheck, 
  Package, 
  Users, 
  FileText,
  LogOut,
  X,
  CheckSquare,
  Receipt,
  ClipboardCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  userRole = 'Admin',
  userName = 'Admin User',
  userEmail = 'admin@routexindia.ai',
  onLogout
}) => {
  const menuItems = [
    { id: 'ai', label: 'AI Command Center', icon: Bot },
    { id: 'tracking', label: 'Live Tracking', icon: Map },
    { id: 'gst', label: 'GST Compliance', icon: CheckSquare },
    { id: 'e-invoices', label: 'E-Invoice Manager', icon: Receipt },
    { id: 'e-way-bills', label: 'E-Way Bill System', icon: ClipboardCheck },
    { id: 'admin', label: 'Platform Admin', icon: Sliders },
    { id: 'fleet', label: 'Fleet Management', icon: Truck },
    { id: 'drivers', label: 'Driver Operations', icon: UserCheck },
    { id: 'packages', label: 'Book Shipments', icon: Package },
    { id: 'database', label: 'Client CRM', icon: Users },
    { id: 'reports', label: 'Audits & Reports', icon: FileText },
  ];

  const roleTabs: Record<string, string[]> = {
    admin: ['ai', 'tracking', 'gst', 'e-invoices', 'e-way-bills', 'admin', 'fleet', 'drivers', 'packages', 'database', 'reports'],
    manager: ['ai', 'tracking', 'fleet', 'drivers', 'reports'],
    provider: ['ai', 'tracking', 'gst', 'e-invoices', 'e-way-bills', 'fleet', 'drivers'],
    customer: ['ai', 'tracking', 'e-invoices', 'packages'],
    driver: ['tracking', 'drivers']
  };

  const normalizedRole = userRole.toLowerCase();
  const allowedTabs = roleTabs[normalizedRole] || roleTabs['admin'];
  const filteredMenuItems = menuItems.filter(item => allowedTabs.includes(item.id));

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false); // Close mobile sidebar on click
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 bottom-0 w-72 bg-zinc-50/90 dark:bg-zinc-950/90 border-r border-border z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-6 flex items-center justify-between border-b border-border">
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                RouteXIndia.AI
              </span>
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-widest mt-1">
                Logistics Intelligence
              </span>
            </div>
            <button 
              className="lg:hidden p-1.5 rounded-lg border border-border hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border-l-2 border-blue-500' 
                      : 'text-zinc-550 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
              <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-900/40">
                {userRole.toUpperCase()}
              </span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-950/20 border border-transparent hover:border-red-550/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          
          <div className="text-center text-[10px] text-slate-600 font-mono">
            SYSTEM: v5.0.0-PROD
          </div>
        </div>
      </aside>
    </>
  );
};
