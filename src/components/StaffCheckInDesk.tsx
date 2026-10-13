import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Briefcase,
  UserCheck,
  Tag,
  Plus,
  Trash2,
  Edit3,
  QrCode,
  ShieldCheck,
  Clock,
  Building2,
  XCircle,
  MoreVertical,
  Printer,
  Sparkles,
  Users,
} from 'lucide-react';
import { CheckInRecord, CheckInStatus, VenueConfig } from '../types';

interface StaffCheckInDeskProps {
  venue: VenueConfig;
  checkIns: CheckInRecord[];
  onUpdateCheckIn: (record: CheckInRecord) => void;
  onDeleteCheckIn: (id: string) => void;
  onAddCheckIn: (record: CheckInRecord) => void;
  onSelectPassForPrint: (record: CheckInRecord) => void;
}

export const StaffCheckInDesk: React.FC<StaffCheckInDeskProps> = ({
  venue,
  checkIns,
  onUpdateCheckIn,
  onDeleteCheckIn,
  onAddCheckIn,
  onSelectPassForPrint,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Manual Record Form
  const [guestName, setGuestName] = useState('');
  const [ticketRef, setTicketRef] = useState('');
  const [allocation, setAllocation] = useState('');
  const [luggageCount, setLuggageCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [staffName, setStaffName] = useState('Duty Staff');

  // Filtered check-ins
  const filteredRecords = checkIns.filter((rec) => {
    const matchesSearch =
      rec.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.ticketOrBookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.seatOrRoomOrTable.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (record: CheckInRecord, newStatus: CheckInStatus) => {
    onUpdateCheckIn({
      ...record,
      status: newStatus,
    });
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newRec: CheckInRecord = {
      id: `chk-${Date.now()}`,
      code: `RP-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: guestName.trim(),
      ticketOrBookingRef: ticketRef.trim() || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      venueType: venue.type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'checked_in',
      seatOrRoomOrTable: allocation.trim() || 'Desk Assigned',
      luggageCount: luggageCount,
      luggageTagCode: luggageCount > 0 ? `LUG-${Math.floor(100 + Math.random() * 900)}` : undefined,
      specialRequests: [],
      dietaryOrNotes: notes.trim(),
      assignedStaff: staffName.trim(),
      kioskUsed: false,
    };

    onAddCheckIn(newRec);
    setShowAddModal(false);
    setGuestName('');
    setTicketRef('');
    setAllocation('');
    setNotes('');
  };

  const getStatusBadge = (status: CheckInStatus) => {
    switch (status) {
      case 'checked_in':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'luggage_dropped':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'security_cleared':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'boarded':
      case 'room_assigned':
      case 'table_seated':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'completed':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-black text-white">Staff Check-In Master Console</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed showing guest check-ins, luggage drops, boarding & room assignments from Self Check-In Kiosks and Desk
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Desk Registration</span>
        </button>
      </div>

      {/* Controls: Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guest name, code, ticket, room or seat..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses ({checkIns.length})</option>
            <option value="checked_in">Checked In</option>
            <option value="luggage_dropped">Luggage Dropped</option>
            <option value="boarded">Boarded / Room Assigned</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Master Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Code / Time</th>
                <th className="p-4">Guest Name</th>
                <th className="p-4">Allocation (Room/Seat/Table)</th>
                <th className="p-4">Luggage / Source</th>
                <th className="p-4">Status & Action</th>
                <th className="p-4">Staff Notes</th>
                <th className="p-4 text-right">Pass / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 italic">
                    No check-in records found. Guests can use the Self Check-In Kiosk or you can register them above!
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/50 transition">
                    {/* Code & Time */}
                    <td className="p-4 font-mono">
                      <span className="font-bold text-white block">{record.code}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {record.timestamp}
                      </span>
                    </td>

                    {/* Guest Name & Ref */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{record.guestName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ref: {record.ticketOrBookingRef}
                        {record.passportId && ` • ID: ${record.passportId}`}
                      </div>
                    </td>

                    {/* Allocation */}
                    <td className="p-4 font-semibold text-sky-300">
                      {record.seatOrRoomOrTable}
                    </td>

                    {/* Luggage & Source */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.luggageCount} bag(s)</span>
                        {record.luggageTagCode && (
                          <span className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                            {record.luggageTagCode}
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        {record.kioskUsed ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Self Kiosk
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Desk Registered
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status & Update Dropdown */}
                    <td className="p-4">
                      <select
                        value={record.status}
                        onChange={(e) =>
                          handleStatusChange(record, e.target.value as CheckInStatus)
                        }
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(
                          record.status
                        )}`}
                      >
                        <option value="checked_in">Checked In</option>
                        <option value="luggage_dropped">Luggage Dropped</option>
                        <option value="security_cleared">Security Cleared</option>
                        <option value="boarded">Boarded / Room Assigned</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Notes */}
                    <td className="p-4 max-w-xs text-[11px] text-slate-400">
                      {record.dietaryOrNotes || record.specialRequests.join(', ') || (
                        <span className="italic text-slate-600">No notes</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectPassForPrint(record)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1"
                          title="Generate Pass Card"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Issue Pass</span>
                        </button>
                        <button
                          onClick={() => onDeleteCheckIn(record.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Desk Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">New Desk Registration</h3>
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Guest Full Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Booking Reference
                  </label>
                  <input
                    type="text"
                    value={ticketRef}
                    onChange={(e) => setTicketRef(e.target.value)}
                    placeholder="TKT-1002"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Room / Seat / Table
                  </label>
                  <input
                    type="text"
                    value={allocation}
                    onChange={(e) => setAllocation(e.target.value)}
                    placeholder="Room 204 or Seat 05A"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Luggage Pieces
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={luggageCount}
                    onChange={(e) => setLuggageCount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Worker Staff Name
                  </label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="e.g. Officer Sam"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Staff Notes & Special Requests
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. VIP guest, requested late check-out"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Create Desk Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
