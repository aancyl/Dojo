import { 
  Member, Trainer, MembershipPlan, ClassSession, InventoryItem, 
  Supplier, Sale, LedgerEntry, Cheque, Branch, User, GradingRecord, ClassAttendance, PettyCashEntry 
} from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to get date strings
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
const subtractDays = (date: Date, days: number) => addDays(date, -days);

export const mockBranches: Branch[] = [
  { id: 'branch-1', name: 'Downtown Dojo', address: '123 Main St, Central City', phone: '555-0100' },
  { id: 'branch-2', name: 'Westside Warriors', address: '456 West Ave, Metro', phone: '555-0200' },
];

export const mockUsers: User[] = [
  { id: 'user-owner', email: 'owner@dojo.com', name: 'Sensei Marcus Chen', role: 'owner', phone: '555-0001', createdAt: '2020-01-01' },
  { id: 'user-trainer', email: 'trainer@dojo.com', name: 'Coach Sarah Kim', role: 'trainer', phone: '555-0002', createdAt: '2021-03-15' },
  { id: 'user-desk', email: 'desk@dojo.com', name: 'Alex Rivera', role: 'desk', phone: '555-0003', createdAt: '2022-06-01' },
  { id: 'user-parent', email: 'parent@dojo.com', name: 'Jennifer Walsh', role: 'parent', phone: '555-0004', createdAt: '2023-01-10' },
];

export const mockPlans: MembershipPlan[] = [
  { id: 'plan-1', name: 'Starter', description: 'Perfect for beginners', price: 49, duration: 30, sessionsPerWeek: 2, features: ['2 classes/week', 'Basic equipment access', 'Locker usage'], isActive: true },
  { id: 'plan-2', name: 'Warrior', description: 'For dedicated practitioners', price: 89, duration: 30, sessionsPerWeek: 4, features: ['4 classes/week', 'Full equipment access', 'Sparring sessions', 'Locker usage'], isActive: true },
  { id: 'plan-3', name: 'Elite', description: 'Unlimited training', price: 149, duration: 30, sessionsPerWeek: 7, features: ['Unlimited classes', 'Private sessions', 'Competition prep', 'Premium gear discounts'], isActive: true },
  { id: 'plan-4', name: 'Annual Gold', description: 'Best value yearly', price: 999, duration: 365, sessionsPerWeek: 7, features: ['Unlimited classes', '2 free private sessions/month', 'Free grading fees', 'VIP events'], isActive: true },
];

export const mockTrainers: Trainer[] = [
  { id: 'trainer-1', name: 'Master Kenji Tanaka', email: 'kenji@dojo.com', phone: '555-1001', belt: 'black', skills: ['Karate', 'Judo', 'Self-Defense'], disciplineIds: ['karate', 'judo'], baseSalary: 3000, ratePerClass: 50, joinDate: '2019-01-15', branchId: 'branch-1' },
  { id: 'trainer-2', name: 'Coach Lisa Zhang', email: 'lisa@dojo.com', phone: '555-1002', belt: 'black', skills: ['Taekwondo', 'Kickboxing', 'Cardio'], disciplineIds: ['taekwondo', 'kickboxing'], baseSalary: 2500, ratePerClass: 45, joinDate: '2020-06-01', branchId: 'branch-1' },
  { id: 'trainer-3', name: 'Instructor David Park', email: 'david@dojo.com', phone: '555-1003', belt: 'brown', skills: ['BJJ', 'MMA', 'Wrestling'], disciplineIds: ['bjj', 'mma', 'wrestling'], baseSalary: 2200, ratePerClass: 40, joinDate: '2021-03-20', branchId: 'branch-2' },
  { id: 'trainer-4', name: 'Sensei Maya Rodriguez', email: 'maya@dojo.com', phone: '555-1004', belt: 'black', skills: ['Aikido', 'Kids Classes', 'Meditation'], disciplineIds: ['aikido'], baseSalary: 2800, ratePerClass: 48, joinDate: '2020-09-10', branchId: 'branch-2' },
];

export const mockMembers: Member[] = [
  { id: 'mem-1', name: 'James Wilson', email: 'james@email.com', phone: '555-2001', belt: 'blue', disciplineId: 'bjj', planId: 'plan-3', joinDate: '2022-03-01', expiryDate: formatDate(addDays(today, 15)), status: 'active', branchId: 'branch-1' },
  { id: 'mem-2', name: 'Emma Thompson', email: 'emma@email.com', phone: '555-2002', belt: 'Intermediate', disciplineId: 'kickboxing', planId: 'plan-2', joinDate: '2022-06-15', expiryDate: formatDate(addDays(today, 8)), status: 'active', branchId: 'branch-1' },
  { id: 'mem-3', name: 'Michael Chen', email: 'michael@email.com', phone: '555-2003', belt: 'black', disciplineId: 'karate', planId: 'plan-3', joinDate: '2021-09-01', expiryDate: formatDate(addDays(today, 22)), status: 'active', branchId: 'branch-1' },
  { id: 'mem-4', name: 'Sofia Garcia', email: 'sofia@email.com', phone: '555-2004', belt: 'yellow', disciplineId: 'taekwondo', planId: 'plan-1', joinDate: '2023-01-10', expiryDate: formatDate(addDays(today, -5)), status: 'expired', branchId: 'branch-1' },
  { id: 'mem-5', name: 'Daniel Kim', email: 'daniel@email.com', phone: '555-2005', belt: 'brown', disciplineId: 'bjj', planId: 'plan-4', joinDate: '2020-05-20', expiryDate: formatDate(addDays(today, 120)), status: 'active', branchId: 'branch-1' },
  { id: 'mem-6', name: 'Olivia Martinez', email: 'olivia@email.com', phone: '555-2006', belt: 'white', disciplineId: 'karate', planId: 'plan-1', joinDate: '2023-11-01', expiryDate: formatDate(addDays(today, 5)), status: 'active', branchId: 'branch-2' },
];


export const mockClasses: ClassSession[] = [
  { id: 'class-1', name: 'Beginner Karate', disciplineId: 'karate', trainerId: 'trainer-1', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', maxCapacity: 20, beltMin: 'white', beltMax: 'yellow', branchId: 'branch-1' },
  { id: 'class-2', name: 'Advanced Sparring', disciplineId: 'karate', trainerId: 'trainer-1', dayOfWeek: 1, startTime: '18:00', endTime: '19:30', maxCapacity: 15, beltMin: 'green', beltMax: 'black', branchId: 'branch-1' },
  { id: 'class-3', name: 'Kids Kickboxing', disciplineId: 'kickboxing', trainerId: 'trainer-2', dayOfWeek: 2, startTime: '16:00', endTime: '17:00', maxCapacity: 25, beltMin: 'Beginner', beltMax: 'Advanced', branchId: 'branch-1' },
  { id: 'class-4', name: 'BJJ Fundamentals', disciplineId: 'bjj', trainerId: 'trainer-3', dayOfWeek: 2, startTime: '19:00', endTime: '20:30', maxCapacity: 18, beltMin: 'white', beltMax: 'blue', branchId: 'branch-2' },
  { id: 'class-5', name: 'Morning Cardio Kick', disciplineId: 'kickboxing', trainerId: 'trainer-2', dayOfWeek: 3, startTime: '06:30', endTime: '07:30', maxCapacity: 30, beltMin: 'Beginner', beltMax: 'Professional', branchId: 'branch-1' },
  { id: 'class-6', name: 'Self-Defense', disciplineId: 'mma', trainerId: 'trainer-4', dayOfWeek: 3, startTime: '18:00', endTime: '19:00', maxCapacity: 20, beltMin: 'Amateur', beltMax: 'Champion', branchId: 'branch-2' },
  { id: 'class-7', name: 'Competition Prep', disciplineId: 'karate', trainerId: 'trainer-1', dayOfWeek: 4, startTime: '17:00', endTime: '19:00', maxCapacity: 12, beltMin: 'blue', beltMax: 'black', branchId: 'branch-1' },
  { id: 'class-8', name: 'Aikido Flow', disciplineId: 'aikido', trainerId: 'trainer-4', dayOfWeek: 5, startTime: '10:00', endTime: '11:30', maxCapacity: 16, beltMin: 'white', beltMax: 'black', branchId: 'branch-2' },
  { id: 'class-9', name: 'Weekend Warriors', disciplineId: 'mma', trainerId: 'trainer-3', dayOfWeek: 6, startTime: '09:00', endTime: '11:00', maxCapacity: 25, beltMin: 'Amateur', beltMax: 'Champion', branchId: 'branch-1' },
  { id: 'class-10', name: 'Open Mat', disciplineId: 'bjj', trainerId: 'trainer-1', dayOfWeek: 0, startTime: '14:00', endTime: '16:00', maxCapacity: 30, beltMin: 'white', beltMax: 'black', branchId: 'branch-1' },
];

export const mockInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Training Gloves', category: 'equipment', sku: 'GLV-001', price: 45, cost: 22, stock: 24, minStock: 10, branchId: 'branch-1' },
  { id: 'inv-2', name: 'White Gi (Uniform)', category: 'apparel', sku: 'GI-W-001', price: 89, cost: 40, stock: 18, minStock: 8, branchId: 'branch-1' },
  { id: 'inv-3', name: 'Black Belt', category: 'accessories', sku: 'BLT-BLK', price: 35, cost: 12, stock: 8, minStock: 5, branchId: 'branch-1' },
  { id: 'inv-4', name: 'Sparring Headgear', category: 'equipment', sku: 'HG-001', price: 65, cost: 30, stock: 12, minStock: 6, branchId: 'branch-1' },
  { id: 'inv-5', name: 'Focus Mitts (Pair)', category: 'equipment', sku: 'FM-001', price: 55, cost: 25, stock: 15, minStock: 5, branchId: 'branch-1' },
  { id: 'inv-6', name: 'Protein Powder', category: 'supplements', sku: 'SUP-PRO', price: 49, cost: 28, stock: 20, minStock: 10, branchId: 'branch-1' },
  { id: 'inv-7', name: 'Mouth Guard', category: 'accessories', sku: 'MG-001', price: 15, cost: 5, stock: 3, minStock: 15, branchId: 'branch-1' }, // Low stock
  { id: 'inv-8', name: 'Shin Guards', category: 'equipment', sku: 'SG-001', price: 40, cost: 18, stock: 2, minStock: 8, branchId: 'branch-2' }, // Critical stock
  { id: 'inv-9', name: 'Training T-Shirt', category: 'apparel', sku: 'TS-001', price: 25, cost: 10, stock: 35, minStock: 15, branchId: 'branch-1' },
  { id: 'inv-10', name: 'Water Bottle', category: 'accessories', sku: 'WB-001', price: 12, cost: 4, stock: 50, minStock: 20, branchId: 'branch-1' },
];

export const mockSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Dragon Equipment Co.', email: 'orders@dragonequip.com', phone: '555-3001', address: '789 Industrial Blvd', outstanding: 1250 },
  { id: 'sup-2', name: 'Warrior Apparel Ltd.', email: 'sales@warriorapparel.com', phone: '555-3002', address: '321 Fashion Ave', outstanding: 0 },
  { id: 'sup-3', name: 'FitSupplements Inc.', email: 'bulk@fitsupps.com', phone: '555-3003', address: '555 Health Way', outstanding: 480 },
];

// Generate recent sales
export const mockSales: Sale[] = [
  { id: 'sale-1', items: [{ itemId: 'inv-1', name: 'Training Gloves', quantity: 2, price: 45 }], total: 90, paymentMethod: 'card', memberId: 'mem-1', date: formatDate(today), branchId: 'branch-1' },
  { id: 'sale-2', items: [{ itemId: 'inv-2', name: 'White Gi (Uniform)', quantity: 1, price: 89 }], total: 89, paymentMethod: 'cash', memberId: 'mem-6', date: formatDate(today), branchId: 'branch-1' },
  { id: 'sale-3', items: [{ itemId: 'inv-6', name: 'Protein Powder', quantity: 1, price: 49 }, { itemId: 'inv-10', name: 'Water Bottle', quantity: 2, price: 12 }], total: 73, paymentMethod: 'cash', date: formatDate(subtractDays(today, 1)), branchId: 'branch-1' },
  { id: 'sale-4', items: [{ itemId: 'inv-9', name: 'Training T-Shirt', quantity: 3, price: 25 }], total: 75, paymentMethod: 'card', memberId: 'mem-3', date: formatDate(subtractDays(today, 1)), branchId: 'branch-1' },
  { id: 'sale-5', items: [{ itemId: 'inv-4', name: 'Sparring Headgear', quantity: 1, price: 65 }], total: 65, paymentMethod: 'cash', memberId: 'mem-11', date: formatDate(subtractDays(today, 2)), branchId: 'branch-1' },
  { id: 'sale-6', items: [{ itemId: 'inv-1', name: 'Training Gloves', quantity: 1, price: 45 }], total: 45, paymentMethod: 'card', memberId: 'mem-15', date: formatDate(subtractDays(today, 3)), branchId: 'branch-2' },
  { id: 'sale-7', items: [{ itemId: 'inv-10', name: 'Water Bottle', quantity: 5, price: 12 }], total: 60, paymentMethod: 'cash', date: formatDate(subtractDays(today, 4)), branchId: 'branch-1' },
];

// Generate ledger entries (income + expenses)
export const mockLedger: LedgerEntry[] = [
  // Income
  { id: 'led-1', date: formatDate(today), type: 'credit', category: 'sales', description: 'POS Sale #sale-1', amount: 90, reference: 'sale-1', branchId: 'branch-1' },
  { id: 'led-2', date: formatDate(today), type: 'credit', category: 'sales', description: 'POS Sale #sale-2', amount: 89, reference: 'sale-2', branchId: 'branch-1' },
  { id: 'led-3', date: formatDate(today), type: 'credit', category: 'membership', description: 'Elite Plan - James Wilson', amount: 149, reference: 'mem-1', branchId: 'branch-1' },
  { id: 'led-4', date: formatDate(subtractDays(today, 1)), type: 'credit', category: 'sales', description: 'POS Sale #sale-3', amount: 73, reference: 'sale-3', branchId: 'branch-1' },
  { id: 'led-5', date: formatDate(subtractDays(today, 1)), type: 'credit', category: 'membership', description: 'Warrior Plan - Ethan Brown', amount: 89, reference: 'mem-7', branchId: 'branch-2' },
  { id: 'led-6', date: formatDate(subtractDays(today, 2)), type: 'credit', category: 'membership', description: 'Elite Plan - Michael Chen', amount: 149, reference: 'mem-3', branchId: 'branch-1' },
  { id: 'led-7', date: formatDate(subtractDays(today, 3)), type: 'credit', category: 'sales', description: 'Walk-in equipment sale', amount: 120, branchId: 'branch-1' },
  { id: 'led-8', date: formatDate(subtractDays(today, 5)), type: 'credit', category: 'membership', description: 'Annual Gold - Daniel Kim', amount: 999, reference: 'mem-5', branchId: 'branch-1' },
  { id: 'led-15', date: formatDate(subtractDays(today, 6)), type: 'credit', category: 'membership', description: 'Starter Plan - Amelia Clark', amount: 49, reference: 'mem-16', branchId: 'branch-2' },
  { id: 'led-16', date: formatDate(subtractDays(today, 7)), type: 'credit', category: 'membership', description: 'Warrior Plan - Charlotte Wilson', amount: 89, reference: 'mem-14', branchId: 'branch-1' },
  { id: 'led-17', date: formatDate(subtractDays(today, 8)), type: 'credit', category: 'sales', description: 'POS Sale #sale-6', amount: 45, reference: 'sale-6', branchId: 'branch-2' },
  
  // Expenses
  { id: 'led-9', date: formatDate(subtractDays(today, 1)), type: 'debit', category: 'rent', description: 'Monthly Rent - Downtown', amount: 2500, branchId: 'branch-1' },
  { id: 'led-10', date: formatDate(subtractDays(today, 2)), type: 'debit', category: 'utilities', description: 'Electricity Bill', amount: 320, branchId: 'branch-1' },
  { id: 'led-11', date: formatDate(subtractDays(today, 5)), type: 'debit', category: 'salary', description: 'Trainer Payroll - Week 1', amount: 1800, branchId: 'branch-1' },
  { id: 'led-12', date: formatDate(subtractDays(today, 7)), type: 'debit', category: 'equipment', description: 'New punching bags', amount: 450, branchId: 'branch-1' },
  { id: 'led-13', date: formatDate(subtractDays(today, 10)), type: 'debit', category: 'marketing', description: 'Facebook Ads', amount: 200, branchId: 'branch-1' },
  { id: 'led-14', date: formatDate(subtractDays(today, 12)), type: 'debit', category: 'rent', description: 'Monthly Rent - Westside', amount: 1800, branchId: 'branch-2' },
  { id: 'led-18', date: formatDate(subtractDays(today, 14)), type: 'debit', category: 'utilities', description: 'Water Bill', amount: 150, branchId: 'branch-1' },
  { id: 'led-19', date: formatDate(subtractDays(today, 15)), type: 'debit', category: 'maintenance', description: 'AC Servicing', amount: 280, branchId: 'branch-2' },
  { id: 'led-20', date: formatDate(subtractDays(today, 18)), type: 'debit', category: 'supplies', description: 'First Aid Kit Restock', amount: 120, branchId: 'branch-1' },
];

export const mockCheques: Cheque[] = [
  { id: 'chq-1', chequeNumber: 'CHQ-001234', amount: 500, issueDate: formatDate(subtractDays(today, 10)), dueDate: formatDate(addDays(today, 5)), status: 'pending', partyName: 'Corporate Membership - ABC Corp', type: 'receivable', branchId: 'branch-1' },
  { id: 'chq-2', chequeNumber: 'CHQ-001235', amount: 1250, issueDate: formatDate(subtractDays(today, 15)), dueDate: formatDate(subtractDays(today, 2)), status: 'cleared', partyName: 'Dragon Equipment Co.', type: 'payable', branchId: 'branch-1' },
  { id: 'chq-3', chequeNumber: 'CHQ-001236', amount: 300, issueDate: formatDate(subtractDays(today, 5)), dueDate: formatDate(addDays(today, 10)), status: 'pending', partyName: 'Annual Plan - Smith Family', type: 'receivable', branchId: 'branch-1' },
  { id: 'chq-4', chequeNumber: 'CHQ-001237', amount: 200, issueDate: formatDate(subtractDays(today, 2)), dueDate: formatDate(addDays(today, 15)), status: 'pending', partyName: 'Event Sponsorship', type: 'receivable', branchId: 'branch-2' },
];

export const mockGradings: GradingRecord[] = [
  { id: 'grad-1', memberId: 'mem-1', fromBelt: 'green', toBelt: 'blue', date: formatDate(subtractDays(today, 30)), trainerId: 'trainer-1', notes: 'Excellent kata performance' },
  { id: 'grad-2', memberId: 'mem-3', fromBelt: 'blue', toBelt: 'purple', date: formatDate(subtractDays(today, 60)), trainerId: 'trainer-1', notes: 'Outstanding sparring skills' },
  { id: 'grad-3', memberId: 'mem-5', fromBelt: 'purple', toBelt: 'brown', date: formatDate(subtractDays(today, 90)), trainerId: 'trainer-1', notes: 'Ready for advanced training' },
  { id: 'grad-4', memberId: 'mem-10', fromBelt: 'brown', toBelt: 'red', date: formatDate(subtractDays(today, 45)), trainerId: 'trainer-4', notes: 'Demonstrated leadership qualities' },
  { id: 'grad-5', memberId: 'mem-7', fromBelt: 'yellow', toBelt: 'orange', date: formatDate(subtractDays(today, 15)), trainerId: 'trainer-3', notes: 'Great improvement in kicks' },
];

export const mockAttendance: ClassAttendance[] = [
  { id: 'att-1', classId: 'class-1', memberId: 'mem-1', date: formatDate(today), checkedIn: true, checkInTime: '08:55' },
  { id: 'att-2', classId: 'class-1', memberId: 'mem-6', date: formatDate(today), checkedIn: true, checkInTime: '08:58' },
  { id: 'att-3', classId: 'class-2', memberId: 'mem-3', date: formatDate(subtractDays(today, 1)), checkedIn: true, checkInTime: '17:50' },
  { id: 'att-4', classId: 'class-2', memberId: 'mem-5', date: formatDate(subtractDays(today, 1)), checkedIn: true, checkInTime: '17:55' },
  { id: 'att-5', classId: 'class-3', memberId: 'mem-9', date: formatDate(subtractDays(today, 2)), checkedIn: true, checkInTime: '15:58' },
  { id: 'att-6', classId: 'class-4', memberId: 'mem-15', date: formatDate(subtractDays(today, 1)), checkedIn: true, checkInTime: '18:55' },
  { id: 'att-7', classId: 'class-5', memberId: 'mem-2', date: formatDate(subtractDays(today, 2)), checkedIn: true, checkInTime: '06:28' },
];

export const mockPettyCash: PettyCashEntry[] = [
  { id: 'pc-1', date: formatDate(subtractDays(today, 1)), amount: 25, description: 'Cleaning supplies', category: 'cleaning', branchId: 'branch-1' },
  { id: 'pc-2', date: formatDate(subtractDays(today, 2)), amount: 15, description: 'Coffee and milk', category: 'refreshments', branchId: 'branch-1' },
  { id: 'pc-3', date: formatDate(subtractDays(today, 3)), amount: 45, description: 'Door handle repair', category: 'repairs', branchId: 'branch-1' },
  { id: 'pc-4', date: formatDate(subtractDays(today, 5)), amount: 10, description: 'Printer paper', category: 'office', branchId: 'branch-1' },
  { id: 'pc-5', date: formatDate(subtractDays(today, 6)), amount: 30, description: 'New mop and bucket', category: 'cleaning', branchId: 'branch-2' },
  { id: 'pc-6', date: formatDate(subtractDays(today, 7)), amount: 20, description: 'Light bulbs', category: 'maintenance', branchId: 'branch-1' },
  { id: 'pc-7', date: formatDate(subtractDays(today, 8)), amount: 12, description: 'Stapler and staples', category: 'office', branchId: 'branch-1' },
  { id: 'pc-8', date: formatDate(subtractDays(today, 10)), amount: 50, description: 'Window cleaning', category: 'cleaning', branchId: 'branch-1' },
  { id: 'pc-9', date: formatDate(subtractDays(today, 12)), amount: 18, description: 'Internet cable', category: 'office', branchId: 'branch-2' },
  { id: 'pc-10', date: formatDate(subtractDays(today, 14)), amount: 22, description: 'Hand sanitizer', category: 'cleaning', branchId: 'branch-1' },
  { id: 'pc-11', date: formatDate(subtractDays(today, 15)), amount: 15, description: 'Envelopes', category: 'office', branchId: 'branch-1' },
  { id: 'pc-12', date: formatDate(subtractDays(today, 16)), amount: 40, description: 'Gym mat cleaner', category: 'cleaning', branchId: 'branch-1' },
  { id: 'pc-13', date: formatDate(subtractDays(today, 18)), amount: 25, description: 'Taxi for trainer', category: 'other', branchId: 'branch-1' },
  { id: 'pc-14', date: formatDate(subtractDays(today, 20)), amount: 35, description: 'Sink plumbing repair', category: 'repairs', branchId: 'branch-1' },
  { id: 'pc-15', date: formatDate(subtractDays(today, 0)), amount: 15, description: 'Fresh flowers for reception', category: 'office', branchId: 'branch-1' },
  { id: 'pc-16', date: formatDate(subtractDays(today, 1)), amount: 20, description: 'Drinking water refill', category: 'refreshments', branchId: 'branch-1' },
  { id: 'pc-17', date: formatDate(subtractDays(today, 2)), amount: 55, description: 'Broken window pane repair', category: 'repairs', branchId: 'branch-2' },
];

export const STORAGE_KEY = 'dojo-management-data';

export const getInitialData = () => ({
  members: mockMembers,
  trainers: mockTrainers,
  plans: mockPlans,
  classes: mockClasses,
  inventory: mockInventory,
  suppliers: mockSuppliers,
  sales: mockSales,
  ledger: mockLedger,
  cheques: mockCheques,
  branches: mockBranches,
  gradings: mockGradings,
    attendance: mockAttendance,
    classStatuses: [],
    pettyCash: mockPettyCash,
  auditLogs: [],
  cart: [],
});
