import React, { useState } from 'react';
import {
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit3,
  UserCheck,
  ShoppingBag,
  Filter,
  AlertTriangle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { GuestRequest, RequestItemOption, RequestStatus, VenueConfig } from '../types';
import { playChime } from '../utils/sound';

interface StaffDispatchConsoleProps {
  venue: VenueConfig;
  guestRequests: GuestRequest[];
  requestItems: RequestItemOption[];
  onUpdateRequest: (updatedRequest: GuestRequest) => void;
  onDeleteRequest: (id: string) => void;
  onUpdateItems: (items: RequestItemOption[]) => void;
}

export const StaffDispatchConsole: React.FC<StaffDispatchConsoleProps> = ({
  venue,
  guestRequests,
  requestItems,
  onUpdateRequest,
  onDeleteRequest,
  onUpdateItems,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'menu_config'>('queue');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workerNameInput, setWorkerNameInput] = useState('Staff Officer');

  // Modal for Worker Note
  const [noteModalReq, setNoteModalReq] = useState<GuestRequest | null>(null);
  const [workerNoteText, setWorkerNoteText] = useState('');

  // New Custom Menu Item Form
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('Food & Beverage');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState<number>(10);

  const filteredRequests = guestRequests.filter((req) => {
    if (statusFilter === 'all') return true;
    return req.status === statusFilter;
  });

  const handleStatusChange = (req: GuestRequest, newStatus: RequestStatus, note?: string) => {
    const updated: GuestRequest = {
      ...req,
      status: newStatus,
      assignedWorker: workerNameInput.trim() || 'Worker on Duty',
      workerNotes: note !== undefined ? note : req.workerNotes,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateRequest(updated);

    if (newStatus === 'fulfilled') {
      playChime('success');
    } else if (newStatus === 'in_progress') {
      playChime('hotel');
    }
  };

  const handleAddCustomMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;

    const newItem: RequestItemOption = {
      id: `item-${Date.now()}`,
      title: itemTitle.trim(),
      category: itemCategory,
      description: itemDesc.trim() || 'Custom guest service option.',
      price: itemPrice,
      iconName: 'Sparkles',
      isAvailable: true,
    };

    onUpdateItems([...requestItems, newItem]);
    setShowAddItemModal(false);
    setItemTitle('');
    setItemDesc('');
  };

  const handleToggleItemAvailability = (id: string) => {
    const updated = requestItems.map((item) => {
      if (item.id === id) {
        return { ...item, isAvailable: !item.isAvailable };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleDeleteMenuItem = (id: string) => {
    onUpdateItems(requestItems.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black text-white">Worker Request & Dispatch Console</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Claim, fulfill or decline incoming guest requests in real time. Manage the service menu set for guests.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'queue'
                ? 'bg-amber-500 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Incoming Queue ({guestRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('menu_config')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'menu_config'
                ? 'bg-amber-500 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Configurator (Menu Editor)
          </button>
        </div>
      </div>

      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-300">Staff Worker Name:</label>
              <input
                type="text"
                value={workerNameInput}
                onChange={(e) => setWorkerNameInput(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Request Statuses</option>
                <option value="pending">Pending (New)</option>
                <option value="in_progress">In Progress</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="rejected">Declined</option>
              </select>
            </div>
          </div>

          {/* Incoming Requests Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 italic text-xs">
                No guest requests in queue matching your filter.
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                        {req.category}
                      </span>
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

                    <div>
                      <h4 className="font-bold text-white text-base">{req.itemTitle}</h4>
                      <p className="text-xs text-sky-300 font-semibold mt-0.5">
                        Guest: <strong className="text-white">{req.guestName}</strong> • {req.locationRef}
                      </p>
                    </div>

                    {req.notes && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-200/90 italic">
                        "{req.notes}"
                      </div>
                    )}

                    {req.workerNotes && (
                      <div className="text-[11px] text-slate-400">
                        <strong>Staff Note:</strong> {req.workerNotes}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Submitted: {req.createdAt}</span>
                      {req.assignedWorker && <span>Worker: {req.assignedWorker}</span>}
                    </div>
                  </div>

                  {/* Worker Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(req, 'in_progress')}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                      >
                        Take Action (Claim)
                      </button>
                    )}

                    {req.status !== 'fulfilled' && (
                      <button
                        onClick={() => handleStatusChange(req, 'fulfilled')}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Fulfill Order
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setNoteModalReq(req);
                        setWorkerNoteText(req.workerNotes || '');
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="Add Note or Decline"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteRequest(req.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/50 text-slate-500 hover:text-red-400 border border-slate-700 transition"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Worker Options Configurator */}
      {activeTab === 'menu_config' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-md">
            <div>
              <h3 className="text-base font-bold text-white">Worker Request Menu Options</h3>
              <p className="text-xs text-slate-400">
                Set options for requests that guests will see in their portal
              </p>
            </div>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service Option</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requestItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleToggleItemAvailability(item.id)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        item.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Disabled'}
                    </button>
                  </div>

                  <h4 className="font-bold text-white text-base">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">
                    {item.price === 0 ? 'FREE' : `${venue.currencySymbol}${item.price}`}
                  </span>
                  <button
                    onClick={() => handleDeleteMenuItem(item.id)}
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Worker Response Note</h3>
            <p className="text-xs text-slate-400">
              Note for request: <strong className="text-white">{noteModalReq.itemTitle}</strong>
            </p>

            <textarea
              rows={3}
              value={workerNoteText}
              onChange={(e) => setWorkerNoteText(e.target.value)}
              placeholder="e.g. On the way, or Out of stock"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  handleStatusChange(noteModalReq, 'rejected', workerNoteText);
                  setNoteModalReq(null);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30"
              >
                Decline Request
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNoteModalReq(null)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange(noteModalReq, noteModalReq.status, workerNoteText);
                    setNoteModalReq(null);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-white"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Worker Request Option</h3>
            <form onSubmit={handleAddCustomMenuItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g. Extra Blanket, Champagne Tray, Secret Code Pass"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="Food, Housekeeping..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Price ({venue.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Short description"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-white"
                >
                  Save Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
