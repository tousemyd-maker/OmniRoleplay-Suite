import React from 'react';
import {
  Plane,
  Hotel,
  Utensils,
  TrainFront,
  Ship,
  Bus,
  Activity,
  Sparkles,
  Building2,
  Users,
  ClipboardList,
  Bell,
  Volume2,
  QrCode,
  Settings,
  Dices,
  RefreshCw,
  Send,
  HelpCircle,
} from 'lucide-react';
import { VenueConfig, VenueType } from '../types';

interface HeaderProps {
  venue: VenueConfig;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingRequestsCount: number;
  totalCheckInsCount: number;
  onResetState: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  venue,
  activeTab,
  setActiveTab,
  pendingRequestsCount,
  totalCheckInsCount,
  onResetState,
}) => {
  const renderVenueIcon = (type: VenueType) => {
    switch (type) {
      case 'airport':
        return <Plane className="w-5 h-5" />;
      case 'hotel':
        return <Hotel className="w-5 h-5" />;
      case 'restaurant':
        return <Utensils className="w-5 h-5" />;
      case 'train':
        return <TrainFront className="w-5 h-5" />;
      case 'boat':
        return <Ship className="w-5 h-5" />;
      case 'bus':
        return <Bus className="w-5 h-5" />;
      case 'clinic':
        return <Activity className="w-5 h-5" />;
      case 'themepark':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const navItems = [
    {
      id: 'kiosk',
      label: 'Self Check-In Kiosk',
      icon: <QrCode className="w-4 h-4" />,
      badge: null,
      highlight: true,
    },
    {
      id: 'staff-desk',
      label: 'Staff Check-In Desk',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: totalCheckInsCount > 0 ? totalCheckInsCount : null,
    },
    {
      id: 'guest-portal',
      label: 'Guest Requests & Menu',
      icon: <Send className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'staff-dispatch',
      label: 'Worker Dispatch Console',
      icon: <Bell className="w-4 h-4" />,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      badgeColor: 'bg-amber-500 text-white animate-pulse',
    },
    {
      id: 'role-dealer',
      label: 'Secret Role Dealer',
      icon: <Users className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'pa-system',
      label: 'PA Soundboard',
      icon: <Volume2 className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'pass-generator',
      label: 'ID & Pass Cards',
      icon: <QrCode className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'gate7',
      label: '✈️ Gate 7 (Airport RP)',
      icon: <Plane className="w-4 h-4 text-cyan-400" />,
      badge: 'Game',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      id: 'patient-zero',
      label: '🧬 Patient Zero (Outbreak)',
      icon: <Activity className="w-4 h-4 text-rose-400" />,
      badge: 'Game',
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'game-master',
      label: 'Game Master & Scenarios',
      icon: <Dices className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'venue-settings',
      label: 'Venue Manager',
      icon: <Settings className="w-4 h-4" />,
      badge: null,
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-lg">
      {/* Top Branding Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/20">
            {renderVenueIcon(venue.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                {venue.name}
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-sky-400 border border-slate-700 capitalize">
                {venue.type} Roleplay
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {venue.tagline} • <span className="text-slate-300">{venue.locationName}</span>
            </p>
          </div>
        </div>

        {/* Local Device Info & Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Single-Device Local Mode</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset roleplay data on this device to default settings?')) {
                onResetState();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Reset to Default Demo State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Device</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none py-1">
        <nav className="flex space-x-1 min-w-max border-t border-slate-800/60 pt-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
