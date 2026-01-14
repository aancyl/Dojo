// Core Types for Martial Arts Club Management

export type UserRole = 'owner' | 'trainer' | 'desk';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  createdAt: string;
}

export type BeltRank = string;

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  belt: BeltRank;
  disciplineId?: string;
  planId: string;
  joinDate: string;
  expiryDate: string;
  status: 'active' | 'frozen' | 'expired';
  freezeStart?: string;
  freezeEnd?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  branchId: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  sessionsPerWeek: number;
  features: string[];
  isActive: boolean;
}

export interface ClassSession {
  id: string;
  name: string;
  disciplineId?: string;
  trainerId: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  maxCapacity: number;
  beltMin: BeltRank;
  beltMax: BeltRank;
  branchId: string;
}

export interface ClassAttendance {
  id: string;
  classId: string;
  memberId?: string;
  trainerId?: string;
  date: string;
  checkedIn: boolean;
  checkInTime?: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  skills: string[];
  disciplineIds?: string[];
  belt: BeltRank;
  baseSalary: number;
  ratePerClass: number;
  joinDate: string;
  branchId: string;
}

export interface GradingRecord {
  id: string;
  memberId: string;
  fromBelt: BeltRank;
  toBelt: BeltRank;
  date: string;
  trainerId: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'equipment' | 'apparel' | 'accessories' | 'supplements';
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  image?: string;
  supplierId?: string;
  branchId: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  outstanding: number;
}

export interface SaleItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card';
  memberId?: string;
  date: string;
  branchId: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'credit' | 'debit';
  category: 'sales' | 'membership' | 'rent' | 'salary' | 'utilities' | 'equipment' | 'marketing' | 'other';
  description: string;
  amount: number;
  reference?: string;
  branchId: string;
}

export interface Cheque {
  id: string;
  chequeNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'cleared' | 'bounced';
  partyName: string;
  type: 'receivable' | 'payable';
  branchId: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}

export type SessionStatus = 'scheduled' | 'completed' | 'canceled';

export interface ClassSessionStatus {
  id: string;
  classId: string;
  date: string;
  status: SessionStatus;
}

export interface AppState {
  currentUser: User | null;
  members: Member[];
  trainers: Trainer[];
  plans: MembershipPlan[];
  classes: ClassSession[];
  attendance: ClassAttendance[];
  classStatuses: ClassSessionStatus[];
  gradings: GradingRecord[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  sales: Sale[];
  ledger: LedgerEntry[];
  cheques: Cheque[];
  branches: Branch[];
  auditLogs: AuditLog[];
  cart: CartItem[];
  pettyCash: PettyCashEntry[];
}

export interface PettyCashEntry {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: 'office' | 'cleaning' | 'refreshments' | 'repairs' | 'maintenance' | 'other';
  branchId: string;
}
