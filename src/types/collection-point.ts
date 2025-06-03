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
  address: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  phone: string;
  email: string;
  url?: string;
  isHeadquarters: boolean;
  isRepairPoint: boolean;
  location: Location;
  schedule: Schedule;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionPointFormData extends Omit<CollectionPoint, 'id' | 'createdAt' | 'updatedAt'> {} 