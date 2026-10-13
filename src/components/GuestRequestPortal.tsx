import React, { useState } from 'react';
import {
  Send,
  UtensilsCrossed,
  Sparkles,
  Briefcase,
  Crown,
  Wrench,
  Wine,
  HeartPulse,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  User,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { GuestRequest, RequestItemOption, VenueConfig } from '../types';
import { playChime } from '../utils/sound';

interface GuestRequestPortalProps {
  venue: VenueConfig;
  requestItems: RequestItemOption[];
  guestRequests: GuestRequest[];
  onAddGuestRequest: (request: GuestRequest) => void;
}

export const GuestRequestPortal: React.FC<GuestRequestPortalProps> = ({
  venue,
  requestItems,
  guestRequests,
  onAddGuestRequest,
}) => {
  const [guestName, setGuestName] = useState('');
  const [locationRef, setLocationRef] = useState('');
  const [selectedItem, setSelectedItem] = useState<RequestItemOption | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [requestSentNotice, setRequestSentNotice] = useState(false);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !locationRef.trim() || !selectedItem) {
      alert('Please fill in your name, room/seat location, and select a service item!');
      return;
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newReq: GuestRequest = {
      id: `req-${Date.now()}`,
      guestName: guestName.trim(),
      locationRef: locationRef.trim(),
      itemId: selectedItem.id,
      itemTitle: selectedItem.title,
      category: selectedItem.category,
      quantity,
      totalPrice: selectedItem.price * quantity,
      notes: notes.trim(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    onAddGuestRequest(newReq);
    playChime('hotel');
    setRequestSentNotice(true);
    setTimeout(() => setRequestSentNotice(false), 4000);

    // Reset item choice
    setSelectedItem(null);
    setNotes('');
  };

  const myRequests = guestRequests.filter(
    (r) =>
      guestName &&
      (r.guestName.toLowerCase().includes(guestName.toLowerCase().trim()) ||
        r.locationRef.toLowerCase().includes(locationRef.toLowerCase().trim()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-800/50 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Send className="w-3.5 h-3.5" /> Guest Service Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Guest Amenities & Request Portal
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Request room service, extra towels, baggage escort, maintenance or VIP upgrades. Your requests send directly to staff on duty!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Guest Location & Request Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" /> Step 1: Guest Identity & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Taylor Morgan"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Room / Seat / Table # <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={locationRef}
                  onChange={(e) => setLocationRef(e.target.value)}
                  placeholder="e.g. Room 402, Seat 02A, Table 5"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Menu Options set by Worker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" /> Step 2: Select Amenity or Order Option
              </span>
              <span className="text-xs text-slate-400 font-normal">
                {requestItems.length} Worker-Configured Options
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {requestItems
                .filter((item) => item.isAvailable)
                .map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-xl border text-left transition space-y-2 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {item.price === 0 ? 'FREE' : `${venue.currencySymbol}${item.price}`}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    </button>
                  );
                })}
            </div>

            {/* Custom Notes & Order Action */}
            {selectedItem && (
              <form onSubmit={handleSendRequest} className="pt-4 border-t border-slate-800 space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200">
                    Selected: {selectedItem.title}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    Total:{' '}
                    {selectedItem.price === 0
                      ? 'FREE'
                      : `${venue.currencySymbol}${selectedItem.price * quantity}`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Special Notes to Worker
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Leave at door, extra ice, urgent"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Request to Worker Console</span>
                </button>
              </form>
            )}

            {requestSentNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-in fade-in">
                ✅ Request sent live! Workers on duty have been alerted.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Guest Request Status Tracker (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" /> Active Request Status Feed
              </h3>
              <p className="text-xs text-slate-400">
                Live updates on your requests as workers take action
              </p>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {guestRequests.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-8">
                  No requests submitted yet. Select an option on the left to submit a request!
                </p>
              ) : (
                guestRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{req.itemTitle}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          req.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : req.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : req.status === 'fulfilled'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>
                        Guest: <strong className="text-slate-200">{req.guestName}</strong> ({req.locationRef})
                      </span>
                      <span>{req.createdAt}</span>
                    </div>

                    {req.notes && (
                      <p className="text-[11px] text-amber-200/80 italic">"{req.notes}"</p>
                    )}

                    {req.workerNotes && (
                      <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-sky-300">
                        <strong>Worker Note:</strong> {req.workerNotes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
