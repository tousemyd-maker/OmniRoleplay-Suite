import React, { useState } from 'react';
import {
  QrCode,
  Plane,
  Hotel,
  Utensils,
  TrainFront,
  Ship,
  Bus,
  Activity,
  Sparkles,
  Building2,
  CheckCircle2,
  Briefcase,
  UserCheck,
  Tag,
  ArrowRight,
  RotateCcw,
  Sparkle,
  CreditCard,
  Ticket,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { CheckInRecord, VenueConfig, VenueType } from '../types';
import { playChime } from '../utils/sound';

interface KioskSystemProps {
  venue: VenueConfig;
  activeKioskVenue: VenueType;
  onChangeKioskVenue: (venueType: VenueType) => void;
  onAddCheckInRecord: (record: CheckInRecord) => void;
}

export const KioskSystem: React.FC<KioskSystemProps> = ({
  venue,
  activeKioskVenue,
  onChangeKioskVenue,
  onAddCheckInRecord,
}) => {
  // Step in kiosk flow
  const [step, setStep] = useState<'venue_select' | 'guest_info' | 'preferences' | 'complete'>('guest_info');

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [bookingRef, setBookingRef] = useState(`TKT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [passportOrId, setPassportOrId] = useState('');
  const [seatOrRoomOrTable, setSeatOrRoomOrTable] = useState('');
  const [luggageCount, setLuggageCount] = useState<number>(1);
  const [droppedLuggage, setDroppedLuggage] = useState(false);
  const [specialRequestsText, setSpecialRequestsText] = useState('');
  const [dietaryOrNotes, setDietaryOrNotes] = useState('');

  // Resulting Record
  const [lastCheckIn, setLastCheckIn] = useState<CheckInRecord | null>(null);

  // Kiosk Venue Options
  const kioskOptions: { type: VenueType; name: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'airport',
      name: 'Airport Kiosk',
      icon: <Plane className="w-5 h-5 text-sky-400" />,
      desc: 'Flight check-in, luggage drop-off, seat selection & boarding passes',
    },
    {
      type: 'hotel',
      name: 'Hotel Kiosk',
      icon: <Hotel className="w-5 h-5 text-amber-400" />,
      desc: 'Room allocation, digital keycard issuance & luggage storage',
    },
    {
      type: 'restaurant',
      name: 'Restaurant Kiosk',
      icon: <Utensils className="w-5 h-5 text-emerald-400" />,
      desc: 'Table seating queue, party size, dietary requests & ticket',
    },
    {
      type: 'train',
      name: 'Train Station Kiosk',
      icon: <TrainFront className="w-5 h-5 text-blue-400" />,
      desc: 'Rail pass issuance, platform routing & luggage tag',
    },
    {
      type: 'boat',
      name: 'Cruise & Boat Kiosk',
      icon: <Ship className="w-5 h-5 text-cyan-400" />,
      desc: 'Cabin check-in, embarkation pass & lifeboat station',
    },
    {
      type: 'bus',
      name: 'Bus Terminal Kiosk',
      icon: <Bus className="w-5 h-5 text-indigo-400" />,
      desc: 'Express bus check-in, seat assignment & baggage check',
    },
    {
      type: 'clinic',
      name: 'Medical Clinic Kiosk',
      icon: <Activity className="w-5 h-5 text-teal-400" />,
      desc: 'Patient triage check-in, symptom registration & queue ticket',
    },
    {
      type: 'themepark',
      name: 'Theme Park Kiosk',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      desc: 'Park admission check-in, VIP wristbands & locker rental',
    },
    {
      type: 'custom',
      name: 'Custom Venue Kiosk',
      icon: <Building2 className="w-5 h-5 text-violet-400" />,
      desc: 'Generic check-in kiosk for custom roleplays',
    },
  ];

  // Config labels per kiosk type
  const getKioskLabels = (type: VenueType) => {
    switch (type) {
      case 'airport':
        return {
          title: 'Airport Self Check-In & Luggage Express',
          seatLabel: 'Select Seat / Flight Class',
          seatPlaceholder: 'e.g. Seat 04B (First Class) or Flight RP-101',
          actionText: 'Complete Check-In & Drop Baggage',
          statusDoneText: 'Boarding Pass & Baggage Tag Issued',
          luggageText: 'Checked Suitcase Bags',
        };
      case 'hotel':
        return {
          title: 'Hotel Express Self Check-In Kiosk',
          seatLabel: 'Select Room Number / Suite Preference',
          seatPlaceholder: 'e.g. Deluxe Ocean Suite 402',
          actionText: 'Confirm Room Check-In & Issue Keycard',
          statusDoneText: 'Room Keycard Activated & Guest Checked In',
          luggageText: 'Luggage Storage Pieces',
        };
      case 'restaurant':
        return {
          title: 'Bistro Dining Queue & Table Check-In',
          seatLabel: 'Party Size & Table Area',
          seatPlaceholder: 'e.g. Table 05 (Party of 4 - Outdoor Terrace)',
          actionText: 'Check-In Table Queue & Receive Ticket',
          statusDoneText: 'Dining Ticket Issued & Seated',
          luggageText: 'Coats / Stroller Items',
        };
      case 'train':
        return {
          title: 'Train Station Self Ticket & Express Boarding',
          seatLabel: 'Seat / Bunk & Platform',
          seatPlaceholder: 'e.g. Car 3, Seat 12 - Platform 9B',
          actionText: 'Issue Train Ticket & Check-In',
          statusDoneText: 'Train Pass Issued & Ready to Board',
          luggageText: 'Overhead Baggage Pieces',
        };
      default:
        return {
          title: 'Self Check-In Kiosk',
          seatLabel: 'Seat / Room / Location Selection',
          seatPlaceholder: 'e.g. Allocation #101',
          actionText: 'Complete Self Check-In',
          statusDoneText: 'Checked In Successfully',
          luggageText: 'Luggage Items',
        };
    }
  };

  const labels = getKioskLabels(activeKioskVenue);

  const handleFinishCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Please enter guest name!');
      return;
    }

    const lugCode = `LUG-${Math.floor(100 + Math.random() * 900)}`;
    const checkInCode = `RP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: CheckInRecord = {
      id: `chk-${Date.now()}`,
      code: checkInCode,
      guestName: guestName.trim(),
      ticketOrBookingRef: bookingRef || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      venueType: activeKioskVenue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: droppedLuggage ? 'luggage_dropped' : 'checked_in',
      seatOrRoomOrTable: seatOrRoomOrTable.trim() || 'General Allocation',
      luggageCount: luggageCount,
      luggageTagCode: droppedLuggage ? lugCode : undefined,
      specialRequests: specialRequestsText
        ? specialRequestsText.split(',').map((s) => s.trim())
        : [],
      dietaryOrNotes: dietaryOrNotes.trim(),
      kioskUsed: true,
      passportId: passportOrId.trim() || undefined,
    };

    onAddCheckInRecord(newRecord);
    setLastCheckIn(newRecord);
    playChime('success');
    setStep('complete');
  };

  const handleStartNewCheckIn = () => {
    setGuestName('');
    setBookingRef(`TKT-${Math.floor(1000 + Math.random() * 9000)}`);
    setPassportOrId('');
    setSeatOrRoomOrTable('');
    setLuggageCount(1);
    setDroppedLuggage(false);
    setSpecialRequestsText('');
    setDietaryOrNotes('');
    setLastCheckIn(null);
    setStep('guest_info');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Kiosk Mode Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/60 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <QrCode className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                Touchscreen Terminal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{labels.title}</h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Operating for <strong className="text-white">{venue.name}</strong> • Active Kiosk Venue:{' '}
              <span className="text-sky-300 capitalize">{activeKioskVenue}</span>
            </p>
          </div>

          <button
            onClick={() => setStep('venue_select')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold transition flex items-center gap-2"
          >
            <span>Change Kiosk Service Type</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 0: Venue Selection Modal / View */}
      {step === 'venue_select' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Select Kiosk Purpose & Venue</h3>
            <p className="text-xs text-slate-400">
              First requirement: Choose what this self check-in kiosk is serving (Airport, Hotel, Restaurant, Train, Boat, Bus, etc.)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kioskOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => {
                  onChangeKioskVenue(opt.type);
                  setStep('guest_info');
                }}
                className={`p-5 rounded-2xl border text-left transition-all space-y-3 flex flex-col justify-between ${
                  activeKioskVenue === opt.type
                    ? 'bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/50'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                    {opt.icon}
                  </div>
                  {activeKioskVenue === opt.type && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-500 text-white">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{opt.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 & 2: Interactive Self Check-In Form */}
      {(step === 'guest_info' || step === 'preferences') && (
        <form
          onSubmit={handleFinishCheckIn}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl"
        >
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">
                1
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Guest Identification & Details</h3>
                <p className="text-xs text-slate-400">Enter your name or booking code to proceed</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono">Terminal ID #KIO-904</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Guest Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Taylor Morgan"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Booking Reference / Passport #
              </label>
              <input
                type="text"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                placeholder="e.g. TKT-8820"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Seat, Room or Allocation Choice</h3>
                <p className="text-xs text-slate-400">Tailor your stay or boarding preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {labels.seatLabel}
                </label>
                <input
                  type="text"
                  value={seatOrRoomOrTable}
                  onChange={(e) => setSeatOrRoomOrTable(e.target.value)}
                  placeholder={labels.seatPlaceholder}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {labels.luggageText}
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={luggageCount}
                    onChange={(e) => setLuggageCount(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value={0}>0 Pieces (Carry-on only)</option>
                    <option value={1}>1 Bag / Suitcase</option>
                    <option value={2}>2 Bags / Suitcases</option>
                    <option value={3}>3+ Bags (Heavy Baggage)</option>
                  </select>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl hover:border-slate-600">
                    <input
                      type="checkbox"
                      checked={droppedLuggage}
                      onChange={(e) => setDroppedLuggage(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded"
                    />
                    <span className="font-semibold">Drop Off Luggage Now</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Special Requests or Notes (Sent to Staff Desk)
              </label>
              <input
                type="text"
                value={specialRequestsText}
                onChange={(e) => setSpecialRequestsText(e.target.value)}
                placeholder="e.g. Extra pillows, Quiet table, Wheelchair escort, Heavy luggage flag"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-base shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{labels.actionText}</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Complete & Receipt Screen */}
      {step === 'complete' && lastCheckIn && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">Check-In Successful!</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Your check-in record has been processed and is now visible on the{' '}
              <strong className="text-sky-400">Staff Check-In Desk</strong>!
            </p>
          </div>

          {/* Printable Ticket Voucher Card */}
          <div className="max-w-md mx-auto bg-slate-950 border-2 border-dashed border-sky-500/50 rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  {venue.name}
                </p>
                <p className="text-sm font-black text-white">{labels.statusDoneText}</p>
              </div>
              <span className="font-mono text-xs text-slate-400 font-bold">{lastCheckIn.code}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Guest Name:</span>
                <span className="font-bold text-white">{lastCheckIn.guestName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Allocation / Seat:</span>
                <span className="font-bold text-sky-300">{lastCheckIn.seatOrRoomOrTable}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Luggage Pieces:</span>
                <span className="font-bold text-white">
                  {lastCheckIn.luggageCount} {lastCheckIn.luggageTagCode ? `(Tag: ${lastCheckIn.luggageTagCode})` : ''}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Status Sent to Desk:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px]">
                  {lastCheckIn.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="pt-3 border-t border-slate-800 text-center space-y-1">
              <div className="h-10 bg-slate-900 rounded flex items-center justify-center font-mono text-[11px] text-slate-400 tracking-widest border border-slate-800">
                |||| ||||| ||| ||||||| ||| |||| {lastCheckIn.code}
              </div>
              <p className="text-[10px] text-slate-500">Scan at Gate or Staff Desk</p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleStartNewCheckIn}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Perform Another Check-In</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
