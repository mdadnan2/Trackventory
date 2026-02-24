export interface User {
  _id: string;
  firebaseUid?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'VOLUNTEER';
  status: 'ACTIVE' | 'BLOCKED';
  isOnboarded: boolean;
  createdAt: string;
}

export interface Item {
  _id: string;
  name: string;
  category: string;
  unit: string;
  isActive: boolean;
  createdAt: string;
}

export interface Package {
  _id: string;
  name: string;
  description?: string;
  items: Array<{ 
    itemId: string | Item; 
    quantity: number;
    _id?: string;
  }>;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageStockSummary {
  packageId: string;
  packageName: string;
  maxPackages: number;
  items: Array<{
    itemId: string;
    itemName: string;
    quantityPerPackage: number;
    possiblePackages: number;
  }>;
}

export interface City {
  _id: string;
  name: string;
  createdAt: string;
}

export interface Campaign {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface Distribution {
  _id: string;
  volunteerId: string;
  state: string;
  city: string;
  pinCode: string;
  area: string;
  campaignId?: string;
  items: Array<{ itemId: string; quantity: number }>;
  requestId: string;
  createdAt: string;
}

export interface StockItem {
  itemId: string;
  item: Item;
  stock: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
  };
}
