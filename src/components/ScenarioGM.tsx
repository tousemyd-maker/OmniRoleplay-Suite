import React, { useState } from 'react';
import {
  Dices,
  Sparkles,
  Plane,
  Activity,
  ChevronRight,
  ShieldAlert,
  Play,
  RotateCcw,
  BookOpen,
  Users,
  Compass,
} from 'lucide-react';
import { ScenarioPrompt, VenueConfig } from '../types';
import { Gate7Game } from './Gate7Game';
import { PatientZeroGame } from './PatientZeroGame';

interface ScenarioGMProps {
  venue: VenueConfig;
  scenarios: ScenarioPrompt[];
  onAddScenario: (scenario: ScenarioPrompt) => void;
  onNavigateToTab?: (tabId: string) => void;
}

export const ScenarioGM: React.FC<ScenarioGMProps> = ({
  venue,
  scenarios,
  onAddScenario,
  onNavigateToTab,
}) => {
  const [activeGame, setActiveGame] = useState<'hub' | 'gate7' | 'patient-zero'>('hub');
  const [activeScenario, setActiveScenario] = useState<ScenarioPrompt | null>(scenarios[0] || null);

  const handleDrawRandomScenario = () => {
    if (scenarios.length === 0) return;
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    setActiveScenario(scenarios[randomIndex]);
  };

  // If playing Gate 7
  if (activeGame === 'gate7') {
    return (
      <div className="space-y-4">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <button
            onClick={() => setActiveGame('hub')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition"
          >
            ← Back to Game Master Hub
          </button>
        </div>
        <Gate7Game onBackToHub={() => setActiveGame('hub')} />
      </div>
    );
  }

  // If playing Patient Zero
  if (activeGame === 'patient-zero') {
    return (
      <div className="space-y-4">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <button
            onClick={() => setActiveGame('hub')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition"
          >
            ← Back to Game Master Hub
          </button>
        </div>
        <PatientZeroGame onBackToHub={() => setActiveGame('hub')} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Bento Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Dices className="w-3.5 h-3.5" /> Game Master & Scenarios Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Party Games & Story Event Engine
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Launch complete physical party games with your friends or draw spontaneous roleplay twists!
          </p>
        </div>

        <button
          onClick={handleDrawRandomScenario}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
        >
          <Dices className="w-4 h-4" />
          <span>Draw Random Plot Twist</span>
        </button>
      </div>

      {/* Featured Real-Life Party Games Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              FEATURED PARTY GAMES
            </span>
            <h3 className="text-xl font-black text-white">Full Social Deduction & Mystery Games</h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Single shared phone/tablet • Real-world physical roleplay
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GAME 1: GATE 7 */}
          <div className="group bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800">
                <Plane className="w-3.5 h-3.5 text-cyan-400" /> 2–4 PLAYERS
              </span>
              <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 uppercase">
                Gate 7 Departure
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white group-hover:text-cyan-300 transition">
                ✈️ GATE 7
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The complete real-life airport party game. Secretly become a Passenger or Airport Worker, fulfill 80+ verifiable social objectives across 6 airport stages, and race to Gate 7 boarding before final call!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-400">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-white font-bold">80+ Missions</div>
                <div>Passenger & Worker</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-white font-bold">6 Stages</div>
                <div>Check-In to Gate 7</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-white font-bold">Final Guess</div>
                <div>Investigation Mode</div>
              </div>
            </div>

            <button
              onClick={() => setActiveGame('gate7')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-600/30 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>PLAY GATE 7 NOW</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* GAME 2: PATIENT ZERO */}
          <div className="group bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border-2 border-rose-500/40 hover:border-rose-400 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 border border-rose-800">
                <Activity className="w-3.5 h-3.5 text-rose-400" /> 3–6 PLAYERS
              </span>
              <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 uppercase">
                Outbreak Deduction
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white group-hover:text-rose-300 transition">
                🧬 PATIENT ZERO
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A mysterious infection has struck! One player is Patient Zero secretly acting out subtle physical symptoms matching their chosen fictional cure. The Doctor must deduce the right cure before patient loss.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-400">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-white font-bold">12 Cures</div>
                <div>Fictional Serums</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-white font-bold">Acted Symptoms</div>
                <div>Subtle Gestures</div>
              </div>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-white font-bold">1 Inoculation</div>
                <div>High Stakes Decision</div>
              </div>
            </div>

            <button
              onClick={() => setActiveGame('patient-zero')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>PLAY PATIENT ZERO NOW</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Venue Scenario Plot Twist Display */}
      {activeScenario && (
        <div className="bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-purple-500/30 pb-4">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Active Venue Scenario Twist
            </span>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                activeScenario.difficulty === 'Easy'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : activeScenario.difficulty === 'Medium'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {activeScenario.difficulty} Difficulty
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black text-white">{activeScenario.title}</h3>
            <p className="text-slate-200 text-sm leading-relaxed max-w-3xl">
              {activeScenario.description}
            </p>
          </div>

          {/* Trigger Challenges */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Story Event Triggers & Objectives:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeScenario.eventTriggers.map((trig, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 text-xs font-semibold text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{trig}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scenario Deck List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <h3 className="font-bold text-white text-base">Venue Scenario Deck ({scenarios.length})</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc)}
              className={`p-4 rounded-xl border text-left transition space-y-2 ${
                activeScenario?.id === sc.id
                  ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/50'
                  : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">{sc.title}</h4>
                <span className="text-[10px] font-bold text-purple-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                  {sc.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{sc.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
