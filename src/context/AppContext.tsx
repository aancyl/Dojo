import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  AppState, Member, Trainer, MembershipPlan, ClassSession, InventoryItem, 
  Supplier, Sale, LedgerEntry, Cheque, User, GradingRecord, ClassAttendance,
  CartItem, AuditLog, BeltRank, PettyCashEntry, ClassSessionStatus, SessionStatus
} from '@/types';
import { STORAGE_KEY, getInitialData, mockUsers } from '../data/mockData';

interface AppContextType extends AppState {
  // Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Members
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  freezeMembership: (memberId: string, startDate: string, endDate: string) => void;
  unfreezeMembership: (memberId: string) => void;
  
  // Trainers
  addTrainer: (trainer: Omit<Trainer, 'id'>) => void;
  updateTrainer: (id: string, updates: Partial<Trainer>) => void;
  deleteTrainer: (id: string) => void;
  
  // Plans
  addPlan: (plan: Omit<MembershipPlan, 'id'>) => void;
  updatePlan: (id: string, updates: Partial<MembershipPlan>) => void;
  
  // Classes
  addClass: (classSession: Omit<ClassSession, 'id'>) => void;
  updateClass: (id: string, updates: Partial<ClassSession>) => void;
  deleteClass: (id: string) => void;
  checkInMember: (classId: string, memberId: string) => void;
  checkInTrainer: (classId: string, trainerId: string) => void;
  updateClassStatus: (classId: string, date: string, status: SessionStatus) => void;
    
    // Grading
  promoteMember: (memberId: string, newBelt: BeltRank, trainerId: string, notes?: string) => void;
  
  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  
  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // POS & Cart
  addToCart: (item: InventoryItem, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
    checkout: (paymentMethod: 'cash' | 'card', memberId?: string) => void;
  
    // Finance
    addLedgerEntry: (entry: Omit<LedgerEntry, 'id'>) => void;
    addCheque: (cheque: Omit<Cheque, 'id'>) => void;
    updateChequeStatus: (id: string, status: 'pending' | 'cleared' | 'bounced') => void;
    
    // Petty Cash
    addPettyCashEntry: (entry: Omit<PettyCashEntry, 'id'>) => void;
    updatePettyCashEntry: (id: string, updates: Partial<PettyCashEntry>) => void;
    deletePettyCashEntry: (id: string) => void;

    // Additional Finance
    deleteLedgerEntry: (id: string) => void;

  
  // Computed values
  getTotalIncome: (startDate?: string, endDate?: string) => number;
  getTotalExpenses: (startDate?: string, endDate?: string) => number;
  getNetProfit: (startDate?: string, endDate?: string) => number;
  getActiveMembers: () => Member[];
  getTodayIncome: () => number;
  getInventoryValue: () => number;
  
  // Audit
  addAuditLog: (action: string, module: string, details: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const generateId = () => Math.random().toString(36).substr(2, 9);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [attendance, setAttendance] = useState<ClassAttendance[]>([]);
    const [classStatuses, setClassStatuses] = useState<ClassSessionStatus[]>([]);
    const [gradings, setGradings] = useState<GradingRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [pettyCash, setPettyCash] = useState<PettyCashEntry[]>([]);


    // Load from localStorage on mount
    useEffect(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const initial = getInitialData();
        
        setMembers(data.members || initial.members);
        setTrainers(data.trainers || initial.trainers);
        setPlans(data.plans || initial.plans);
        setClasses(data.classes || initial.classes);
        setAttendance(data.attendance || initial.attendance);
        setClassStatuses(data.classStatuses || initial.classStatuses);
        setGradings(data.gradings || initial.gradings);
        setInventory(data.inventory || initial.inventory);
        setSuppliers(data.suppliers || initial.suppliers);
        setSales(data.sales || initial.sales);
        setLedger(data.ledger || initial.ledger);
        setCheques(data.cheques || initial.cheques);
        setBranches(data.branches || initial.branches);
        setAuditLogs(data.auditLogs || initial.auditLogs);
        setPettyCash(data.pettyCash && data.pettyCash.length > 0 ? data.pettyCash : initial.pettyCash);
      } else {
        // Seed with mock data
        const initialData = getInitialData();
        setMembers(initialData.members);
        setTrainers(initialData.trainers);
        setPlans(initialData.plans);
        setClasses(initialData.classes);
        setAttendance(initialData.attendance);
        setGradings(initialData.gradings);
        setInventory(initialData.inventory);
        setSuppliers(initialData.suppliers);
        setSales(initialData.sales);
        setLedger(initialData.ledger);
        setCheques(initialData.cheques);
        setBranches(initialData.branches);
        setPettyCash(initialData.pettyCash);
      }

    
    // Check for stored user session
    const storedUser = localStorage.getItem('dojo-current-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isInitialized) {
      const data = { 
        members, trainers, plans, classes, attendance, classStatuses, gradings, 
        inventory, suppliers, sales, ledger, cheques, branches, auditLogs, pettyCash 
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [isInitialized, members, trainers, plans, classes, attendance, classStatuses, gradings, inventory, suppliers, sales, ledger, cheques, branches, auditLogs, pettyCash]);

  // Auth functions
  const login = useCallback((email: string, password: string) => {
    let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user && email) {
      // If user not found, create a temporary one so "anything works"
      user = {
        id: `user-${generateId()}`,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email,
        role: 'owner',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
    }

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('dojo-current-user', JSON.stringify(user));
      addAuditLog('Login', 'Auth', `User ${user.name} logged in`);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      addAuditLog('Logout', 'Auth', `User ${currentUser.name} logged out`);
    }
    setCurrentUser(null);
    localStorage.removeItem('dojo-current-user');
  }, [currentUser]);

  // Member functions
  const addMember = useCallback((member: Omit<Member, 'id'>) => {
    const newMember = { ...member, id: `mem-${generateId()}` };
    setMembers(prev => [...prev, newMember]);
    addAuditLog('Create', 'Members', `Added member: ${member.name}`);
  }, []);

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    addAuditLog('Update', 'Members', `Updated member: ${id}`);
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    addAuditLog('Delete', 'Members', `Deleted member: ${id}`);
  }, []);

  const freezeMembership = useCallback((memberId: string, startDate: string, endDate: string) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId 
        ? { ...m, status: 'frozen' as const, freezeStart: startDate, freezeEnd: endDate }
        : m
    ));
    addAuditLog('Freeze', 'Memberships', `Froze membership for: ${memberId}`);
  }, []);

  const unfreezeMembership = useCallback((memberId: string) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId 
        ? { ...m, status: 'active' as const, freezeStart: undefined, freezeEnd: undefined }
        : m
    ));
    addAuditLog('Unfreeze', 'Memberships', `Unfroze membership for: ${memberId}`);
  }, []);

  // Trainer functions
  const addTrainer = useCallback((trainer: Omit<Trainer, 'id'>) => {
    const newTrainer = { ...trainer, id: `trainer-${generateId()}` };
    setTrainers(prev => [...prev, newTrainer]);
    addAuditLog('Create', 'Trainers', `Added trainer: ${trainer.name}`);
  }, []);

  const updateTrainer = useCallback((id: string, updates: Partial<Trainer>) => {
    setTrainers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    addAuditLog('Update', 'Trainers', `Updated trainer: ${id}`);
  }, []);

  const deleteTrainer = useCallback((id: string) => {
    setTrainers(prev => prev.filter(t => t.id !== id));
    addAuditLog('Delete', 'Trainers', `Deleted trainer: ${id}`);
  }, []);

  // Plan functions
  const addPlan = useCallback((plan: Omit<MembershipPlan, 'id'>) => {
    const newPlan = { ...plan, id: `plan-${generateId()}` };
    setPlans(prev => [...prev, newPlan]);
    addAuditLog('Create', 'Plans', `Added plan: ${plan.name}`);
  }, []);

  const updatePlan = useCallback((id: string, updates: Partial<MembershipPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    addAuditLog('Update', 'Plans', `Updated plan: ${id}`);
  }, []);

  // Class functions
  const addClass = useCallback((classSession: Omit<ClassSession, 'id'>) => {
    const newClass = { ...classSession, id: `class-${generateId()}` };
    setClasses(prev => [...prev, newClass]);
    addAuditLog('Create', 'Classes', `Added class: ${classSession.name}`);
  }, []);

  const updateClass = useCallback((id: string, updates: Partial<ClassSession>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addAuditLog('Update', 'Classes', `Updated class: ${id}`);
  }, []);

  const deleteClass = useCallback((id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    addAuditLog('Delete', 'Classes', `Deleted class: ${id}`);
  }, []);

  const checkInMember = useCallback((classId: string, memberId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().slice(0, 5);
    const newAttendance: ClassAttendance = {
      id: `att-${generateId()}`,
      classId,
      memberId,
      date: today,
      checkedIn: true,
      checkInTime: time
    };
    setAttendance(prev => [...prev, newAttendance]);
    addAuditLog('Check-in', 'Attendance', `Member ${memberId} checked in to class ${classId}`);
  }, []);

  const checkInTrainer = useCallback((classId: string, trainerId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().slice(0, 5);
    const newAttendance: ClassAttendance = {
      id: `att-${generateId()}`,
      classId,
      trainerId,
      date: today,
      checkedIn: true,
      checkInTime: time
    };
    setAttendance(prev => [...prev, newAttendance]);
    addAuditLog('Check-in', 'Attendance', `Trainer ${trainerId} checked in to class ${classId}`);
  }, []);

  const updateClassStatus = useCallback((classId: string, date: string, status: SessionStatus) => {
    setClassStatuses(prev => {
      const existingIndex = prev.findIndex(s => s.classId === classId && s.date === date);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], status };
        return updated;
      }
      return [...prev, { id: `cs-${generateId()}`, classId, date, status }];
    });
    addAuditLog('Update', 'Classes', `Updated class ${classId} status on ${date} to ${status}`);
  }, []);

  // Grading
  const promoteMember = useCallback((memberId: string, newBelt: BeltRank, trainerId: string, notes?: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      const grading: GradingRecord = {
        id: `grad-${generateId()}`,
        memberId,
        fromBelt: member.belt,
        toBelt: newBelt,
        date: new Date().toISOString().split('T')[0],
        trainerId,
        notes
      };
      setGradings(prev => [...prev, grading]);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, belt: newBelt } : m));
      addAuditLog('Promotion', 'Grading', `Promoted ${member.name} from ${member.belt} to ${newBelt}`);
    }
  }, [members]);

  // Inventory functions
  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: `inv-${generateId()}` };
    setInventory(prev => [...prev, newItem]);
    addAuditLog('Create', 'Inventory', `Added item: ${item.name}`);
  }, []);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    addAuditLog('Update', 'Inventory', `Updated item: ${id}`);
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    addAuditLog('Delete', 'Inventory', `Deleted item: ${id}`);
  }, []);

  // Supplier functions
  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplier, id: `sup-${generateId()}` };
    setSuppliers(prev => [...prev, newSupplier]);
    addAuditLog('Create', 'Suppliers', `Added supplier: ${supplier.name}`);
  }, []);

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    addAuditLog('Update', 'Suppliers', `Updated supplier: ${id}`);
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    addAuditLog('Delete', 'Suppliers', `Deleted supplier: ${id}`);
  }, []);

  // Cart & POS functions
  const addToCart = useCallback((item: InventoryItem, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + quantity } : c);
      }
      return [...prev, { item, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prev => prev.map(c => c.item.id === itemId ? { ...c, quantity } : c));
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const checkout = useCallback((paymentMethod: 'cash' | 'card', memberId?: string) => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
    const today = new Date().toISOString().split('T')[0];
    
    // Create sale
    const sale: Sale = {
      id: `sale-${generateId()}`,
      items: cart.map(c => ({ itemId: c.item.id, name: c.item.name, quantity: c.quantity, price: c.item.price })),
      total,
      paymentMethod,
      memberId,
      date: today,
      branchId: 'branch-1'
    };
    setSales(prev => [...prev, sale]);

    // Update inventory
    setInventory(prev => prev.map(inv => {
      const cartItem = cart.find(c => c.item.id === inv.id);
      if (cartItem) {
        return { ...inv, stock: inv.stock - cartItem.quantity };
      }
      return inv;
    }));

    // Add ledger entry
    const entry: LedgerEntry = {
      id: `led-${generateId()}`,
      date: today,
      type: 'credit',
      category: 'sales',
      description: `POS Sale #${sale.id}`,
      amount: total,
      reference: sale.id,
      branchId: 'branch-1'
    };
    setLedger(prev => [...prev, entry]);

    // Clear cart
    setCart([]);
    addAuditLog('Checkout', 'POS', `Processed sale of AED ${total} via ${paymentMethod}`);
  }, [cart]);

  // Finance functions
  const addLedgerEntry = useCallback((entry: Omit<LedgerEntry, 'id'>) => {
    const newEntry = { ...entry, id: `led-${generateId()}` };
    setLedger(prev => [...prev, newEntry]);
    addAuditLog('Create', 'Finance', `Added ${entry.type} entry: AED ${entry.amount}`);
  }, []);

  const addCheque = useCallback((cheque: Omit<Cheque, 'id'>) => {
    const newCheque = { ...cheque, id: `chq-${generateId()}` };
    setCheques(prev => [...prev, newCheque]);
    addAuditLog('Create', 'Cheques', `Added cheque: ${cheque.chequeNumber}`);
  }, []);

  const updateChequeStatus = useCallback((id: string, status: 'pending' | 'cleared' | 'bounced') => {
    setCheques(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    addAuditLog('Update', 'Cheques', `Updated cheque ${id} status to ${status}`);
  }, []);

  // Petty Cash functions
  const addPettyCashEntry = useCallback((entry: Omit<PettyCashEntry, 'id'>) => {
    const newEntry = { ...entry, id: `pc-${generateId()}` };
    setPettyCash(prev => [...prev, newEntry]);
    addAuditLog('Create', 'Petty Cash', `Added petty cash entry: AED ${entry.amount} - ${entry.description}`);
  }, []);

  const updatePettyCashEntry = useCallback((id: string, updates: Partial<PettyCashEntry>) => {
    setPettyCash(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    addAuditLog('Update', 'Petty Cash', `Updated petty cash entry: ${id}`);
  }, []);

    const deletePettyCashEntry = useCallback((id: string) => {
      setPettyCash(prev => prev.filter(e => e.id !== id));
      addAuditLog('Delete', 'Petty Cash', `Deleted petty cash entry: ${id}`);
    }, []);

    const deleteLedgerEntry = useCallback((id: string) => {
      setLedger(prev => prev.filter(e => e.id !== id));
      addAuditLog('Delete', 'Finance', `Deleted ledger entry: ${id}`);
    }, []);

    // Computed values

  const getTotalIncome = useCallback((startDate?: string, endDate?: string) => {
    return ledger
      .filter(e => e.type === 'credit')
      .filter(e => !startDate || e.date >= startDate)
      .filter(e => !endDate || e.date <= endDate)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [ledger]);

  const getTotalExpenses = useCallback((startDate?: string, endDate?: string) => {
    return ledger
      .filter(e => e.type === 'debit')
      .filter(e => !startDate || e.date >= startDate)
      .filter(e => !endDate || e.date <= endDate)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [ledger]);

  const getNetProfit = useCallback((startDate?: string, endDate?: string) => {
    return getTotalIncome(startDate, endDate) - getTotalExpenses(startDate, endDate);
  }, [getTotalIncome, getTotalExpenses]);

  const getActiveMembers = useCallback(() => {
    return members.filter(m => m.status === 'active');
  }, [members]);

  const getTodayIncome = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return getTotalIncome(today, today);
  }, [getTotalIncome]);

  const getInventoryValue = useCallback(() => {
    return inventory.reduce((sum, i) => sum + i.cost * i.stock, 0);
  }, [inventory]);

  // Audit
  const addAuditLog = useCallback((action: string, module: string, details: string) => {
    const log: AuditLog = {
      id: `log-${generateId()}`,
      userId: currentUser?.id || 'system',
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev].slice(0, 500)); // Keep last 500 logs
  }, [currentUser]);

  const value: AppContextType = {
    currentUser,
    members,
    trainers,
    plans,
    classes,
    attendance,
    classStatuses,
    gradings,
    inventory,
    suppliers,
    sales,
    ledger,
    cheques,
    branches,
    auditLogs,
    cart,
    pettyCash,
    login,
    logout,
    addMember,
    updateMember,
    deleteMember,
    freezeMembership,
    unfreezeMembership,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    addPlan,
    updatePlan,
    addClass,
    updateClass,
    deleteClass,
    checkInMember,
    checkInTrainer,
    updateClassStatus,
    promoteMember,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkout,
    addLedgerEntry,
    addCheque,
    updateChequeStatus,
    addPettyCashEntry,
      updatePettyCashEntry,
      deletePettyCashEntry,
      deleteLedgerEntry,
      getTotalIncome,

    getTotalExpenses,
    getNetProfit,
    getActiveMembers,
    getTodayIncome,
    getInventoryValue,
    addAuditLog
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
