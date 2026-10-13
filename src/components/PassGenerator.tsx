import React, { useState } from 'react';
import {
  QrCode,
  Printer,
  Download,
  CreditCard,
  Ticket,
  ShieldCheck,
  User,
  Sparkles,
  Plane,
  Hotel,
  Building2,
  Check,
} from 'lucide-react';
import { CheckInRecord, VenueConfig } from '../types';

interface PassGeneratorProps {
  venue: VenueConfig;
  checkIns: CheckInRecord[];
  selectedCheckInForPass?: CheckInRecord | null;
}

export const PassGenerator: React.FC<PassGeneratorProps> = ({
  venue,
  checkIns,
  selectedCheckInForPass,
}) => {
  const [passType, setPassType] = useState<'boarding_pass' | 'hotel_key' | 'staff_badge' | 'vip_passport'>('boarding_pass');
  const [guestName, setGuestName] = useState(selectedCheckInForPass?.guestName || 'Taylor Morgan');
  const [refCode, setRefCode] = useState(selectedCheckInForPass?.code || 'RP-8902');
  const [allocation, setAllocation] = useState(selectedCheckInForPass?.seatOrRoomOrTable || 'Seat 02A (First Class)');
  const [roleTitle, setRoleTitle] = useState('VIP Passenger');
  const [clearance, setClearance] = useState('Level 4 VIP Access');

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <QrCode className="w-3.5 h-3.5" /> Printable Identity Credentials
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Digital Pass & ID Badge Generator</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Generate printable roleplay passes, room keycards, staff badges, and tickets with scannable barcodes.
          </p>
        </div>

        <button
          onClick={handlePrintCard}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print Pass Badge</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h3 className="font-bold text-white text-base">Pass Type & Details</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Credential Template
              </label>
              <select
                value={passType}
                onChange={(e) => setPassType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="boarding_pass">Flight / Express Boarding Pass</option>
                <option value="hotel_key">Hotel Keycard & Suite Pass</option>
                <option value="staff_badge">Staff Official ID Badge</option>
                <option value="vip_passport">VIP Express Passport</option>
              </select>
            </div>

            {/* Quick Populate from Check-In list */}
            {checkIns.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Load Details from Checked-In Guest:
                </label>
                <select
                  onChange={(e) => {
                    const rec = checkIns.find((c) => c.id === e.target.value);
                    if (rec) {
                      setGuestName(rec.guestName);
                      setRefCode(rec.code);
                      setAllocation(rec.seatOrRoomOrTable);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-indigo-300"
                >
                  <option value="">Select guest record...</option>
                  {checkIns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.guestName} ({c.code} - {c.seatOrRoomOrTable})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reference Code
              </label>
              <input
                type="text"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Allocation / Seat / Room
              </label>
              <input
                type="text"
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Title / Role
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Pass Preview Card (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-indigo-500/50 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden print:border-black print:text-black print:bg-white">
            {/* Top Pass Branding */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    {venue.name}
                  </p>
                  <p className="text-sm font-black text-white capitalize">{passType.replace('_', ' ')}</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                {refCode}
              </span>
            </div>

            {/* Main Pass Content */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Holder Name
                  </p>
                  <p className="text-base font-black text-white">{guestName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Role / Title
                  </p>
                  <p className="text-sm font-bold text-indigo-300">{roleTitle}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Location / Room
                  </p>
                  <p className="text-sm font-extrabold text-sky-300">{allocation}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <span className="text-xs font-bold text-emerald-400">ACTIVATED</span>
                </div>
              </div>
            </div>

            {/* Barcode & Security Strip */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-center">
              <div className="h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center font-mono text-xs text-slate-300 tracking-widest">
                |||| ||||| ||| ||||||| ||||| ||| {refCode}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Authorized for Roleplay Access • {venue.locationName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
