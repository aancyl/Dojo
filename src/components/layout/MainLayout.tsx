import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
    import { 
        LayoutDashboard, Users, CreditCard, Calendar, User, Award, 
        ShoppingCart, Package, Truck, Wallet, TrendingUp, BarChart3, 
          FileText, UserCircle, LogOut, Menu, X, Search,
        ChevronLeft, ChevronRight, Bell, Swords, CheckCircle2, Coins,
        Dumbbell, Receipt
      } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'trainer', 'desk'] },
  { path: '/members', label: 'Members', icon: Users, roles: ['owner', 'trainer', 'desk'] },
    { path: '/attendance', label: 'Attendance', icon: CheckCircle2, roles: ['owner', 'trainer', 'desk'] },
  { path: '/memberships', label: 'Memberships', icon: CreditCard, roles: ['owner', 'desk'] },
  { path: '/schedule', label: 'Schedule', icon: Calendar, roles: ['owner', 'trainer', 'desk'] },
  { path: '/classes', label: 'Classes', icon: Dumbbell, roles: ['owner', 'trainer', 'desk'] },
  { path: '/trainers', label: 'Trainers', icon: User, roles: ['owner'] },
  { path: '/grading', label: 'Belt Grading', icon: Award, roles: ['owner', 'trainer'] },
  { path: '/pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['owner', 'desk'] },
  { path: '/inventory', label: 'Inventory', icon: Package, roles: ['owner', 'desk'] },
    { path: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['owner'] },
    { path: '/finance', label: 'Finance', icon: Wallet, roles: ['owner'] },
    { path: '/income', label: 'Income', icon: TrendingUp, roles: ['owner'] },
    { path: '/expenses', label: 'Expenses', icon: Receipt, roles: ['owner'] },
    { path: '/petty-cash', label: 'Petty Cash', icon: Coins, roles: ['owner', 'desk'] },
    { path: '/pnl', label: 'Profit & Loss', icon: BarChart3, roles: ['owner'] },

  { path: '/balance-sheet', label: 'Balance Sheet', icon: BarChart3, roles: ['owner'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['owner', 'trainer'] },
];


const MainLayout = ({ children }: MainLayoutProps) => {
  const { currentUser, logout, cart } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

    const filteredMenuItems = menuItems.filter(item => 
      currentUser && item.roles.includes(currentUser.role)
    );
  
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };
  
    const itemVariants = {
      hidden: { x: -20, opacity: 0 },
      visible: { x: 0, opacity: 1 }
    };
  
    // Handle Cmd+K for search

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-3"
                >
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                  >
                    <Swords className="w-5 h-5 text-white animate-float" />
                  </motion.div>
                  <span className="font-display font-black text-xl tracking-tighter gradient-text-vibrant">SAQR DOJO</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                >
                  <Swords className="w-5 h-5 text-white animate-float" />
                </motion.div>
              )}
            </AnimatePresence>

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
            </button>
          )}
        </div>

        {/* Toggle button when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 mx-auto mt-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-sidebar-foreground" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-cyber">
          <motion.ul 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1 px-3"
          >
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.li key={item.path} variants={itemVariants}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden",
                      isActive 
                        ? "text-primary font-bold" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-primary/15 animate-rainbow-border opacity-20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 relative z-10",
                      isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "text-muted-foreground group-hover:text-primary"
                    )} />
                    <AnimatePresence mode="wait">
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-sm font-medium whitespace-nowrap relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            sidebarOpen ? "" : "justify-center"
          )}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-neon-green flex items-center justify-center text-white font-bold">
              {currentUser?.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-dojo-red hover:bg-dojo-red/10 transition-colors",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
            <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold gradient-text-vibrant">SAQR DOJO</span>
          </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
            <Bell className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-dojo-red rounded-full text-[10px] flex items-center justify-center text-white">
                {cartItemCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-sidebar z-50 overflow-y-auto"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Swords className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display font-bold gradient-text-vibrant">SAQR DOJO</span>
                  </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="py-4">
                <ul className="space-y-1 px-3">
                  {filteredMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
                            isActive 
                              ? "bg-primary/20 text-primary" 
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-neon-green flex items-center justify-center text-white font-bold text-lg">
                    {currentUser?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{currentUser?.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{currentUser?.role}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-dojo-red/10 text-dojo-red hover:bg-dojo-red/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg z-[100] px-4"
            >
              <div className="glass-card overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search members, pages, or actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-muted rounded">ESC</kbd>
                </div>
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <p className="text-sm text-muted-foreground mb-3">{searchQuery ? 'Search Results' : 'Quick Actions'}</p>
                    <div className="space-y-1">
                      {filteredMenuItems
                        .filter(item => 
                          !searchQuery || 
                          item.label.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 10).map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      ))}
                      {filteredMenuItems.filter(item => 
                        item.label.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <p className="text-center py-4 text-sm text-muted-foreground">No results for "{searchQuery}"</p>
                      )}
                    </div>
                  </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        "flex-1 min-h-screen pt-16 lg:pt-0 transition-all duration-300",
        sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[72px]"
      )}>
        <div className="p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          {filteredMenuItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
