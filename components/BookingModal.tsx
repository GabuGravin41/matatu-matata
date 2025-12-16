import React, { useState } from 'react';
import { X, Armchair, CheckCircle, CreditCard } from 'lucide-react';
import { Vehicle, Seat } from '../types';
import { SACCO_INFO } from '../constants';

interface BookingModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onBook: (vehicleId: string, seatId: string, price: number) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ vehicle, onClose, onBook }) => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [step, setStep] = useState<'SEAT' | 'PAYMENT' | 'SUCCESS'>('SEAT');

  const saccoInfo = SACCO_INFO[vehicle.sacco];
  // Mock price calculation based on sacco rate
  const price = saccoInfo.pricePerKm * 20; // Assuming fixed distance for demo

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) return;
    setSelectedSeat(seat.id === selectedSeat ? null : seat.id);
  };

  const handlePayment = () => {
    setStep('SUCCESS');
    setTimeout(() => {
      if (selectedSeat) {
        onBook(vehicle.id, selectedSeat, price);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${saccoInfo.color} text-white flex justify-between items-start`}>
          <div>
            <h2 className="text-2xl font-bold">{vehicle.sacco}</h2>
            <p className="opacity-90">{vehicle.plateNumber} • {vehicle.type}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {step === 'SEAT' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-slate-400 text-sm">To Town (CBD)</p>
                  <p className="text-2xl font-bold text-white">KES {price}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-slate-600 rounded-sm"></div> <span className="text-xs text-slate-400">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-slate-500 rounded-sm"></div> <span className="text-xs text-slate-400">Available</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 mb-6">
                <div className="text-center text-xs text-slate-500 mb-4 uppercase tracking-widest">Driver / Front</div>
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  {vehicle.seats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.isBooked}
                      className={`
                        relative h-12 rounded-lg flex items-center justify-center transition-all
                        ${seat.isBooked 
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                          : selectedSeat === seat.id
                            ? 'bg-yellow-500 text-slate-900 font-bold ring-2 ring-yellow-300'
                            : 'bg-slate-800 text-white border border-slate-600 hover:border-yellow-500'
                        }
                      `}
                    >
                      <Armchair className="w-5 h-5" />
                      <span className="absolute -top-2 -right-2 text-[10px] bg-slate-900 border border-slate-700 px-1 rounded text-slate-400">
                        {seat.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!selectedSeat}
                onClick={() => setStep('PAYMENT')}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Continue to Pay
              </button>
            </>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-6">
               <h3 className="text-xl font-bold text-white">Payment Method</h3>
               <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center justify-between cursor-pointer ring-2 ring-green-500">
                 <div className="flex items-center gap-3">
                   <div className="bg-green-600 w-10 h-10 rounded flex items-center justify-center font-bold text-white">M</div>
                   <div>
                     <p className="font-bold text-white">M-PESA</p>
                     <p className="text-sm text-slate-400">Automatic Prompt</p>
                   </div>
                 </div>
                 <CheckCircle className="text-green-500 w-5 h-5" />
               </div>

               <div className="border-t border-slate-700 pt-4 space-y-2">
                 <div className="flex justify-between text-slate-400">
                   <span>Seat</span>
                   <span className="text-white font-mono">{selectedSeat}</span>
                 </div>
                 <div className="flex justify-between text-slate-400">
                   <span>Fare</span>
                   <span className="text-white font-mono">KES {price}</span>
                 </div>
                 <div className="flex justify-between text-slate-400">
                   <span>Booking Fee</span>
                   <span className="text-white font-mono">KES 0</span>
                 </div>
                 <div className="flex justify-between text-xl font-bold text-white pt-2">
                   <span>Total</span>
                   <span>KES {price}</span>
                 </div>
               </div>

               <button
                onClick={handlePayment}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Pay KES {price}
              </button>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center h-full py-10 space-y-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white">Booking Confirmed!</h3>
              <p className="text-slate-400 text-center">
                Seat <span className="text-white font-bold">{selectedSeat}</span> on <span className="text-white">{vehicle.plateNumber}</span> is reserved.
              </p>
              <div className="bg-slate-900 p-4 rounded-lg text-sm text-slate-400 text-center border border-slate-700 w-full">
                Cancellation Policy: Refund allowed. 10 KES deduction applies.
              </div>
              <button
                onClick={onClose}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl mt-4"
              >
                Close Ticket
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
