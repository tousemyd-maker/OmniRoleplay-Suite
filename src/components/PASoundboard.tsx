import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Bell,
  ShieldAlert,
  Radio,
  Plus,
  Trash2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { AnnouncementPreset, VenueConfig } from '../types';
import { playChime, speakAnnouncement, stopAnnouncement } from '../utils/sound';

interface PASoundboardProps {
  venue: VenueConfig;
  announcements: AnnouncementPreset[];
  onAddAnnouncement: (ann: AnnouncementPreset) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const PASoundboard: React.FC<PASoundboardProps> = ({
  venue,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [customText, setCustomText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // New Custom Preset Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [presetTitle, setPresetTitle] = useState('');
  const [presetMessage, setPresetMessage] = useState('');

  const handleBroadcastText = (textToSpeak: string, includeChime: boolean = true) => {
    if (!textToSpeak.trim()) return;
    setIsPlaying(true);
    speakAnnouncement(textToSpeak, includeChime, () => {
      setIsPlaying(false);
    });
  };

  const handleStopSpeech = () => {
    stopAnnouncement();
    setIsPlaying(false);
  };

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetTitle.trim() || !presetMessage.trim()) return;

    const newAnn: AnnouncementPreset = {
      id: `ann-${Date.now()}`,
      title: presetTitle.trim(),
      venueType: venue.type,
      message: presetMessage.trim(),
      chime: true,
    };

    onAddAnnouncement(newAnn);
    setShowAddModal(false);
    setPresetTitle('');
    setPresetMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Radio className="w-3.5 h-3.5" /> Public Announcement System (PAS)
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">PA Broadcast & Sound FX Desk</h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            Play synthesized airport/hotel chimes, text-to-speech voice broadcasts, and roleplay sound alerts!
          </p>
        </div>

        {isPlaying && (
          <button
            onClick={handleStopSpeech}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg animate-pulse transition flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            <span>Stop Active Broadcast</span>
          </button>
        )}
      </div>

      {/* Custom Live Speech Broadcast Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" /> Custom Live Voice Announcement
        </h3>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={`e.g. Attention guests at ${venue.name}: Paging passenger Taylor Morgan to Gate A4 immediately...`}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => playChime('airport')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition"
              >
                🔔 Play Chime Only
              </button>
              <button
                type="button"
                onClick={() => playChime('alert')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 transition"
              >
                🚨 Emergency Alarm Sound
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleBroadcastText(customText, true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Broadcast Over PA Voice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Announcements Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base">Quick PA Announcement Presets</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Announcement
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3 flex flex-col justify-between hover:border-slate-600 transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-700">
                    {ann.venueType}
                  </span>
                  <button
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    className="text-slate-500 hover:text-red-400 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-bold text-white text-sm">{ann.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{ann.message}"</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleBroadcastText(ann.message, ann.chime)}
                  className="w-full py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Play Broadcast
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Adding Custom Announcement */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add PA Preset</h3>
            <form onSubmit={handleAddPreset} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preset Title
                </label>
                <input
                  type="text"
                  required
                  value={presetTitle}
                  onChange={(e) => setPresetTitle(e.target.value)}
                  placeholder="e.g. Flight Boarding Call, Dinner Ready"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Announcement Voice Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={presetMessage}
                  onChange={(e) => setPresetMessage(e.target.value)}
                  placeholder="The text that will be spoken aloud..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
