export type UserRole = 'admin' | 'operator' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collectionPointId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  collectionPointId: string;
  password?: string;
}

export interface UserWithCollectionPoint extends User {
  collectionPoint: {
    id: string;
    name: string;
    isRepairPoint: boolean;
  };
} 