import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { InventoryItem, CartItem } from '@/types';
import { 
  ShoppingCart, Package, Plus, Minus, CreditCard, 
  Banknote, X, Check, Search, TrendingUp, DollarSign,
  Box, User, AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/StatCard';

const POSPage = () => {
  const { inventory, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, checkout, members, ledger } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [lastTransactionTotal, setLastTransactionTotal] = useState(0);

  const categories = ['all', 'equipment', 'apparel', 'accessories', 'supplements'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const hasStock = item.stock > 0;
    return matchesSearch && matchesCategory && hasStock;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = ledger
      .filter(t => t.date.split('T')[0] === today && t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      todaySales,
      totalItems: inventory.length,
      lowStock: inventory.filter(i => i.stock < 5).length,
      totalMembers: members.length
    };
  }, [ledger, inventory, members]);

    const handleCheckout = () => {
      setLastTransactionTotal(cartTotal);
      checkout(paymentMethod, selectedMemberId || undefined);
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setShowCheckout(false);
        setSelectedMemberId('');
      }, 2000);
    };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'equipment': return 'bg-primary/20 text-primary';
      case 'apparel': return 'bg-purple-500/20 text-purple-400';
      case 'accessories': return 'bg-neon-gold/20 text-neon-gold';
      case 'supplements': return 'bg-neon-green/20 text-neon-green';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6"
    >
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Today's Sales" 
          value={`AED ${stats.todaySales.toLocaleString()}`}
          icon={TrendingUp}
          variant="green"
        />
        <StatCard 
          title="Inventory Items" 
          value={stats.totalItems.toString()}
          icon={Box}
          variant="blue"
        />
        <StatCard 
          title="Low Stock" 
          value={stats.lowStock.toString()}
          icon={AlertTriangle}
          variant="red"
        />
        <StatCard 
          title="Total Members" 
          value={stats.totalMembers.toString()}
          icon={User}
          variant="gold"
        />
      </motion.div>

      {/* Search & Filters */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-primary text-white"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {cat === 'all' ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          variants={containerVariants}
          className="flex-1 lg:overflow-y-auto scrollbar-cyber grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 content-start"
        >
          <AnimatePresence mode="popLayout">
            {filteredInventory.map((item) => {
              const cartItem = cart.find(c => c.item.id === item.id);
              const isInCart = !!cartItem;
              
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !isInCart && addToCart(item, 1)}
                  className={cn(
                    "glass-card p-4 cursor-pointer transition-all relative overflow-hidden",
                    isInCart && "ring-2 ring-primary"
                  )}
                >
                  {/* Category Badge */}
                  <span className={cn(
                    "absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full uppercase font-medium",
                    getCategoryColor(item.category)
                  )}>
                    {item.category}
                  </span>

                  {/* Product Icon/Image */}
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-dojo-red/20 flex items-center justify-center">
                    <Package className="w-8 h-8 text-primary" />
                  </div>

                  {/* Product Info */}
                  <h3 className="font-semibold text-sm text-center mb-1 line-clamp-2">{item.name}</h3>
                  <p className="text-xl font-display font-bold text-center text-neon-green">AED {item.price}</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {item.stock} in stock
                  </p>

                  {/* In Cart Indicator */}
                  {isInCart && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-card/90 backdrop-blur px-3 py-2 rounded-lg">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(item.id, cartItem.quantity - 1);
                          }}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg w-8 text-center">{cartItem.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cartItem.quantity < item.stock) {
                              updateCartQuantity(item.id, cartItem.quantity + 1);
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cart Section */}
      <div className={cn(
        "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
        isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsCartOpen(false)} />

      <motion.div
        initial={false}
        animate={{ 
          x: typeof window !== 'undefined' && window.innerWidth < 1024 
            ? (isCartOpen ? 0 : '100%') 
            : 0 
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[90%] max-w-[400px] glass-card flex flex-col shadow-2xl lg:static lg:w-96 lg:h-[calc(100vh-8rem)] lg:translate-x-0 lg:shadow-none",
          !isCartOpen && "lg:flex"
        )}
      >
        {/* Cart Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-primary" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-dojo-red rounded-full text-[11px] flex items-center justify-center text-white font-bold">
                  {cartItemCount}
                </span>
              )}
            </div>
            <h2 className="text-lg font-display font-semibold">Cart</h2>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-dojo-red hover:underline mr-2"
              >
                Clear All
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(false)}
              className="lg:hidden p-2 hover:bg-muted rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto scrollbar-cyber p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Cart is empty</p>
                <p className="text-sm text-muted-foreground/60">Click on products to add them</p>
              </motion.div>
            ) : (
              cart.map((cartItem) => (
                <motion.div
                  key={cartItem.item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{cartItem.item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      AED {cartItem.item.price} × {cartItem.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{cartItem.quantity}</span>
                    <button
                      onClick={() => {
                        if (cartItem.quantity < cartItem.item.stock) {
                          updateCartQuantity(cartItem.item.id, cartItem.quantity + 1);
                        }
                      }}
                      className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-bold text-neon-green w-16 text-right">
                    AED {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border space-y-4 bg-card/50">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-2xl font-display font-bold">AED {cartTotal.toFixed(2)}</span>
            </div>

            {/* Member Selection */}
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full p-3 rounded-lg bg-background/50 border border-border text-sm"
            >
              <option value="">Walk-in Customer</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>

            {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { method: 'cash' as const, icon: Banknote, label: 'Cash' },
                  { method: 'card' as const, icon: CreditCard, label: 'Card' },
                ].map(({ method, icon: Icon, label }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                    paymentMethod === method
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    paymentMethod === method ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Checkout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full btn-cyber text-white py-4 text-lg font-semibold"
            >
              Complete Sale - AED {cartTotal.toFixed(2)}
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Floating Cart Button for Mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden z-30 w-16 h-16 rounded-full btn-cyber text-white shadow-2xl flex items-center justify-center"
      >
        <div className="relative">
          <ShoppingCart className="w-7 h-7" />
          {cartItemCount > 0 && (
            <span className="absolute -top-3 -right-3 w-6 h-6 bg-white text-primary rounded-full text-xs flex items-center justify-center font-bold">
              {cartItemCount}
            </span>
          )}
        </div>
      </motion.button>

      {/* Success Modal */}
      <AnimatePresence>
        {checkoutSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card p-8 text-center max-w-sm mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-neon-green" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold mb-2">Sale Complete!</h3>
                <p className="text-muted-foreground">
                  Transaction of AED {lastTransactionTotal.toFixed(2)} processed successfully
                </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default POSPage;
