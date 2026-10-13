import React, { useState } from 'react';
import {
  Building2,
  Plane,
  Hotel,
  Utensils,
  TrainFront,
  Ship,
  Bus,
  Activity,
  Sparkles,
  CheckCircle2,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { VenueConfig, VenueType } from '../types';
import { VENUE_PRESETS } from '../data/presets';

interface VenueManagerProps {
  venue: VenueConfig;
  onUpdateVenue: (venue: VenueConfig) => void;
}

export const VenueManager: React.FC<VenueManagerProps> = ({ venue, onUpdateVenue }) => {
  const [name, setName] = useState(venue.name);
  const [tagline, setTagline] = useState(venue.tagline);
  const [locationName, setLocationName] = useState(venue.locationName);
  const [currencySymbol, setCurrencySymbol] = useState(venue.currencySymbol);
  const [type, setType] = useState<VenueType>(venue.type);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleApplyPreset = (presetKey: VenueType) => {
    const preset = VENUE_PRESETS[presetKey];
    if (preset) {
      setName(preset.name);
      setTagline(preset.tagline);
      setLocationName(preset.locationName);
      setCurrencySymbol(preset.currencySymbol);
      setType(preset.type);
      onUpdateVenue(preset);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: VenueConfig = {
      ...venue,
      name: name.trim() || 'Custom Enterprise',
      tagline: tagline.trim() || 'Roleplay Headquarters',
      locationName: locationName.trim() || 'Main Station',
      currencySymbol: currencySymbol.trim() || '$',
      type: type,
    };

    onUpdateVenue(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
          <Building2 className="w-3.5 h-3.5" /> Company Branding & Venue Customizer
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Custom Venue & Company Manager</h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
          Change the company name, logo branding, location terminal, currency symbol, or pivot instantly to a completely new venue setting!
        </p>
      </div>

      {/* Quick Preset Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <h3 className="font-bold text-white text-base">Quick Venue & Company Brand Presets</h3>
        <p className="text-xs text-slate-400">Tap any preset to instantly rebrand the whole site:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(VENUE_PRESETS).map(([key, preset]) => {
            const isCurrent = venue.type === preset.type && venue.name === preset.name;
            return (
              <button
                key={key}
                onClick={() => handleApplyPreset(preset.type)}
                className={`p-4 rounded-xl border text-left transition space-y-2 ${
                  isCurrent
                    ? 'bg-violet-950/60 border-violet-500 ring-2 ring-violet-500/50'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{preset.name}</span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-violet-500 text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{preset.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Venue Settings Form */}
      <form
        onSubmit={handleSaveCustom}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md"
      >
        <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
          Custom Brand Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Company / Venue Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AeroSky International Airport"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Terminal 1 World Class Hub"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Location / Terminal Area Name
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Front Desk & Main Lobby"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Currency Symbol
            </label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              placeholder="e.g. $, €, 🪙"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Company brand updated!
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition ml-auto"
          >
            Save Custom Brand Settings
          </button>
        </div>
      </form>
    </div>
  );
};
