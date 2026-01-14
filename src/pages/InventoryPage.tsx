import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { InventoryItem, Supplier } from '@/types';
import { 
  Search, Plus, Package, Truck, MoreVertical, 
  Edit, Trash2, Eye, X, AlertTriangle, 
  DollarSign, Hash, Tag, Globe, Phone, Mail,
  MapPin, ShoppingCart, ArrowUpDown, Wallet
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { StatCard } from '@/components/StatCard';

const InventoryPage = () => {
  const { inventory, suppliers, addInventoryItem, updateInventoryItem, deleteInventoryItem, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'suppliers'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const stats = useMemo(() => {
    return {
      totalItems: inventory.length,
      lowStock: inventory.filter(i => i.stock <= i.minStock).length,
      inventoryValue: inventory.reduce((sum, i) => sum + (i.price * i.stock), 0)
    };
  }, [inventory]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(sup => 
      sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteInventoryItem(id);
      toast.success('Item deleted successfully');
    }
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id);
      toast.success('Supplier deleted successfully');
    }
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text-vibrant">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Manage products, stock levels, and suppliers</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="btn-cyber gap-2">
          <Plus className="w-5 h-5" />
          Add {activeTab === 'products' ? 'Product' : 'Supplier'}
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Products" 
          value={stats.totalItems.toString()}
          icon={Package}
          variant="blue"
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStock.toString()}
          icon={AlertTriangle}
          variant="red"
          trend={stats.lowStock > 0 ? "Action required" : "All good"}
        />
        <StatCard 
          title="Inventory Value" 
          value={`AED ${stats.inventoryValue.toLocaleString()}`}
          icon={Wallet}
          variant="gold"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-auto">
            <TabsList className="bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="products" className="px-6 rounded-lg gap-2">
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="px-6 rounded-lg gap-2">
                <Truck className="w-4 h-4" />
                Suppliers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'products' ? (
          <motion.div
            key="products"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredInventory.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="glass-card-hover p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">{item.category}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); }}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Item
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-rose-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price</p>
                      <p className="text-xl font-display font-bold text-emerald-600">AED {item.price}</p>
                    </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stock</p>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-xl font-display font-bold",
                        item.stock <= item.minStock ? "text-rose-600" : "text-slate-900"
                      )}>{item.stock}</p>
                      {item.stock <= item.minStock && (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <span className="text-xs text-muted-foreground">SKU: {item.sku}</span>
                  <span className="mx-auto" />
                  <span className="text-xs text-muted-foreground">Min. Stock: {item.minStock}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="suppliers"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {filteredSuppliers.map((sup) => (
              <motion.div
                key={sup.id}
                variants={itemVariants}
                className="glass-card-hover p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-dojo-red/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-dojo-red" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{sup.name}</h3>
                      <p className="text-xs text-muted-foreground">CP: {sup.contactPerson}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedSupplier(sup); setIsEditModalOpen(true); }}>
                        <Edit className="w-4 h-4 mr-2" /> Edit Supplier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteSupplier(sup.id)} className="text-rose-600">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    {sup.phone}
                  </p>
                  <p className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    {sup.email}
                  </p>
                  <p className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    {sup.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Badge variant="secondary" className="text-[10px]">{sup.category}</Badge>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {activeTab === 'products' ? (
        <ProductFormModal 
          isOpen={isAddModalOpen || (isEditModalOpen && !!selectedItem)}
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedItem(null); }}
          item={selectedItem || undefined}
          mode={selectedItem ? 'edit' : 'add'}
          suppliers={suppliers}
        />
      ) : (
        <SupplierFormModal 
          isOpen={isAddModalOpen || (isEditModalOpen && !!selectedSupplier)}
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setSelectedSupplier(null); }}
          supplier={selectedSupplier || undefined}
          mode={selectedSupplier ? 'edit' : 'add'}
        />
      )}
    </motion.div>
  );
};

const ProductFormModal = ({ isOpen, onClose, item, mode, suppliers }: { isOpen: boolean; onClose: () => void; item?: InventoryItem; mode: 'add' | 'edit'; suppliers: Supplier[] }) => {
  const { addInventoryItem, updateInventoryItem } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    category: 'equipment',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    sku: '',
    supplierId: '',
    branchId: 'branch-1'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: item?.name || '',
        category: item?.category || 'equipment',
        price: item?.price?.toString() || '',
        cost: item?.cost?.toString() || '',
        stock: item?.stock?.toString() || '',
        minStock: item?.minStock?.toString() || '',
        sku: item?.sku || '',
        supplierId: item?.supplierId || '',
        branchId: item?.branchId || 'branch-1'
      });
    }
  }, [isOpen, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
    };

    if (mode === 'add') {
      addInventoryItem(data as any);
      toast.success('Product added successfully');
    } else if (mode === 'edit' && item) {
      updateInventoryItem(item.id, data as any);
      toast.success('Product updated successfully');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === 'add' ? 'Add New Product' : `Edit ${item?.name}`}</DialogTitle>
            <DialogDescription>
              {mode === 'add' ? 'Enter the details for the new inventory item.' : 'Update the details for this inventory item.'}
            </DialogDescription>
          </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="supplements">Supplements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>SKU / Barcode</Label>
              <Input required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
            </div>
          </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cost Price (AED)</Label>
                <Input type="number" step="0.01" required value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Sale Price (AED)</Label>
                <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Initial Stock</Label>
              <Input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Min. Stock Alert</Label>
              <Input type="number" required value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select value={formData.supplierId} onValueChange={v => setFormData({ ...formData, supplierId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="btn-cyber">
              {mode === 'add' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const SupplierFormModal = ({ isOpen, onClose, supplier, mode }: { isOpen: boolean; onClose: () => void; supplier?: Supplier; mode: 'add' | 'edit' }) => {
  const { addSupplier, updateSupplier } = useApp();
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    category: supplier?.category || 'equipment'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'add') {
      addSupplier(formData);
      toast.success('Supplier added successfully');
    } else if (mode === 'edit' && supplier) {
      updateSupplier(supplier.id, formData);
      toast.success('Supplier updated successfully');
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === 'add' ? 'Add New Supplier' : `Edit ${supplier?.name}`}</DialogTitle>
            <DialogDescription>
              {mode === 'add' ? 'Enter the contact and category details for the new supplier.' : 'Update the contact information for this supplier.'}
            </DialogDescription>
          </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Supplier Name</Label>
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Contact Person</Label>
            <Input required value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="supplements">Supplements</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="btn-cyber">
              {mode === 'add' ? 'Add Supplier' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryPage;
