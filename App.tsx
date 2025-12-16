import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import L from 'leaflet';
import { 
  Map as MapIcon, 
  List, 
  Settings, 
  Clock,
  Users,
  X,
  Navigation
} from 'lucide-react';
import { INITIAL_VEHICLES, SACCO_INFO, NAIROBI_ROUTES } from './constants';
import { Vehicle, UserBooking, TripPlan } from './types';
import { RouteMap } from './components/RouteMap';
import { BookingModal } from './components/BookingModal';
import { GeminiAssistant } from './components/GeminiAssistant';
import { TripPlanner } from './components/TripPlanner';
import { getTripPlan } from './services/geminiService';
import { geocodeLocation, getRoadPath } from './services/mapService';

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
    
    {/* Sidebar Desktop */}
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 p-6 bg-slate-900 z-20">
      <div className="flex items-center gap-2 mb-8 text-2xl font-bold tracking-tighter">
        <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-black font-bold">M</div>
        <span>MatatuLive</span>
      </div>
      
      <nav className="space-y-2 flex-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 bg-slate-800 text-white rounded-xl transition-colors ring-1 ring-slate-700">
          <MapIcon className="w-5 h-5" /> Live Map
        </Link>
        <Link to="/list" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
          <List className="w-5 h-5" /> Vehicles
        </Link>
        <div className="pt-4 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">My Account</div>
        <Link to="/bookings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
          <Clock className="w-5 h-5" /> Bookings
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-bold">User Settings</p>
            <p className="text-xs text-slate-500">v1.1.0 Beta</p>
          </div>
        </div>
      </div>
    </aside>

    {/* Mobile Header */}
    <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-40 shadow-lg">
      <div className="flex items-center gap-2 text-xl font-bold">
        <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-black">M</div>
        <span>MatatuLive</span>
      </div>
      <button className="p-2 bg-slate-800 rounded-lg">
        <List className="w-6 h-6" />
      </button>
    </div>

    {/* Main Content */}
    <main className="flex-1 overflow-hidden relative flex flex-col">
      <div className="flex-1 relative">
        {children}
      </div>
    </main>

    {/* Mobile Bottom Nav */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around z-50 pb-safe">
      <Link to="/" className="flex flex-col items-center gap-1 text-yellow-500">
        <MapIcon className="w-6 h-6" />
        <span className="text-[10px] font-bold">Map</span>
      </Link>
      <Link to="/list" className="flex flex-col items-center gap-1 text-slate-500">
        <List className="w-6 h-6" />
        <span className="text-[10px] font-bold">List</span>
      </Link>
      <Link to="/bookings" className="flex flex-col items-center gap-1 text-slate-500">
        <Clock className="w-6 h-6" />
        <span className="text-[10px] font-bold">Trips</span>
      </Link>
    </div>
  </div>
);

// Map Page
const MapPage: React.FC<{ 
  vehicles: Vehicle[], 
  onVehicleClick: (v: Vehicle) => void 
}> = ({ vehicles, onVehicleClick }) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [tripStart, setTripStart] = useState<{lat: number, lng: number} | null>(null);
  const [tripEnd, setTripEnd] = useState<{lat: number, lng: number} | null>(null);
  const [tripPath, setTripPath] = useState<L.LatLngTuple[]>([]);

  const handlePlanTrip = async (origin: string, destination: string) => {
    setIsPlanning(true);
    setTripPath([]); // Clear previous path

    // 1. Geocode locations (Real API Call)
    const startLocation = await geocodeLocation(origin);
    const endLocation = await geocodeLocation(destination);

    if (!startLocation || !endLocation) {
       alert("Could not find one of those locations. Please try a specific Nairobi landmark.");
       setIsPlanning(false);
       return;
    }

    setTripStart(startLocation);
    setTripEnd(endLocation);

    // 2. Fetch the actual driving path between user points (Real API Call)
    const realPath = await getRoadPath(startLocation, endLocation);
    setTripPath(realPath);

    // 3. Ask AI for context/advice
    const plan = await getTripPlan(origin, destination);
    
    setTripPlan({
      origin: startLocation.name,
      destination: endLocation.name,
      estimatedTime: 'Calculating...', // In a real app, OSRM returns duration
      suggestedRouteIds: plan.routes,
      summary: plan.summary
    });

    setIsPlanning(false);
  };

  const clearTrip = () => {
    setTripPlan(null);
    setTripStart(null);
    setTripEnd(null);
    setTripPath([]);
  }

  return (
    <div className="relative w-full h-full bg-[#0f172a]">
      {/* Search Overlay */}
      <TripPlanner onPlanTrip={handlePlanTrip} isLoading={isPlanning} />

      {/* Trip Results Overlay */}
      {tripPlan && (
        <div className="absolute top-4 left-4 md:left-[400px] right-4 z-20 animate-in fade-in slide-in-from-top-4">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold border border-green-500/30">Trip Route</span>
                <span className="text-slate-400 text-xs">Route Found</span>
              </div>
              <p className="text-white text-sm font-medium">{tripPlan.summary}</p>
            </div>
            <button onClick={clearTrip} className="p-1 hover:bg-slate-700 rounded-full">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Sacco Filter (Floating Bottom) */}
      <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-10 w-[90%] md:w-auto">
         <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700 flex gap-2 overflow-x-auto shadow-xl scrollbar-hide">
            <button 
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-lg scale-105' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            >
              All
            </button>
            {Object.entries(SACCO_INFO).map(([key, info]) => (
              <button 
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === key ? `bg-white text-black shadow-lg scale-105` : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                style={activeFilter === key ? { color: info.color, borderColor: info.color } : {}}
              >
                {key}
              </button>
            ))}
         </div>
      </div>

      <RouteMap 
        vehicles={activeFilter === 'ALL' ? vehicles : vehicles.filter(v => v.sacco === activeFilter)} 
        onVehicleClick={onVehicleClick}
        selectedRouteId={null}
        highlightedRouteIds={tripPlan?.suggestedRouteIds}
        tripStart={tripStart}
        tripEnd={tripEnd}
        tripPath={tripPath}
      />
    </div>
  );
};

// List Page
const ListPage: React.FC<{ vehicles: Vehicle[], onBook: (v: Vehicle) => void }> = ({ vehicles, onBook }) => {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Departing Soon</h1>
        <p className="text-slate-400">Available vehicles near your location.</p>
      </div>

      <div className="space-y-4 pb-20">
        {vehicles.sort((a,b) => a.etaMinutes - b.etaMinutes).map(vehicle => {
           const sacco = SACCO_INFO[vehicle.sacco];
           const route = NAIROBI_ROUTES.find(r => r.id === vehicle.routeId);
           const seatsAvailable = vehicle.seats.filter(s => !s.isBooked).length;

           return (
             <div key={vehicle.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 hover:border-slate-600 transition-all group">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl font-bold text-white shadow-lg border border-slate-700" style={{ color: sacco.color }}>
                     {sacco.logo}
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors">{vehicle.sacco}</h3>
                     <p className="text-slate-400 text-sm flex items-center gap-1">
                       <Navigation className="w-3 h-3" /> {route?.name}
                     </p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-2xl font-mono font-bold text-white">{vehicle.etaMinutes}<span className="text-sm text-slate-500 font-sans ml-1">min</span></p>
                   <p className="text-xs text-green-400">On Time</p>
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                 <div className="bg-slate-950 p-2 rounded-lg text-center">
                    <p className="text-slate-500 text-xs">Plate</p>
                    <p className="font-mono font-bold">{vehicle.plateNumber}</p>
                 </div>
                 <div className="bg-slate-950 p-2 rounded-lg text-center">
                    <p className="text-slate-500 text-xs">Seats</p>
                    <p className={`font-bold ${seatsAvailable < 5 ? 'text-red-400' : 'text-white'}`}>{seatsAvailable} Left</p>
                 </div>
                 <div className="bg-slate-950 p-2 rounded-lg text-center">
                    <p className="text-slate-500 text-xs">Capacity</p>
                    <p className="font-bold">{vehicle.capacity} Pax</p>
                 </div>
               </div>

               <button 
                onClick={() => onBook(vehicle)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
               >
                 Book Seat <Users className="w-4 h-4" />
               </button>
             </div>
           )
        })}
      </div>
    </div>
  );
};

// Bookings Page (Placeholder)
const BookingsPage: React.FC<{ bookings: UserBooking[] }> = ({ bookings }) => (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">My Trips</h1>
        <p className="text-slate-400">Manage your upcoming and past travels.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white">No active bookings</h3>
          <p className="text-slate-500 max-w-xs text-center mt-2">Check the Live Map to find a bus and reserve your seat instantly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-700 flex justify-between items-center">
               <div>
                  <h4 className="font-bold text-lg text-white">{booking.sacco}</h4>
                  <p className="text-slate-400 text-sm">Seat {booking.seatId} • Paid KES {booking.price}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded border border-green-800 font-bold uppercase tracking-wider">Confirmed</span>
               </div>
               <div className="text-right">
                 <button className="text-red-400 text-sm hover:underline">Cancel & Refund</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
);

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookings, setBookings] = useState<UserBooking[]>([]);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => prevVehicles.map(v => {
        let newProgress = v.progress + v.speed;
        let newStopIndex = v.currentStopIndex;
        
        const route = NAIROBI_ROUTES.find(r => r.id === v.routeId);
        if (route) {
          if (newProgress >= 100) {
            newProgress = 0;
            newStopIndex++;
            if (newStopIndex >= route.stops.length - 1) {
              newStopIndex = 0; // Loop back
            }
          }
        }

        return {
          ...v,
          progress: newProgress,
          currentStopIndex: newStopIndex,
          // Randomly change ETA slightly
          etaMinutes: Math.max(0, v.etaMinutes + (Math.random() > 0.8 ? -1 : 0)) 
        };
      }));
    }, 100); 

    return () => clearInterval(interval);
  }, []);

  const handleBooking = (vehicleId: string, seatId: string, price: number) => {
    // 1. Update vehicle state (mark seat booked)
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          seats: v.seats.map(s => s.id === seatId ? { ...s, isBooked: true } : s)
        };
      }
      return v;
    }));

    // 2. Add to user bookings
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setBookings(prev => [...prev, {
        id: `bk-${Date.now()}`,
        vehicleId,
        sacco: vehicle.sacco,
        seatId,
        price,
        timestamp: Date.now(),
        status: 'ACTIVE'
      }]);
    }

    // 3. Close modal
    setSelectedVehicle(null);
  };

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={
            <MapPage vehicles={vehicles} onVehicleClick={setSelectedVehicle} />
          } />
          <Route path="/list" element={
            <ListPage vehicles={vehicles} onBook={setSelectedVehicle} />
          } />
          <Route path="/bookings" element={
            <BookingsPage bookings={bookings} />
          } />
        </Routes>

        {selectedVehicle && (
          <BookingModal 
            vehicle={selectedVehicle} 
            onClose={() => setSelectedVehicle(null)} 
            onBook={handleBooking}
          />
        )}

        <GeminiAssistant vehicles={vehicles} />
      </Layout>
    </HashRouter>
  );
}
