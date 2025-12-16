export enum SaccoName {
  SUPER_METRO = 'Super Metro',
  LOPHA = 'Lopha Travels',
  EMBASSAVA = 'Embassava',
  NICO = 'Nico Movers',
  KMO = 'KMO Shuttles'
}

export interface Coordinates {
  lat: number;
  lng: number;
  label: string;
}

export interface Route {
  id: string;
  name: string;
  stops: Coordinates[];
  color: string;
}

export interface Seat {
  id: string; // e.g., "1A", "1B"
  isBooked: boolean;
  isSelected?: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  sacco: SaccoName;
  routeId: string;
  currentStopIndex: number; // For simulation
  progress: number; // 0 to 100 percentage between current stop and next
  capacity: number;
  seats: Seat[];
  type: 'Bus' | 'MiniBus' | 'Van';
  etaMinutes: number;
  speed: number; // simulation speed
}

export interface UserBooking {
  id: string;
  vehicleId: string;
  sacco: SaccoName;
  seatId: string;
  price: number;
  timestamp: number;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}

export interface TripPlan {
  origin: string;
  destination: string;
  estimatedTime: string;
  suggestedRouteIds: string[];
  summary: string;
}

export type ViewState = 'HOME' | 'ROUTE_MAP';
