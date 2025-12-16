import React, { useState } from 'react';
import { Search, MapPin, Clock, ArrowRight, Navigation } from 'lucide-react';

interface TripPlannerProps {
  onPlanTrip: (origin: string, destination: string) => void;
  isLoading: boolean;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({ onPlanTrip, isLoading }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('now');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    onPlanTrip(origin, destination);
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
      <form 
        onSubmit={handleSubmit}
        className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 space-y-3"
      >
        <div className="flex items-center gap-2 mb-2">
           <div className="bg-yellow-500 rounded p-1">
             <Navigation className="w-4 h-4 text-black" />
           </div>
           <h3 className="font-bold text-white">Plan Trip</h3>
        </div>

        <div className="space-y-3 relative">
          {/* Connector Line */}
          <div className="absolute left-[15px] top-[30px] bottom-[30px] w-0.5 bg-slate-700 -z-10" />

          {/* Origin */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/50">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">From</label>
              <input 
                type="text" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 py-2 px-3"
                placeholder="Enter pickup location..."
                required
              />
            </div>
          </div>

          {/* Destination */}
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/50">
               <MapPin className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">To</label>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500 py-2 px-3"
                placeholder="Enter destination..."
                required
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-2 pt-2">
           <select 
             value={time}
             onChange={(e) => setTime(e.target.value)}
             className="bg-slate-800 text-slate-300 text-xs rounded-lg px-2 py-2 border border-slate-700 outline-none flex-1"
           >
             <option value="now">Leave Now</option>
             <option value="15">In 15 mins</option>
             <option value="30">In 30 mins</option>
           </select>
           
           <button 
             type="submit"
             disabled={isLoading || !origin || !destination}
             className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold rounded-lg px-4 py-2 hover:opacity-90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isLoading ? 'Searching...' : <>Find Bus <ArrowRight className="w-3 h-3" /></>}
           </button>
        </div>
      </form>
    </div>
  );
};
