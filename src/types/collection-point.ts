export interface Schedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: boolean;
  start: string;
  end: string;
}

export interface Location {
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  address: string;
}

export interface CollectionPoint {
  id: number;
  nombre: string;
  phone: string | null;
  email: string | null;
  url?: string | null;
  isHeadquarters: boolean;
  isRepairPoint: boolean;
  location: Location;
  schedule: Schedule;
  parentId?: number | null;
  parent?: {
    id: number;
    nombre: string;
  };
  children?: CollectionPoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionPointFormData extends Omit<CollectionPoint, 'id' | 'createdAt' | 'updatedAt'> {} 