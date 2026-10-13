import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ShieldAlert,
  HeartPulse,
  UserCheck,
  Users,
  Timer,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronRight,
  BookOpen,
  Syringe,
  Skull,
  FileText,
  Flame,
  ArrowRight,
  Search,
} from 'lucide-react';
import {
  FictionalCure,
  OutbreakEvent,
  FICTIONAL_CURES,
  OUTBREAK_EVENTS,
} from '../data/patientZeroData';

export type PatientZeroPhase =
  | 'home'
  | 'setup'
  | 'reveal'
  | 'observation'
  | 'investigation'
  | 'accusations'
  | 'treatment'
  | 'results';

export interface PatientZeroPlayer {
  id: string;
  name: string;
  role: 'doctor' | 'infected' | 'citizen';
  secretChosenCureId?: string; // only for infected
  citizenAccusationSuspectId?: string; // citizen's secret vote
}

export interface PatientZeroGameState {
  phase: PatientZeroPhase;
  playerCount: number; // 3 to 6
  players: PatientZeroPlayer[];
  currentRevealIndex: number;
  revealCardShown: boolean;
  selectedCureOptions: FictionalCure[]; // 4 cures chosen for this round
  chosenCure: FictionalCure | null; // the one picked by Patient Zero
  roundDurationMinutes: number; // 5, 10, or 15
  timeRemainingSeconds: number;
  timerRunning: boolean;
  activeEvent: OutbreakEvent | null;
  usedEventIds: string[];
  soundMuted: boolean;
  currentAccusationIndex: number; // index into citizens for secret vote
  doctorTargetPlayerId?: string;
  doctorAdministeredCureId?: string;
}

const STORAGE_KEY = 'patient_zero_party_game_state_v1';

export const PatientZeroGame: React.FC<{ onBackToHub?: () => void }> = ({ onBackToHub }) => {
  const [gameState, setGameState] = useState<PatientZeroGameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      phase: 'home',
      playerCount: 4,
      players: [],
      currentRevealIndex: 0,
      revealCardShown: false,
      selectedCureOptions: [],
      chosenCure: null,
      roundDurationMinutes: 10,
      timeRemainingSeconds: 600,
      timerRunning: false,
      activeEvent: null,
      usedEventIds: [],
      soundMuted: false,
      currentAccusationIndex: 0,
    };
  });

  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showMedicalGuideModal, setShowMedicalGuideModal] = useState<boolean>(false);
  const [playerNamesInput, setPlayerNamesInput] = useState<string[]>([
    'Dr. Aris',
    'Subject 02',
    'Citizen 03',
    'Citizen 04',
  ]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // Audio Speech alert
  const speakBioAlert = (text: string) => {
    if (gameState.soundMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // fallback
    }
  };

  // Timer countdown
  useEffect(() => {
    const isTimedPhase = gameState.phase === 'observation' || gameState.phase === 'investigation';
    if (isTimedPhase && gameState.timerRunning) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeRemainingSeconds <= 1) {
            speakBioAlert('Bio-containment countdown reached zero. Proceeding to final citizen accusations.');
            return {
              ...prev,
              timeRemainingSeconds: 0,
              timerRunning: false,
              phase: 'accusations',
              currentAccusationIndex: 0,
            };
          }
          return {
            ...prev,
            timeRemainingSeconds: prev.timeRemainingSeconds - 1,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.phase, gameState.timerRunning]);

  // Handle player count selection
  const handleSelectPlayerCount = (count: number) => {
    const defaultNames = Array.from({ length: count }, (_, i) =>
      i === 0 ? 'Dr. Aris' : i === 1 ? 'Subject 02' : `Citizen 0${i + 1}`
    );
    setPlayerNamesInput(defaultNames);
    setGameState((prev) => ({
      ...prev,
      playerCount: count,
      phase: 'setup',
    }));
  };

  // Start game: assign 1 Doctor, 1 Infected, remaining Citizens
  const handleStartRoleAssignment = () => {
    const count = gameState.playerCount;
    const names = playerNamesInput.map((n, i) => n.trim() || `Player ${i + 1}`);

    // Randomize roles
    const indices = Array.from({ length: count }, (_, i) => i).sort(() => 0.5 - Math.random());
    const doctorIdx = indices[0];
    const infectedIdx = indices[1];
    const citizenIndices = indices.slice(2);

    const generatedPlayers: PatientZeroPlayer[] = new Array(count);
    generatedPlayers[doctorIdx] = {
      id: `pz-${doctorIdx + 1}`,
      name: names[doctorIdx],
      role: 'doctor',
    };
    generatedPlayers[infectedIdx] = {
      id: `pz-${infectedIdx + 1}`,
      name: names[infectedIdx],
      role: 'infected',
    };
    citizenIndices.forEach((cIdx) => {
      generatedPlayers[cIdx] = {
        id: `pz-${cIdx + 1}`,
        name: names[cIdx],
        role: 'citizen',
      };
    });

    // Randomly pick 4 cures from the 12 available cures
    const shuffledCures = [...FICTIONAL_CURES].sort(() => 0.5 - Math.random());
    const fourCures = shuffledCures.slice(0, 4);

    // Initial event
    const initialEvent = OUTBREAK_EVENTS[Math.floor(Math.random() * OUTBREAK_EVENTS.length)];

    setGameState({
      phase: 'reveal',
      playerCount: count,
      players: generatedPlayers,
      currentRevealIndex: 0,
      revealCardShown: false,
      selectedCureOptions: fourCures,
      chosenCure: null,
      roundDurationMinutes: gameState.roundDurationMinutes,
      timeRemainingSeconds: gameState.roundDurationMinutes * 60,
      timerRunning: false,
      activeEvent: initialEvent,
      usedEventIds: [initialEvent.id],
      soundMuted: gameState.soundMuted,
      currentAccusationIndex: 0,
    });
  };

  // Draw new outbreak event
  const handleDrawNewEvent = () => {
    const available = OUTBREAK_EVENTS.filter((e) => !gameState.usedEventIds.includes(e.id));
    const pool = available.length > 0 ? available : OUTBREAK_EVENTS;
    const drawn = pool[Math.floor(Math.random() * pool.length)];

    setGameState((prev) => ({
      ...prev,
      activeEvent: drawn,
      usedEventIds: prev.usedEventIds.includes(drawn.id) ? prev.usedEventIds : [...prev.usedEventIds, drawn.id],
    }));

    speakBioAlert(`Outbreak Alert: ${drawn.title}. ${drawn.instructions}`);
  };

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /* ---------------- RENDERS ---------------- */

  // 1. HOME SCREEN
  if (gameState.phase === 'home') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
        {/* Bento Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/50">
                  REAL-LIFE OUTBREAK MYSTERY
                </span>
                <span className="text-xs font-semibold text-emerald-400">LEVEL 4 BIO-CONTAINMENT</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">PATIENT ZERO</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              <HelpCircle className="w-4 h-4 text-rose-400" />
              <span>HOW TO PLAY</span>
            </button>
            {onBackToHub && (
              <button
                onClick={onBackToHub}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-800 transition"
              >
                Back to Hub
              </button>
            )}
          </div>
        </div>

        {/* Bento Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border-2 border-rose-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold">
              <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" /> Fictional Outbreak Deduction • Shared Device
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              A Classified Infection Has Spread. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-300 to-emerald-300">
                Can the Doctor Find the Cure?
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              One player is secretly infected, subtly acting out behavioral symptoms matching their secret cure. The Doctor must deduce the correct cure, while Citizens attempt to discover the infected carrier before time expires!
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div className="pt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Select Number of Players (3 to 6):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  onClick={() => handleSelectPlayerCount(count)}
                  className="group p-4 rounded-2xl bg-slate-950 hover:bg-rose-950/60 border-2 border-slate-800 hover:border-rose-500 text-center transition transform hover:-translate-y-1 shadow-lg"
                >
                  <div className="text-2xl font-black text-white group-hover:text-rose-300">{count} PLAYERS</div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    1 Doc + 1 Infected + {count - 2} Citizen{count - 2 > 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-lg">
              🧬
            </div>
            <h3 className="font-bold text-white text-base">Subtle Actable Symptoms</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Patient Zero secretly chooses 1 of 4 fictional cures. Each cure has distinct, real-life observable physical cues and speech habits.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
              🩺
            </div>
            <h3 className="font-bold text-white text-base">Fictional Medical Guide</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Doctor and Citizens can consult the fictional symptom reference guide anytime to logically isolate which antidote works.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
              💉
            </div>
            <h3 className="font-bold text-white text-base">One Treatment Attempt</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In the final phase, the Doctor chooses who to inoculate and which antidote to administer. Wrong choice loses the patient!
            </p>
          </div>
        </div>

        {/* Rules Modal */}
        {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
      </div>
    );
  }

  // 2. SETUP SCREEN
  if (gameState.phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                BIO-CONTAINMENT PROTOCOL • {gameState.playerCount} PLAYERS
              </span>
              <h2 className="text-2xl font-black text-white">Enter Player Code-names</h2>
            </div>
            <button
              onClick={() => setGameState((p) => ({ ...p, phase: 'home' }))}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            {playerNamesInput.map((name, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Player {idx + 1}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const updated = [...playerNamesInput];
                      updated[idx] = e.target.value;
                      setPlayerNamesInput(updated);
                    }}
                    placeholder={`Player ${idx + 1}`}
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Investigation Timer Length */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Investigation Round Length:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 5, label: 'Quick Outbreak', sub: '5 minutes' },
                { mins: 10, label: 'Normal Outbreak', sub: '10 minutes' },
                { mins: 15, label: 'Extended Bio-Crisis', sub: '15 minutes' },
              ].map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() =>
                    setGameState((prev) => ({
                      ...prev,
                      roundDurationMinutes: opt.mins,
                      timeRemainingSeconds: opt.mins * 60,
                    }))
                  }
                  className={`p-3 rounded-xl border text-center transition ${
                    gameState.roundDurationMinutes === opt.mins
                      ? 'bg-rose-950 border-rose-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="font-bold text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-500">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setGameState((p) => ({ ...p, phase: 'home' }))}
              className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Back
            </button>
            <button
              onClick={handleStartRoleAssignment}
              className="flex-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <span>DISPATCH CLASSIFIED DOSSIERS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. PRIVATE ROLE REVEAL & CURE SELECTION
  if (gameState.phase === 'reveal') {
    const curIndex = gameState.currentRevealIndex;
    const currentPlayer = gameState.players[curIndex];
    const isAllDone = curIndex >= gameState.players.length;

    if (isAllDone) {
      return (
        <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/40 mx-auto flex items-center justify-center text-3xl">
              🧬
            </div>
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                ALL PLAYERS READY & BRIEFED
              </span>
              <h2 className="text-3xl font-black text-white mt-1">BEGIN OBSERVATION & INVESTIGATION</h2>
              <p className="text-slate-300 text-sm mt-2">
                All classified roles and symptoms have been secretly set. Place the device on the table so everyone can see the timer!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed text-left space-y-1">
              <p className="font-bold text-white">Investigation Rules:</p>
              <p>• Patient Zero must begin subtly acting out their assigned physical and verbal symptoms.</p>
              <p>• The Doctor and Citizens observe behavior, ask casual questions, and consult the Medical Guide.</p>
              <p>• When the timer expires, Citizens vote secretly on who is infected, followed by the Doctor’s final cure decision.</p>
            </div>

            <button
              onClick={() => {
                setGameState((prev) => ({
                  ...prev,
                  phase: 'investigation',
                  timeRemainingSeconds: prev.roundDurationMinutes * 60,
                  timerRunning: true,
                }));
                speakBioAlert('Containment protocol started. Begin normal conversation and medical observation.');
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-black text-base shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <span>START INVESTIGATION TIMER</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        {!gameState.revealCardShown ? (
          // PASS DEVICE INTERSTITIAL
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-rose-400 mx-auto flex items-center justify-center text-2xl font-black border border-slate-700">
              {curIndex + 1}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                RESTRICTED DOSSIER REVEAL
              </span>
              <h2 className="text-3xl font-black text-white">{currentPlayer.name}</h2>
              <p className="text-slate-400 text-sm">
                Make sure nobody else is looking at this screen!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              Hand the device to <strong className="text-white">{currentPlayer.name}</strong> only. Keep your classified role strictly secret.
            </div>

            <button
              onClick={() => setGameState((p) => ({ ...p, revealCardShown: true }))}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-base shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              <span>REVEAL MY ROLE</span>
            </button>
          </div>
        ) : (
          // CLASSIFIED ROLE CARD
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/60 border-2 border-rose-500/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase">
                  CLASSIFIED MEDICAL DOSSIER
                </span>
                <h3 className="text-2xl font-black text-white">{currentPlayer.name}</h3>
              </div>
              <span
                className={`px-3 py-1 text-xs font-black rounded-full uppercase border ${
                  currentPlayer.role === 'doctor'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : currentPlayer.role === 'infected'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {currentPlayer.role === 'doctor'
                  ? '🩺 THE DOCTOR'
                  : currentPlayer.role === 'infected'
                  ? '🧬 PATIENT ZERO (INFECTED)'
                  : '🛡️ CITIZEN'}
              </span>
            </div>

            {/* Role Instructions based on type */}
            {currentPlayer.role === 'doctor' && (
              <div className="bg-slate-950/90 border border-blue-500/40 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                  DOCTOR’S OBJECTIVE:
                </span>
                <h4 className="text-lg font-bold text-white">Identify the Infected & Administer the Correct Cure</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You do NOT know who is infected or which cure is right. Observe all players during the game and consult the Fictional Medical Reference Guide. At the end, you will choose 1 player to inoculate and 1 fictional cure to inject!
                </p>
              </div>
            )}

            {currentPlayer.role === 'citizen' && (
              <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                  CITIZEN’S OBJECTIVE:
                </span>
                <h4 className="text-lg font-bold text-white">Expose Patient Zero</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are healthy. Observe the group carefully for subtle, repetitive symptoms (finger tapping, throat clearing, hand rubbing, eye shifts). You will submit your secret accusation before the final treatment!
                </p>
              </div>
            )}

            {currentPlayer.role === 'infected' && (
              <div className="bg-slate-950/90 border border-rose-500/50 rounded-2xl p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                    PATIENT ZERO SECRET SELECTION:
                  </span>
                  <h4 className="text-lg font-bold text-white">Choose Your Secret Cure</h4>
                  <p className="text-xs text-slate-300">
                    Select ONE cure below. You must subtly act out the symptoms associated with this cure throughout the entire game!
                  </p>
                </div>

                {/* 4 Cure Selection Radio/Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {gameState.selectedCureOptions.map((cure) => {
                    const isSelected = gameState.chosenCure?.id === cure.id;
                    return (
                      <button
                        key={cure.id}
                        onClick={() => {
                          setGameState((prev) => ({
                            ...prev,
                            chosenCure: cure,
                            players: prev.players.map((p) =>
                              p.id === currentPlayer.id ? { ...p, secretChosenCureId: cure.id } : p
                            ),
                          }));
                        }}
                        className={`p-3 rounded-xl border text-left transition space-y-1 ${
                          isSelected
                            ? 'bg-rose-950 border-rose-400 text-white ring-2 ring-rose-500/40'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{cure.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{cure.code}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {cure.symptoms.summary}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* If selected, show detailed actable symptoms */}
                {gameState.chosenCure && (
                  <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/60 space-y-2 text-xs">
                    <span className="font-bold text-rose-300 uppercase tracking-wider block">
                      YOUR MANDATORY SYMPTOMS TO ACT OUT:
                    </span>
                    <p className="text-slate-200">
                      • <strong className="text-white">Physical Cue: </strong>
                      {gameState.chosenCure.symptoms.primaryPhysical}
                    </p>
                    <p className="text-slate-200">
                      • <strong className="text-white">Speech Habit: </strong>
                      {gameState.chosenCure.symptoms.speechPattern}
                    </p>
                    <p className="text-slate-200">
                      • <strong className="text-white">Behavioral Trigger: </strong>
                      {gameState.chosenCure.symptoms.behavioralTrigger}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hide & Pass button */}
            <button
              disabled={currentPlayer.role === 'infected' && !gameState.chosenCure}
              onClick={() => {
                if (currentPlayer.role === 'infected' && !gameState.chosenCure) {
                  alert('Patient Zero must select a cure before passing!');
                  return;
                }
                setGameState((prev) => ({
                  ...prev,
                  currentRevealIndex: prev.currentRevealIndex + 1,
                  revealCardShown: false,
                }));
              }}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border border-slate-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span>
                HIDE & PASS DEVICE {curIndex + 1 < gameState.players.length ? `TO ${gameState.players[curIndex + 1].name}` : ''}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. OBSERVATION & INVESTIGATION PHASE
  if (gameState.phase === 'investigation') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
        {/* Top Operations Bento Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔬</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
                  INVESTIGATION IN PROGRESS
                </span>
                <span className="text-xs font-bold text-white uppercase">BIO-CONTAINMENT TERMINAL</span>
              </div>
              <p className="text-xs text-slate-400">Observe player habits, ask probing questions, and deduce the cure!</p>
            </div>
          </div>

          {/* Timers & Controls */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 font-mono ${
              gameState.timeRemainingSeconds <= 60
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-emerald-300'
            }`}>
              <Timer className="w-4 h-4 text-rose-400" />
              <span className="text-xl font-black">{formatTime(gameState.timeRemainingSeconds)}</span>
            </div>

            <button
              onClick={() => setGameState((p) => ({ ...p, timerRunning: !p.timerRunning }))}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              title={gameState.timerRunning ? 'Pause Investigation' : 'Resume Timer'}
            >
              {gameState.timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setGameState((p) => ({ ...p, soundMuted: !p.soundMuted }))}
              className={`p-2.5 rounded-xl border transition ${
                gameState.soundMuted ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-rose-950 border-rose-800 text-rose-400'
              }`}
              title="Toggle Audio"
            >
              {gameState.soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowMedicalGuideModal(true)}
              className="px-3 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-500/50 text-blue-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Medical Guide</span>
            </button>

            <button
              onClick={() => setShowRulesModal(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Rules"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Heartbeat EKG Pulse Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              FACILITY SENSORS ONLINE • OBSERVING 4 ACTIVE SERUMS
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 hidden sm:block">
            ACTIVE CURES IN PLAY: {gameState.selectedCureOptions.map((c) => c.name).join(' | ')}
          </div>
        </div>

        {/* Random Outbreak Event Card */}
        {gameState.activeEvent && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/50 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> OUTBREAK LAB INCIDENT
              </span>

              <button
                onClick={handleDrawNewEvent}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>NEW EVENT</span>
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-white">{gameState.activeEvent.title}</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {gameState.activeEvent.description}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-1.5">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                LAB INSTRUCTIONS FOR ALL SUBJECTS:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {gameState.activeEvent.instructions}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Bento Control Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Ready to initiate final protocol? The Doctor and Citizens will submit secret decisions!
          </div>

          <button
            onClick={() => {
              setGameState((prev) => ({
                ...prev,
                phase: 'accusations',
                timerRunning: false,
                currentAccusationIndex: 0,
              }));
              speakBioAlert('Observation period closed. Beginning confidential citizen accusations.');
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2"
          >
            <span>PROCEED TO FINAL ACCUSATIONS</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Modals */}
        {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
        {showMedicalGuideModal && (
          <MedicalGuideModal
            cureOptions={gameState.selectedCureOptions}
            onClose={() => setShowMedicalGuideModal(false)}
          />
        )}
      </div>
    );
  }

  // 5. FINAL ACCUSATIONS PHASE (Citizens secret vote)
  if (gameState.phase === 'accusations') {
    const citizens = gameState.players.filter((p) => p.role === 'citizen');
    const curCitizen = citizens[gameState.currentAccusationIndex];

    if (!curCitizen) {
      // All citizens have submitted! Move to doctor treatment phase
      return (
        <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/20 text-blue-400 border border-blue-500/40 mx-auto flex items-center justify-center text-3xl">
              🩺
            </div>
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                ALL CITIZEN ACCUSATIONS RECORDED
              </span>
              <h2 className="text-3xl font-black text-white mt-1">THE DOCTOR’S TREATMENT</h2>
              <p className="text-slate-300 text-sm mt-2">
                Hand the device to <strong className="text-white">{gameState.players.find((p) => p.role === 'doctor')?.name}</strong>. Only the Doctor may view the final inoculation screen!
              </p>
            </div>

            <button
              onClick={() => setGameState((p) => ({ ...p, phase: 'treatment' }))}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-base shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <span>DOCTOR: OPEN TREATMENT RIG</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    const suspectOptions = gameState.players.filter((p) => p.id !== curCitizen.id);

    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 text-center sm:text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              CITIZEN ACCUSATION #{gameState.currentAccusationIndex + 1}
            </span>
            <h2 className="text-2xl font-black text-white mt-2">
              {curCitizen.name}: Who is Patient Zero?
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Privately select the person you believe is secretly infected. Keep your choice hidden from other players!
            </p>
          </div>

          <div className="space-y-2">
            {suspectOptions.map((suspect) => (
              <button
                key={suspect.id}
                onClick={() => {
                  const updatedPlayers = gameState.players.map((p) =>
                    p.id === curCitizen.id ? { ...p, citizenAccusationSuspectId: suspect.id } : p
                  );
                  setGameState((prev) => ({
                    ...prev,
                    players: updatedPlayers,
                    currentAccusationIndex: prev.currentAccusationIndex + 1,
                  }));
                }}
                className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    👤
                  </span>
                  <span className="font-bold text-white text-sm group-hover:text-emerald-300">
                    {suspect.name}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 6. DOCTOR TREATMENT PHASE
  if (gameState.phase === 'treatment') {
    const doctor = gameState.players.find((p) => p.role === 'doctor');
    const possiblePatients = gameState.players.filter((p) => p.role !== 'doctor');

    const handleConfirmTreatment = () => {
      if (!gameState.doctorTargetPlayerId || !gameState.doctorAdministeredCureId) {
        alert('Doctor must select both a patient to treat and a cure to administer!');
        return;
      }
      setGameState((p) => ({ ...p, phase: 'results' }));
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 text-center sm:text-left flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-2 py-0.5 rounded bg-blue-950 border border-blue-800">
                DOCTOR’S FINAL PROTOCOL
              </span>
              <h2 className="text-2xl font-black text-white mt-2">
                {doctor?.name}: Administer Treatment
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                You have ONE attempt. You must choose which subject is infected AND which fictional cure will save them!
              </p>
            </div>

            <button
              onClick={() => setShowMedicalGuideModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 text-xs font-bold border border-blue-500/40"
            >
              Medical Guide
            </button>
          </div>

          {/* STEP 1: Select Subject */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase block">
              1. Which player do you believe is Patient Zero?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {possiblePatients.map((p) => {
                const isSelected = gameState.doctorTargetPlayerId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setGameState((prev) => ({ ...prev, doctorTargetPlayerId: p.id }))}
                    className={`p-3 rounded-xl border text-center transition ${
                      isSelected
                        ? 'bg-blue-950 border-blue-400 text-white font-bold ring-2 ring-blue-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Select Fictional Cure */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase block">
              2. Which fictional cure will you inject?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gameState.selectedCureOptions.map((cure) => {
                const isSelected = gameState.doctorAdministeredCureId === cure.id;
                return (
                  <button
                    key={cure.id}
                    onClick={() => setGameState((prev) => ({ ...prev, doctorAdministeredCureId: cure.id }))}
                    className={`p-3.5 rounded-xl border text-left transition space-y-1 ${
                      isSelected
                        ? 'bg-blue-950 border-blue-400 text-white ring-2 ring-blue-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{cure.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{cure.code}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {cure.symptoms.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleConfirmTreatment}
            disabled={!gameState.doctorTargetPlayerId || !gameState.doctorAdministeredCureId}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Syringe className="w-4 h-4" />
            <span>INJECT CURE & REVEAL RESULTS</span>
          </button>
        </div>

        {showMedicalGuideModal && (
          <MedicalGuideModal
            cureOptions={gameState.selectedCureOptions}
            onClose={() => setShowMedicalGuideModal(false)}
          />
        )}
      </div>
    );
  }

  // 7. FINAL RESULTS PHASE
  if (gameState.phase === 'results') {
    const infectedPlayer = gameState.players.find((p) => p.role === 'infected');
    const doctorPlayer = gameState.players.find((p) => p.role === 'doctor');
    const citizens = gameState.players.filter((p) => p.role === 'citizen');

    // Doctor Result
    const doctorCorrectTarget = gameState.doctorTargetPlayerId === infectedPlayer?.id;
    const doctorCorrectCure = gameState.doctorAdministeredCureId === gameState.chosenCure?.id;
    const doctorWon = doctorCorrectTarget && doctorCorrectCure;

    // Citizens Result
    const successfulCitizens = citizens.filter((c) => c.citizenAccusationSuspectId === infectedPlayer?.id);
    const citizensWon = successfulCitizens.length > 0;

    // Infected Result: wins if avoided being accused by ALL citizens AND doctor failed
    const infectedWon = successfulCitizens.length === 0 && !doctorWon;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Main Outcome Header */}
          <div className="text-center space-y-3">
            <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-3xl border ${
              doctorWon
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}>
              {doctorWon ? '💉' : '⚠️'}
            </div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
              OFFICIAL BIO-DEBRIEFING
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {doctorWon ? (
                <span className="text-emerald-400">TREATMENT SUCCESSFUL — PATIENT SURVIVED</span>
              ) : (
                <span className="text-rose-400">TREATMENT FAILED — PATIENT LOST</span>
              )}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
              Patient Zero was <strong className="text-white">{infectedPlayer?.name}</strong> carrying{' '}
              <strong className="text-rose-400">{gameState.chosenCure?.name}</strong> ({gameState.chosenCure?.code}).
            </p>
          </div>

          {/* Victory Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              doctorWon ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="text-xs font-bold uppercase">Doctor Victory</div>
              <div className="text-lg font-black text-white">{doctorWon ? 'SUCCESS' : 'FAILED'}</div>
              <p className="text-[10px]">
                {doctorWon ? 'Identified infected & administered correct cure' : 'Incorrect target or wrong cure'}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              citizensWon ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="text-xs font-bold uppercase">Citizens Victory</div>
              <div className="text-lg font-black text-white">{citizensWon ? 'EXPOSED' : 'FOOLED'}</div>
              <p className="text-[10px]">
                {successfulCitizens.length} citizen(s) identified Patient Zero
              </p>
            </div>

            <div className={`p-4 rounded-2xl border text-center space-y-1 ${
              infectedWon ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}>
              <div className="text-xs font-bold uppercase">Patient Zero Victory</div>
              <div className="text-lg font-black text-white">{infectedWon ? 'EVADED' : 'CAUGHT'}</div>
              <p className="text-[10px]">
                {infectedWon ? 'Fooled all citizens and doctor failed' : 'Detected or cured'}
              </p>
            </div>
          </div>

          {/* Full Dossiers */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Outbreak Dossiers & Accusation Records:
            </h3>

            {gameState.players.map((p) => {
              const accusedName = gameState.players.find((s) => s.id === p.citizenAccusationSuspectId)?.name;
              return (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 uppercase">
                        {p.role}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {p.role === 'doctor' && (
                        <>Treated: {gameState.players.find((t) => t.id === gameState.doctorTargetPlayerId)?.name} with {FICTIONAL_CURES.find((c) => c.id === gameState.doctorAdministeredCureId)?.name}</>
                      )}
                      {p.role === 'citizen' && (
                        <>Accused: {accusedName} {accusedName === infectedPlayer?.name ? '✓ (Correct)' : '✗'}</>
                      )}
                      {p.role === 'infected' && (
                        <span className="text-rose-400 font-bold">CARRIER: {gameState.chosenCure?.name}</span>
                      )}
                    </span>
                  </div>

                  {p.role === 'infected' && gameState.chosenCure && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-rose-500/30 text-[11px] text-slate-300 space-y-1">
                      <p><strong className="text-rose-300">Active Symptoms: </strong> {gameState.chosenCure.symptoms.summary}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartRoleAssignment}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN (NEW CURES & ROLES)</span>
            </button>

            <button
              onClick={() => setGameState((p) => ({ ...p, phase: 'home' }))}
              className="py-4 px-8 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Medical Reference Guide Modal
const MedicalGuideModal: React.FC<{
  cureOptions: FictionalCure[];
  onClose: () => void;
}> = ({ cureOptions, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-blue-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <h3 className="text-xl font-black text-white">FICTIONAL MEDICAL REFERENCE GUIDE</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400">
          The 4 potential cures in play for this outbreak. Observe patient physical gestures, speech cadence, and behavioral reactions to identify which symptoms match!
        </p>

        <div className="space-y-4">
          {cureOptions.map((cure) => (
            <div key={cure.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-cyan-300">{cure.name}</h4>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  CODE: {cure.code}
                </span>
              </div>
              <p className="text-xs text-slate-400">{cure.description}</p>
              <div className="text-xs space-y-1 pt-1 border-t border-slate-900 text-slate-300">
                <p>• <strong className="text-white">Physical Cue: </strong>{cure.symptoms.primaryPhysical}</p>
                <p>• <strong className="text-white">Speech Pattern: </strong>{cure.symptoms.speechPattern}</p>
                <p>• <strong className="text-white">Behavioral Trigger: </strong>{cure.symptoms.behavioralTrigger}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition"
        >
          Close Reference Guide
        </button>
      </div>
    </div>
  );
};

// Rules Modal
const RulesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-rose-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧬</span>
            <h3 className="text-xl font-black text-white">PATIENT ZERO — OFFICIAL RULES</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <div className="text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            <strong>PATIENT ZERO</strong> is a real-life party mystery for 3–6 friends sharing one phone or tablet. All medical elements are completely fictional and designed for entertainment.
          </p>

          <div className="space-y-2">
            <h4 className="font-bold text-rose-400 uppercase text-xs tracking-wider">How to Play:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong>Pass & Reveal:</strong> Each player secretly views their role. One player is secretly <em>Patient Zero</em>, one is the <em>Doctor</em>, and the rest are <em>Citizens</em>.
              </li>
              <li>
                <strong>Secret Cure Pick:</strong> Patient Zero secretly chooses 1 of 4 cures, which provides a distinct set of subtle physical & verbal symptoms to act out in person.
              </li>
              <li>
                <strong>Observation Phase:</strong> Players converse, question each other, and consult the Medical Reference Guide.
              </li>
              <li>
                <strong>Citizen Accusation:</strong> Citizens secretly vote on who they believe is infected.
              </li>
              <li>
                <strong>Doctor Treatment:</strong> The Doctor chooses 1 player to inoculate and 1 fictional cure to inject.
              </li>
              <li>
                <strong>Win Conditions:</strong> Citizens win by naming the infected player. The Doctor wins by naming the infected player AND administering the correct cure. Patient Zero wins if they avoid all citizen accusations and the doctor fails!
              </li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition"
        >
          Got it, Return to Game
        </button>
      </div>
    </div>
  );
};
