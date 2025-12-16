import { Route, SaccoName, Vehicle } from './types';

// Real Nairobi Coordinates
export const NAIROBI_ROUTES: Route[] = [
  {
    id: 'route-thika-rd',
    name: 'Thika Road (Juja - CBD)',
    color: '#3b82f6', // Blue
    stops: [
      { lat: -1.102554, lng: 37.013193, label: 'Juja (JKUAT)' },
      { lat: -1.180496, lng: 36.937229, label: 'Kenyatta Univ (KU)' },
      { lat: -1.218653, lng: 36.887270, label: 'Roysambu' },
      { lat: -1.233824, lng: 36.873260, label: 'Allsops' },
      { lat: -1.258525, lng: 36.845860, label: 'Survey' },
      { lat: -1.272183, lng: 36.832960, label: 'Ngara' },
      { lat: -1.286389, lng: 36.817223, label: 'CBD Archives' },
    ]
  },
  {
    id: 'route-waiyaki',
    name: 'Waiyaki Way (Kikuyu - CBD)',
    color: '#ef4444', // Red
    stops: [
      { lat: -1.246476, lng: 36.663185, label: 'Kikuyu' },
      { lat: -1.255959, lng: 36.723048, label: 'Uthiru' },
      { lat: -1.261944, lng: 36.748372, label: 'Kangemi' },
      { lat: -1.267824, lng: 36.807865, label: 'Westlands' },
      { lat: -1.277322, lng: 36.815340, label: 'Museum Hill' },
      { lat: -1.282928, lng: 36.822760, label: 'CBD Odeon' },
    ]
  },
  {
    id: 'route-jogoo',
    name: 'Jogoo Road (Donholm - CBD)',
    color: '#10b981', // Emerald
    stops: [
      { lat: -1.294676, lng: 36.872472, label: 'Donholm' },
      { lat: -1.296836, lng: 36.852562, label: 'Makadara' },
      { lat: -1.293318, lng: 36.840422, label: 'City Stadium' },
      { lat: -1.287114, lng: 36.828695, label: 'CBD Bus Station' },
    ]
  },
  {
    id: 'route-langata',
    name: 'Langata Road (Karen - CBD)',
    color: '#f59e0b', // Amber
    stops: [
      { lat: -1.324637, lng: 36.705144, label: 'Karen' },
      { lat: -1.345862, lng: 36.764585, label: 'Galleria' },
      { lat: -1.327598, lng: 36.804828, label: 'Wilson Airport' },
      { lat: -1.309440, lng: 36.812356, label: 'Strathmore Univ' },
      { lat: -1.291778, lng: 36.826505, label: 'CBD Railways' },
    ]
  }
];

const generateSeats = (capacity: number) => {
  return Array.from({ length: capacity }, (_, i) => ({
    id: `${Math.floor(i / 4) + 1}${['A', 'B', 'C', 'D'][i % 4]}`,
    isBooked: Math.random() > 0.7 // 30% random occupancy
  }));
};

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    plateNumber: 'KCC 123A',
    sacco: SaccoName.SUPER_METRO,
    routeId: 'route-thika-rd',
    currentStopIndex: 1,
    progress: 10,
    capacity: 33,
    seats: generateSeats(33),
    type: 'Bus',
    etaMinutes: 5,
    speed: 0.5
  },
  {
    id: 'v2',
    plateNumber: 'KDA 456B',
    sacco: SaccoName.SUPER_METRO,
    routeId: 'route-thika-rd',
    currentStopIndex: 3,
    progress: 50,
    capacity: 33,
    seats: generateSeats(33),
    type: 'Bus',
    etaMinutes: 15,
    speed: 0.6
  },
  {
    id: 'v3',
    plateNumber: 'KDE 789C',
    sacco: SaccoName.LOPHA,
    routeId: 'route-thika-rd',
    currentStopIndex: 4,
    progress: 80,
    capacity: 14,
    seats: generateSeats(14),
    type: 'MiniBus',
    etaMinutes: 25,
    speed: 0.8
  },
  {
    id: 'v4',
    plateNumber: 'KBZ 101X',
    sacco: SaccoName.LOPHA,
    routeId: 'route-waiyaki',
    currentStopIndex: 1,
    progress: 20,
    capacity: 14,
    seats: generateSeats(14),
    type: 'MiniBus',
    etaMinutes: 8,
    speed: 0.7
  },
  {
    id: 'v5',
    plateNumber: 'KCY 202Y',
    sacco: SaccoName.NICO,
    routeId: 'route-waiyaki',
    currentStopIndex: 2,
    progress: 60,
    capacity: 33,
    seats: generateSeats(33),
    type: 'Bus',
    etaMinutes: 18,
    speed: 0.5
  },
  {
    id: 'v6',
    plateNumber: 'KCA 303Z',
    sacco: SaccoName.EMBASSAVA,
    routeId: 'route-jogoo',
    currentStopIndex: 1,
    progress: 30,
    capacity: 33,
    seats: generateSeats(33),
    type: 'Bus',
    etaMinutes: 3,
    speed: 0.6
  },
  {
    id: 'v7',
    plateNumber: 'KDG 404L',
    sacco: SaccoName.KMO,
    routeId: 'route-langata',
    currentStopIndex: 3,
    progress: 10,
    capacity: 14,
    seats: generateSeats(14),
    type: 'MiniBus',
    etaMinutes: 12,
    speed: 0.7
  },
  {
    id: 'v8',
    plateNumber: 'KBB 505M',
    sacco: SaccoName.SUPER_METRO,
    routeId: 'route-langata',
    currentStopIndex: 2,
    progress: 70,
    capacity: 33,
    seats: generateSeats(33),
    type: 'Bus',
    etaMinutes: 7,
    speed: 0.5
  }
];

export const SACCO_INFO = {
  [SaccoName.SUPER_METRO]: {
    color: '#1e40af', // Blue 800
    description: 'Reliable, clean, and disciplined.',
    pricePerKm: 5,
    logo: 'S'
  },
  [SaccoName.LOPHA]: {
    color: '#166534', // Green 800
    description: 'Fast connection for Waiyaki & Thika Rd.',
    pricePerKm: 4,
    logo: 'L'
  },
  [SaccoName.EMBASSAVA]: {
    color: '#991b1b', // Red 800
    description: 'Serving the Eastlands community.',
    pricePerKm: 3,
    logo: 'E'
  },
  [SaccoName.NICO]: {
    color: '#6b21a8', // Purple 800
    description: 'Comfortable cross-town travels.',
    pricePerKm: 4.5,
    logo: 'N'
  },
  [SaccoName.KMO]: {
    color: '#b45309', // Yellow 700 (darker for map)
    description: 'Serving Langata and Ngong routes.',
    pricePerKm: 4,
    logo: 'K'
  }
};
