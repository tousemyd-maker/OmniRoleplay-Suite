import React, { useState } from 'react';
import {
  Users,
  Eye,
  EyeOff,
  Shield,
  Shuffle,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Key,
  Sparkles,
  HelpCircle,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { Player, PlayerRole } from '../types';

interface RoleDealerProps {
  players: Player[];
  roles: PlayerRole[];
  onUpdatePlayers: (players: Player[]) => void;
  onUpdateRoles: (roles: PlayerRole[]) => void;
}

export const RoleDealer: React.FC<RoleDealerProps> = ({
  players,
  roles,
  onUpdatePlayers,
  onUpdateRoles,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [activePlayerForReveal, setActivePlayerForReveal] = useState<Player | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [playerPinInput, setPlayerPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // New Custom Role Form
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleCategory, setNewRoleCategory] = useState<PlayerRole['category']>('guest');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleObjective, setNewRoleObjective] = useState('');
  const [newRoleItems, setNewRoleItems] = useState('');

  // Add new player
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      name: newPlayerName.trim(),
      pin: '1234', // default secret PIN
    };
    onUpdatePlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  // Remove player
  const handleRemovePlayer = (id: string) => {
    onUpdatePlayers(players.filter((p) => p.id !== id));
  };

  // Shuffle & Deal Roles randomly
  const handleShuffleAndDeal = () => {
    if (players.length === 0) {
      alert('Please add at least 1 player first!');
      return;
    }
    if (roles.length === 0) {
      alert('No roles available in the deck!');
      return;
    }

    // Shuffle roles array
    const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

    const updatedPlayers = players.map((player, idx) => {
      const assignedRole = shuffledRoles[idx % shuffledRoles.length];
      return {
        ...player,
        assignedRoleId: assignedRole.id,
        isRevealed: false,
      };
    });

    onUpdatePlayers(updatedPlayers);
    alert(`Shuffled & secretly dealt roles to ${players.length} players!`);
  };

  // Add custom role
  const handleAddCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;

    const newRole: PlayerRole = {
      id: `role-${Date.now()}`,
      title: newRoleTitle.trim(),
      category: newRoleCategory,
      description: newRoleDesc.trim() || 'Custom role created for this game.',
      secretObjective: newRoleObjective.trim() || 'Accomplish your goals secretly.',
      startingItems: newRoleItems
        ? newRoleItems.split(',').map((item) => item.trim())
        : ['Personal Keycard'],
      clearanceLevel: 'Custom Level',
    };

    onUpdateRoles([...roles, newRole]);
    setShowAddRoleModal(false);
    setNewRoleTitle('');
    setNewRoleDesc('');
    setNewRoleObjective('');
    setNewRoleItems('');
  };

  const handleOpenReveal = (player: Player) => {
    setActivePlayerForReveal(player);
    setIsRevealed(false);
    setPlayerPinInput('');
    setPinError(false);
  };

  const assignedRoleForActivePlayer = activePlayerForReveal
    ? roles.find((r) => r.id === activePlayerForReveal.assignedRoleId)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5 text-indigo-400" /> Private Couch Roleplay
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Secret Role Dealer & Identity Vault
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            Pass the device around! Each player taps to privately view their assigned role, secret motives, and inventory. No one else sees your card.
          </p>
        </div>
      </div>

      {/* Main Grid: Players List & Role Cards Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Player Roster & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Player Roster ({players.length})</h3>
              </div>
              <button
                onClick={handleShuffleAndDeal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Shuffle & Deal
              </button>
            </div>

            {/* Add Player Input */}
            <form onSubmit={handleAddPlayer} className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name (e.g. Alex)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </form>

            {/* Players List */}
            <div className="space-y-2.5">
              {players.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  No players added yet. Add players above to start dealing secret roles!
                </p>
              ) : (
                players.map((player) => {
                  const assignedRole = roles.find((r) => r.id === player.assignedRoleId);
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-700 text-indigo-300 font-bold text-sm flex items-center justify-center border border-slate-600">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{player.name}</p>
                          <p className="text-xs text-slate-400">
                            {assignedRole ? (
                              <span className="text-indigo-400 font-medium">
                                Secret Role Assigned
                              </span>
                            ) : (
                              <span className="text-amber-400">No Role Dealt Yet</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReveal(player)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Card
                        </button>
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition"
                          title="Remove Player"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Roles Deck & Custom Role Manager (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Active Role Deck ({roles.length})</h3>
                <p className="text-xs text-slate-400">
                  Cards in deck available for secret dealing
                </p>
              </div>
              <button
                onClick={() => setShowAddRoleModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Role Card
              </button>
            </div>

            {/* Role Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 relative group hover:border-slate-500 transition"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        role.category === 'staff'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : role.category === 'vip'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : role.category === 'mystery'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {role.category}
                    </span>
                    {role.clearanceLevel && (
                      <span className="text-[10px] text-slate-400">{role.clearanceLevel}</span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-100 text-sm">{role.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{role.description}</p>

                  <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-1">
                    {role.startingItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secret Card Reveal Modal (Pass Phone Screen) */}
      {activePlayerForReveal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActivePlayerForReveal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-slate-800"
            >
              ✕ Close
            </button>

            {!isRevealed ? (
              <div className="text-center space-y-6 py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                    Pass device to
                  </p>
                  <h3 className="text-2xl font-black text-white">{activePlayerForReveal.name}</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Ensure other players are looking away before revealing your secret role.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsRevealed(true)}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Tap to Reveal My Secret Role
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Secret Card Display */}
                <div className="p-5 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-indigo-500/50 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        Secret Role Card
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      Player: <strong className="text-white">{activePlayerForReveal.name}</strong>
                    </span>
                  </div>

                  {assignedRoleForActivePlayer ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          {assignedRoleForActivePlayer.category}
                        </span>
                        <h4 className="text-xl font-black text-white">
                          {assignedRoleForActivePlayer.title}
                        </h4>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Description & Duties
                        </p>
                        <p className="text-xs text-slate-200">
                          {assignedRoleForActivePlayer.description}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1">
                        <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Secret Objective / Motive
                        </p>
                        <p className="text-xs text-amber-200 font-medium">
                          {assignedRoleForActivePlayer.secretObjective}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Starting Items
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {assignedRoleForActivePlayer.startingItems.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium bg-slate-800 text-indigo-300 border border-slate-700 rounded-md"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-red-400">
                      No role assigned yet! Tap "Shuffle & Deal" on the roster.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setIsRevealed(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide Secret Card
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Custom Role Card</h3>
            <form onSubmit={handleAddCustomRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  required
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Undercover Detective, VIP Celebrity"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newRoleCategory}
                  onChange={(e) =>
                    setNewRoleCategory(e.target.value as PlayerRole['category'])
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="guest">Guest</option>
                  <option value="staff">Staff / Worker</option>
                  <option value="vip">VIP</option>
                  <option value="mystery">Mystery / Secret Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Role description and backstory"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secret Objective / Motive
                </label>
                <input
                  type="text"
                  value={newRoleObjective}
                  onChange={(e) => setNewRoleObjective(e.target.value)}
                  placeholder="e.g. Find room 402 key, inspect luggage"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Starting Items (comma separated)
                </label>
                <input
                  type="text"
                  value={newRoleItems}
                  onChange={(e) => setNewRoleItems(e.target.value)}
                  placeholder="e.g. Master Key, Briefcase, Scanner"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Role Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
