import React, { useState, useEffect, useRef } from 'react';
import {
  Plane,
  Shield,
  Luggage,
  Users,
  Timer,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  UserCheck,
  Compass,
  ArrowRight,
  Share2,
  Flame,
  Award,
  Search,
} from 'lucide-react';
import {
  Gate7Mission,
  Gate7Event,
  GATE7_PASSENGER_MISSIONS,
  GATE7_WORKER_MISSIONS,
  GATE7_AIRPORT_EVENTS,
  GATE7_RELATIONSHIPS,
} from '../data/gate7Data';

export type Gate7GamePhase =
  | 'home'
  | 'setup'
  | 'reveal'
  | 'gameplay'
  | 'verification'
  | 'guessing'
  | 'results';

export interface Gate7Player {
  id: string;
  name: string;
  role: 'passenger' | 'worker';
  teammateId?: string;
  teammateName?: string;
  relationshipBackstory?: string;
  mission: Gate7Mission;
  claimedCompleted?: boolean;
  completionConfirmed?: boolean;
  completionStory?: string;
  guessOpponentMission?: string;
  guessCorrect?: boolean;
}

export interface Gate7GameState {
  phase: Gate7GamePhase;
  playerCount: 2 | 3 | 4;
  players: Gate7Player[];
  currentRevealIndex: number;
  revealCardShown: boolean;
  currentStageIndex: number; // 0 to 5
  flightDurationMinutes: number; // 1, 2, or 3
  timeRemainingSeconds: number;
  timerRunning: boolean;
  activeEvent: Gate7Event | null;
  usedEventIds: string[];
  soundMuted: boolean;
  currentGuessPlayerIndex: number;
}

const STAGES = [
  { index: 0, name: 'Check-In Counter', tag: 'STAGE 1', icon: '🛅', desc: 'Introductions, tickets, and baggage drops' },
  { index: 1, name: 'Security Screening', tag: 'STAGE 2', icon: '🛂', desc: 'X-rays, metal detectors, and luggage checks' },
  { index: 2, name: 'Duty Free Concourse', tag: 'STAGE 3', icon: '🛍️', desc: 'Luxury boutiques, perfumes, and transit snacks' },
  { index: 3, name: 'Airport VIP Lounge', tag: 'STAGE 4', icon: '☕', desc: 'Waiting area, charging sockets, and quiet chats' },
  { index: 4, name: 'Gate Area Concourse', tag: 'STAGE 5', icon: '💺', desc: 'Pre-boarding queues, document checks, and final calls' },
  { index: 5, name: 'Gate 7 Boarding', tag: 'FINAL STAGE', icon: '✈️', desc: 'Jet bridge doors open — final call for departure!' },
];

const STORAGE_KEY = 'gate7_party_game_state_v1';

export const Gate7Game: React.FC<{ onBackToHub?: () => void }> = ({ onBackToHub }) => {
  // Load initial state or defaults
  const [gameState, setGameState] = useState<Gate7GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      phase: 'home',
      playerCount: 3,
      players: [],
      currentRevealIndex: 0,
      revealCardShown: false,
      currentStageIndex: 0,
      flightDurationMinutes: 2,
      timeRemainingSeconds: 120,
      timerRunning: false,
      activeEvent: null,
      usedEventIds: [],
      soundMuted: false,
      currentGuessPlayerIndex: 0,
    };
  });

  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [playerNamesInput, setPlayerNamesInput] = useState<string[]>(['Player 1', 'Player 2', 'Player 3']);
  const [customGuessText, setCustomGuessText] = useState<string>('');
  const [selectedGuessOption, setSelectedGuessOption] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // Audio Speech Chime Announcement
  const speakAnnouncement = (text: string) => {
    if (gameState.soundMuted) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // fallback
    }
  };

  // Stage Timer
  useEffect(() => {
    if (gameState.phase === 'gameplay' && gameState.timerRunning) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeRemainingSeconds <= 1) {
            // Stage time finished!
            speakAnnouncement('Attention passengers. Stage time expired. Time to move on toward Gate 7.');
            return {
              ...prev,
              timeRemainingSeconds: 0,
              timerRunning: false,
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

  // Start new game setup
  const handleSelectPlayerCount = (count: 2 | 3 | 4) => {
    const defaultNames = Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
    setPlayerNamesInput(defaultNames);
    setGameState((prev) => ({
      ...prev,
      playerCount: count,
      phase: 'setup',
    }));
  };

  // Generate roles, secret missions, relationships
  const handleStartRoleAssignment = () => {
    const count = gameState.playerCount;
    const names = playerNamesInput.map((n, i) => n.trim() || `Player ${i + 1}`);

    // Shuffle missions pool
    const passengerPool = [...GATE7_PASSENGER_MISSIONS].sort(() => 0.5 - Math.random());
    const workerPool = [...GATE7_WORKER_MISSIONS].sort(() => 0.5 - Math.random());

    let generatedPlayers: Gate7Player[] = [];

    if (count === 2) {
      // 1 Passenger, 1 Worker
      const isPassengerFirst = Math.random() < 0.5;
      const role1 = isPassengerFirst ? 'passenger' : 'worker';
      const role2 = isPassengerFirst ? 'worker' : 'passenger';

      // 20% chance of shared relationship backstory
      const hasBackstory = Math.random() < 0.20;
      const backstory = hasBackstory
        ? GATE7_RELATIONSHIPS[Math.floor(Math.random() * GATE7_RELATIONSHIPS.length)]
        : undefined;

      const p1Mission = role1 === 'passenger' ? passengerPool[0] : workerPool[0];
      const p2Mission = role2 === 'passenger' ? passengerPool[1] : workerPool[1];

      generatedPlayers = [
        {
          id: 'p-1',
          name: names[0],
          role: role1,
          mission: p1Mission,
          relationshipBackstory: backstory,
        },
        {
          id: 'p-2',
          name: names[1],
          role: role2,
          mission: p2Mission,
          relationshipBackstory: backstory,
        },
      ];
    } else if (count === 3) {
      // Config A: 2 Passengers + 1 Worker OR Config B: 2 Workers + 1 Passenger
      const configA = Math.random() < 0.5;
      const teamRole: 'passenger' | 'worker' = configA ? 'passenger' : 'worker';
      const soloRole: 'passenger' | 'worker' = configA ? 'worker' : 'passenger';

      // Pick which 2 players are on the team
      const indices = [0, 1, 2].sort(() => 0.5 - Math.random());
      const teamIdx1 = indices[0];
      const teamIdx2 = indices[1];
      const soloIdx = indices[2];

      const sharedMission = teamRole === 'passenger' ? passengerPool[0] : workerPool[0];
      const soloMission = soloRole === 'passenger' ? passengerPool[1] : workerPool[1];

      generatedPlayers = new Array(3);
      generatedPlayers[teamIdx1] = {
        id: `p-${teamIdx1 + 1}`,
        name: names[teamIdx1],
        role: teamRole,
        teammateId: `p-${teamIdx2 + 1}`,
        teammateName: names[teamIdx2],
        mission: sharedMission,
      };
      generatedPlayers[teamIdx2] = {
        id: `p-${teamIdx2 + 1}`,
        name: names[teamIdx2],
        role: teamRole,
        teammateId: `p-${teamIdx1 + 1}`,
        teammateName: names[teamIdx1],
        mission: sharedMission,
      };
      generatedPlayers[soloIdx] = {
        id: `p-${soloIdx + 1}`,
        name: names[soloIdx],
        role: soloRole,
        mission: soloMission,
      };
    } else {
      // 4 Players: 2 Passengers + 2 Workers. Teammates share identical mission!
      const playerIndices = [0, 1, 2, 3].sort(() => 0.5 - Math.random());
      const passIdx1 = playerIndices[0];
      const passIdx2 = playerIndices[1];
      const workIdx1 = playerIndices[2];
      const workIdx2 = playerIndices[3];

      const passengerTeamMission = passengerPool[0];
      const workerTeamMission = workerPool[0];

      generatedPlayers = new Array(4);
      generatedPlayers[passIdx1] = {
        id: `p-${passIdx1 + 1}`,
        name: names[passIdx1],
        role: 'passenger',
        teammateId: `p-${passIdx2 + 1}`,
        teammateName: names[passIdx2],
        mission: passengerTeamMission,
      };
      generatedPlayers[passIdx2] = {
        id: `p-${passIdx2 + 1}`,
        name: names[passIdx2],
        role: 'passenger',
        teammateId: `p-${passIdx1 + 1}`,
        teammateName: names[passIdx1],
        mission: passengerTeamMission,
      };
      generatedPlayers[workIdx1] = {
        id: `p-${workIdx1 + 1}`,
        name: names[workIdx1],
        role: 'worker',
        teammateId: `p-${workIdx2 + 1}`,
        teammateName: names[workIdx2],
        mission: workerTeamMission,
      };
      generatedPlayers[workIdx2] = {
        id: `p-${workIdx2 + 1}`,
        name: names[workIdx2],
        role: 'worker',
        teammateId: `p-${workIdx1 + 1}`,
        teammateName: names[workIdx1],
        mission: workerTeamMission,
      };
    }

    // Pick first event for Check-In (stage 0)
    const stageEvents = GATE7_AIRPORT_EVENTS.filter((e) => e.stageIndex === 0);
    const initialEvent = stageEvents[Math.floor(Math.random() * stageEvents.length)];

    setGameState({
      phase: 'reveal',
      playerCount: count,
      players: generatedPlayers,
      currentRevealIndex: 0,
      revealCardShown: false,
      currentStageIndex: 0,
      flightDurationMinutes: gameState.flightDurationMinutes,
      timeRemainingSeconds: gameState.flightDurationMinutes * 60,
      timerRunning: false,
      activeEvent: initialEvent,
      usedEventIds: [initialEvent.id],
      soundMuted: gameState.soundMuted,
      currentGuessPlayerIndex: 0,
    });
  };

  // Draw a new random event for the current stage without repeats
  const handleDrawNewEvent = (stageIndex: number) => {
    const stageEvents = GATE7_AIRPORT_EVENTS.filter((e) => e.stageIndex === stageIndex);
    const available = stageEvents.filter((e) => !gameState.usedEventIds.includes(e.id));
    const pool = available.length > 0 ? available : stageEvents;
    const drawn = pool[Math.floor(Math.random() * pool.length)];

    setGameState((prev) => ({
      ...prev,
      activeEvent: drawn,
      usedEventIds: prev.usedEventIds.includes(drawn.id) ? prev.usedEventIds : [...prev.usedEventIds, drawn.id],
    }));

    speakAnnouncement(`Airport Notice: ${drawn.title}. ${drawn.playerInstructions}`);
  };

  // Move to next stage
  const handleNextStage = () => {
    if (gameState.currentStageIndex >= 5) {
      // Proceed to Gate 7 Boarding Verification
      setGameState((prev) => ({
        ...prev,
        phase: 'verification',
        timerRunning: false,
      }));
      speakAnnouncement('Final boarding call for Gate 7. All passengers and staff report for departure verification.');
      return;
    }

    const nextIndex = gameState.currentStageIndex + 1;
    const stageEvents = GATE7_AIRPORT_EVENTS.filter((e) => e.stageIndex === nextIndex);
    const available = stageEvents.filter((e) => !gameState.usedEventIds.includes(e.id));
    const nextEvent = (available.length > 0 ? available : stageEvents)[0];

    const stageTime = gameState.flightDurationMinutes * 60;

    setGameState((prev) => ({
      ...prev,
      currentStageIndex: nextIndex,
      activeEvent: nextEvent,
      usedEventIds: [...prev.usedEventIds, nextEvent.id],
      timeRemainingSeconds: stageTime,
      timerRunning: true,
    }));

    speakAnnouncement(`Now entering ${STAGES[nextIndex].name}. Gate 7 boarding countdown is active.`);
  };

  // Restart game
  const handleRestartGame = () => {
    if (window.confirm('Restart Gate 7 and return to the main setup screen?')) {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState({
        phase: 'home',
        playerCount: gameState.playerCount,
        players: [],
        currentRevealIndex: 0,
        revealCardShown: false,
        currentStageIndex: 0,
        flightDurationMinutes: gameState.flightDurationMinutes,
        timeRemainingSeconds: gameState.flightDurationMinutes * 60,
        timerRunning: false,
        activeEvent: null,
        usedEventIds: [],
        soundMuted: gameState.soundMuted,
        currentGuessPlayerIndex: 0,
      });
    }
  };

  // Format seconds to MM:SS
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Plane className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">
                  REAL-LIFE AIRPORT PARTY GAME
                </span>
                <span className="text-xs font-semibold text-amber-400">BOARDING PASS REQUIRED</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">GATE 7</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
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
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border-2 border-cyan-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" /> Digital Game Master • Shared Single Device
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              “Your flight is boarding. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300">
                Your mission is classified.
              </span>”
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Physically act out an airport journey with 2 to 4 friends. Secretly become a Passenger or an Airport Worker, fulfill classified social objectives, bluff your way through customs, and reach Gate 7 before final call!
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div className="pt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Select Number of Players:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              <button
                onClick={() => handleSelectPlayerCount(2)}
                className="group p-5 rounded-2xl bg-slate-950 hover:bg-cyan-950/60 border-2 border-slate-800 hover:border-cyan-400 text-left transition transform hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-white group-hover:text-cyan-300">2 PLAYERS</span>
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-xs text-slate-400">1 Passenger vs 1 Worker (20% Shared Backstory Chance)</p>
              </button>

              <button
                onClick={() => handleSelectPlayerCount(3)}
                className="group p-5 rounded-2xl bg-slate-950 hover:bg-cyan-950/60 border-2 border-slate-800 hover:border-cyan-400 text-left transition transform hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-white group-hover:text-cyan-300">3 PLAYERS</span>
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-xs text-slate-400">2 Teammates + 1 Solo Agent (Cooperative Objectives)</p>
              </button>

              <button
                onClick={() => handleSelectPlayerCount(4)}
                className="group p-5 rounded-2xl bg-slate-950 hover:bg-cyan-950/60 border-2 border-slate-800 hover:border-cyan-400 text-left transition transform hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-white group-hover:text-cyan-300">4 PLAYERS</span>
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-xs text-slate-400">2 Passengers vs 2 Airport Workers (Full Team Showdown)</p>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg">
              🧳
            </div>
            <h3 className="font-bold text-white text-base">Secret Roleplay Missions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Over 80 verifiable social missions. Persuade workers, inspect bags, trade snacks, and execute objectives without getting caught.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
              ✈️
            </div>
            <h3 className="font-bold text-white text-base">6 Airport Stages</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Check-In, Security Screening, Duty Free, VIP Lounge, Gate Area, and Final Boarding at Gate 7 with timed progression.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
              🔍
            </div>
            <h3 className="font-bold text-white text-base">Final Guessing Phase</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Failed your mission? Guess your opponent’s exact classified objective during final investigation to steal the victory!
            </p>
          </div>
        </div>

        {/* Rules Modal */}
        {showRulesModal && (
          <RulesModal onClose={() => setShowRulesModal(false)} />
        )}
      </div>
    );
  }

  // 2. SETUP SCREEN (Player Names & Stage Timer settings)
  if (gameState.phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                PRE-FLIGHT SETUP • {gameState.playerCount} PLAYERS
              </span>
              <h2 className="text-2xl font-black text-white">Enter Player Names</h2>
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
                <span className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Player {idx + 1} Name</label>
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

          {/* Stage Timer Length */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Stage Timer Length:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 1, label: 'Quick Flight', sub: '1 min / stage' },
                { mins: 2, label: 'Normal Flight', sub: '2 min / stage' },
                { mins: 3, label: 'Long Flight', sub: '3 min / stage' },
              ].map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() =>
                    setGameState((prev) => ({
                      ...prev,
                      flightDurationMinutes: opt.mins,
                      timeRemainingSeconds: opt.mins * 60,
                    }))
                  }
                  className={`p-3 rounded-xl border text-center transition ${
                    gameState.flightDurationMinutes === opt.mins
                      ? 'bg-cyan-950 border-cyan-400 text-white shadow-md'
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
              className="flex-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2"
            >
              <span>DEAL SECRET ROLES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. PRIVATE ROLE REVEAL FLOW
  if (gameState.phase === 'reveal') {
    const curIndex = gameState.currentRevealIndex;
    const currentPlayer = gameState.players[curIndex];
    const isAllDone = curIndex >= gameState.players.length;

    if (isAllDone) {
      return (
        <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mx-auto flex items-center justify-center text-3xl">
              ✈️
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                BOARDING BRIEFING COMPLETE
              </span>
              <h2 className="text-3xl font-black text-white mt-1">ALL PASSENGERS & STAFF READY</h2>
              <p className="text-slate-300 text-sm mt-2">
                Every player has privately memorized their role and classified mission. Return the device to the table center!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed text-left space-y-1">
              <p className="font-bold text-white">Roleplay Departure Rules:</p>
              <p>• Speak and act in character as you traverse the 6 airport stages.</p>
              <p>• Pursue your secret mission naturally without giving away your exact objective.</p>
              <p>• Watch everyone closely — their actions will betray their classified orders!</p>
            </div>

            <button
              onClick={() => {
                setGameState((prev) => ({
                  ...prev,
                  phase: 'gameplay',
                  currentStageIndex: 0,
                  timeRemainingSeconds: prev.flightDurationMinutes * 60,
                  timerRunning: true,
                }));
                speakAnnouncement('Attention all passengers and crew. Flight departure process has officially commenced at Check-in.');
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 transition flex items-center justify-center gap-2"
            >
              <span>BEGIN AIRPORT EXPERIENCE</span>
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
            <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-300 mx-auto flex items-center justify-center text-2xl font-black border border-slate-700">
              {curIndex + 1}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                PRIVATE IDENTITY REVEAL
              </span>
              <h2 className="text-3xl font-black text-white">{currentPlayer.name}</h2>
              <p className="text-slate-400 text-sm">
                Make sure nobody else is looking at this screen!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              Hand the device to <strong className="text-white">{currentPlayer.name}</strong> only. Keep your classified role secret from other players.
            </div>

            <button
              onClick={() => setGameState((p) => ({ ...p, revealCardShown: true }))}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              <span>REVEAL MY IDENTITY</span>
            </button>
          </div>
        ) : (
          // SECRET AIRPORT PASS / ID CARD
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/60 border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Header / Boarding Pass Cutout effect */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                  OFFICIAL DEPARTURE PASS • GATE 7
                </span>
                <h3 className="text-2xl font-black text-white">{currentPlayer.name}</h3>
              </div>
              <span
                className={`px-3 py-1 text-xs font-black rounded-full uppercase border ${
                  currentPlayer.role === 'passenger'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}
              >
                {currentPlayer.role === 'passenger' ? '🧳 PASSENGER' : '🛂 AIRPORT WORKER'}
              </span>
            </div>

            {/* Secret Mission Card */}
            <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> CLASSIFIED SECRET MISSION
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  {currentPlayer.mission.difficulty}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white">{currentPlayer.mission.title}</h4>
              <p className="text-sm text-cyan-200 font-semibold leading-relaxed">
                {currentPlayer.mission.objective}
              </p>
              <div className="text-xs text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <strong className="text-slate-300">Success Verification: </strong>
                {currentPlayer.mission.requirements}
              </div>
            </div>

            {/* Teammate info if applicable */}
            {currentPlayer.teammateName && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-xs text-emerald-200 flex items-start gap-3">
                <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 block font-bold">COOPERATIVE TEAMMATE IDENTIFIED:</strong>
                  You share this exact secret mission with <span className="underline font-bold text-white">{currentPlayer.teammateName}</span>! Cooperate during the flight to complete it together.
                </div>
              </div>
            )}

            {/* Special relationship backstory if applicable */}
            {currentPlayer.relationshipBackstory && (
              <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-4 text-xs text-purple-200 flex items-start gap-3">
                <Compass className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-300 block font-bold">SHARED SPECIAL RELATIONSHIP:</strong>
                  You and your fellow traveler are {currentPlayer.relationshipBackstory}. Incorporate this history into your banter!
                </div>
              </div>
            )}

            {/* Hide & Pass button */}
            <button
              onClick={() => {
                setGameState((prev) => ({
                  ...prev,
                  currentRevealIndex: prev.currentRevealIndex + 1,
                  revealCardShown: false,
                }));
              }}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border border-slate-600 transition flex items-center justify-center gap-2"
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

  // 4. AIRPORT GAMEPLAY EXPERIENCE (6 STAGES)
  if (gameState.phase === 'gameplay') {
    const curStage = STAGES[gameState.currentStageIndex];

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
        {/* Top Operations Bento Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{curStage.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {curStage.tag} OF 6
                </span>
                <span className="text-xs font-bold text-white uppercase">{curStage.name}</span>
              </div>
              <p className="text-xs text-slate-400">{curStage.desc}</p>
            </div>
          </div>

          {/* Timers & Controls */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 font-mono ${
              gameState.timeRemainingSeconds <= 15
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-cyan-300'
            }`}>
              <Timer className="w-4 h-4 text-cyan-400" />
              <span className="text-xl font-black">{formatTime(gameState.timeRemainingSeconds)}</span>
            </div>

            <button
              onClick={() => setGameState((p) => ({ ...p, timerRunning: !p.timerRunning }))}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
              title={gameState.timerRunning ? 'Pause Stage Timer' : 'Start / Resume Timer'}
            >
              {gameState.timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setGameState((p) => ({ ...p, soundMuted: !p.soundMuted }))}
              className={`p-2.5 rounded-xl border transition ${
                gameState.soundMuted ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-cyan-950 border-cyan-800 text-cyan-400'
              }`}
              title="Toggle Airport PA Announcements Sound"
            >
              {gameState.soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowRulesModal(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Rules Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={handleRestartGame}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-700 transition"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stage Progress Bento Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {STAGES.map((s, idx) => {
            const isCurrent = idx === gameState.currentStageIndex;
            const isCompleted = idx < gameState.currentStageIndex;

            return (
              <div
                key={s.index}
                className={`p-3 rounded-2xl border text-left transition ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-400 text-white ring-2 ring-cyan-500/30'
                    : isCompleted
                    ? 'bg-slate-900/80 border-slate-800 text-slate-400'
                    : 'bg-slate-950/50 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>{s.tag}</span>
                  <span>{s.icon}</span>
                </div>
                <div className="text-xs font-bold truncate mt-1">{s.name}</div>
              </div>
            );
          })}
        </div>

        {/* Main Stage Active Event Card */}
        {gameState.activeEvent && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> STAGE EVENT INCIDENT
              </span>

              <button
                onClick={() => handleDrawNewEvent(gameState.currentStageIndex)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
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

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                INSTRUCTIONS FOR PASSENGERS & STAFF:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {gameState.activeEvent.playerInstructions}
              </p>
            </div>

            {/* Time to move on notice if timer reached 0 */}
            {gameState.timeRemainingSeconds === 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between">
                <span>TIME TO MOVE ON TO THE NEXT AIRPORT STAGE!</span>
                <span className="animate-bounce">👉</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Bento Control Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="font-bold text-white">Destination Target: Gate 7</span> • Secret objectives remain completely hidden on-screen during play!
          </div>

          <button
            onClick={handleNextStage}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-600/30 transition flex items-center justify-center gap-2"
          >
            <span>
              {gameState.currentStageIndex === 4
                ? 'PROCEED TO FINAL CALL — GATE 7'
                : gameState.currentStageIndex === 5
                ? 'FINAL CALL — BOARDING & MISSION REVEAL'
                : `NEXT STAGE: ${STAGES[gameState.currentStageIndex + 1].name}`}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Modal */}
        {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
      </div>
    );
  }

  // 5. MISSION VERIFICATION PHASE (At Gate 7 Boarding)
  if (gameState.phase === 'verification') {
    const handleToggleClaim = (pId: string, claimed: boolean) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === pId ? { ...p, claimedCompleted: claimed } : p)),
      }));
    };

    const handleConfirmStory = (pId: string, story: string, confirmed: boolean) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) =>
          p.id === pId ? { ...p, completionStory: story, completionConfirmed: confirmed } : p
        ),
      }));
    };

    const handleFinishVerification = () => {
      const anyCompleted = gameState.players.some((p) => p.completionConfirmed);
      if (anyCompleted) {
        // We have winner(s)!
        setGameState((prev) => ({ ...prev, phase: 'results' }));
      } else {
        // No mission succeeded! Activate Guessing Phase
        setGameState((prev) => ({ ...prev, phase: 'guessing', currentGuessPlayerIndex: 0 }));
      }
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              FINAL CALL — GATE 7 BOARDING REACHED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Did Anyone Complete Their Secret Mission?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Pass the device to each player. Reveal your classified mission to the group and confirm if you successfully completed the verifiable objective!
            </p>
          </div>

          {/* Player verification cards */}
          <div className="space-y-4">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className={`p-5 rounded-2xl border transition ${
                  player.completionConfirmed
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                      {player.role === 'passenger' ? '🧳' : '🛂'}
                    </span>
                    <span className="font-bold text-white text-base">{player.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {player.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConfirmStory(player.id, player.completionStory || '', true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        player.completionConfirmed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>MISSION SUCCEEDED</span>
                    </button>
                    <button
                      onClick={() => handleConfirmStory(player.id, player.completionStory || '', false)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        player.completionConfirmed === false
                          ? 'bg-rose-950 border border-rose-500 text-rose-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      FAILED
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-cyan-300 font-bold">Mission: {player.mission.title}</p>
                  <p className="text-slate-300">{player.mission.objective}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setGameState((p) => ({ ...p, phase: 'gameplay' }))}
              className="py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              Back to Game
            </button>
            <button
              onClick={handleFinishVerification}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-600/30 transition flex items-center justify-center gap-2"
            >
              <span>SUBMIT VERIFICATION RESULTS</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. FINAL GUESSING PHASE
  if (gameState.phase === 'guessing') {
    const curIdx = gameState.currentGuessPlayerIndex;
    const guessingPlayer = gameState.players[curIdx];

    // Other opposing players
    const opponentCandidates = gameState.players.filter((p) => p.id !== guessingPlayer.id);

    // List of possible missions for selection
    const allMissions = [...GATE7_PASSENGER_MISSIONS, ...GATE7_WORKER_MISSIONS];
    const candidateMissions = allMissions.slice(0, 15);

    const handleSubmitGuess = () => {
      const finalGuess = selectedGuessOption || customGuessText.trim();
      if (!finalGuess) {
        alert('Please select or type your guess!');
        return;
      }

      // Check if guess roughly matches opponents' missions
      const opponents = gameState.players.filter((p) => p.id !== guessingPlayer.id);
      const isCorrect = opponents.some(
        (opp) =>
          opp.mission.title.toLowerCase().includes(finalGuess.toLowerCase()) ||
          opp.mission.objective.toLowerCase().includes(finalGuess.toLowerCase()) ||
          finalGuess.toLowerCase().includes(opp.mission.title.toLowerCase())
      );

      const updatedPlayers = gameState.players.map((p) =>
        p.id === guessingPlayer.id
          ? { ...p, guessOpponentMission: finalGuess, guessCorrect: isCorrect }
          : p
      );

      if (curIdx + 1 < gameState.players.length) {
        // Next player's turn to guess privately
        setGameState((prev) => ({
          ...prev,
          players: updatedPlayers,
          currentGuessPlayerIndex: prev.currentGuessPlayerIndex + 1,
        }));
        setSelectedGuessOption('');
        setCustomGuessText('');
      } else {
        // All guesses submitted! Show final results
        setGameState((prev) => ({
          ...prev,
          players: updatedPlayers,
          phase: 'results',
        }));
      }
    };

    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
              MISSION FAILURE — FINAL INVESTIGATION
            </span>
            <h2 className="text-2xl font-black text-white mt-2">
              {guessingPlayer.name}: Guess Opponent’s Secret Mission!
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              No one completed their secret mission! You can still win the game by correctly identifying an opponent’s classified objective. Make sure other players look away!
            </p>
          </div>

          {/* Quick Option Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase block">
              Choose from common classified mission objectives:
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
              {candidateMissions.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedGuessOption(m.title);
                    setCustomGuessText('');
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition ${
                    selectedGuessOption === m.title
                      ? 'bg-cyan-950 border-cyan-400 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <span className="font-bold text-cyan-300">{m.title}: </span>
                  <span className="text-slate-300">{m.objective}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom text input option */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase block">
              Or type a custom guess:
            </label>
            <input
              type="text"
              value={customGuessText}
              onChange={(e) => {
                setCustomGuessText(e.target.value);
                setSelectedGuessOption('');
              }}
              placeholder="e.g. Escort to Gate 7, Water bottle surrender, etc."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={handleSubmitGuess}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <span>SUBMIT PRIVATE GUESS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 7. FINAL RESULTS SCREEN
  if (gameState.phase === 'results') {
    // Determine winners
    const missionWinners = gameState.players.filter((p) => p.completionConfirmed);
    const guessWinners = gameState.players.filter((p) => p.guessCorrect);

    // In team modes, teammates share win
    const allWinners = new Set<string>();
    missionWinners.forEach((w) => {
      allWinners.add(w.name);
      if (w.teammateName) allWinners.add(w.teammateName);
    });
    guessWinners.forEach((g) => {
      allWinners.add(g.name);
      if (g.teammateName) allWinners.add(g.teammateName);
    });

    const winnerNames = Array.from(allWinners);

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
        <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Winner Banner */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mx-auto flex items-center justify-center text-3xl">
              🏆
            </div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              OFFICIAL FLIGHT DEBRIEFING • GATE 7
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {winnerNames.length > 0 ? (
                <>
                  VICTORY: <span className="text-cyan-400">{winnerNames.join(' & ')}</span>
                </>
              ) : (
                <span className="text-rose-400">NO WINNERS (ALL MISSIONS FAILED)</span>
              )}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
              {winnerNames.length > 0
                ? 'Objectives accomplished and covert investigations concluded at Gate 7.'
                : 'Nobody successfully accomplished their secret mission or deduced the opponents’ orders! Better luck next flight.'}
            </p>
          </div>

          {/* Dossiers of All Players */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Player Identity & Mission Dossiers:
            </h3>

            {gameState.players.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 uppercase">
                      {p.role === 'passenger' ? '🧳 Passenger' : '🛂 Airport Worker'}
                    </span>
                    {p.teammateName && (
                      <span className="text-[10px] text-emerald-400">
                        (Teammate: {p.teammateName})
                      </span>
                    )}
                  </div>

                  <span
                    className={`font-bold px-2.5 py-1 rounded-full text-[10px] ${
                      p.completionConfirmed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : p.guessCorrect
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.completionConfirmed
                      ? '✓ Mission Succeeded'
                      : p.guessCorrect
                      ? '✓ Correct Guess Winner'
                      : 'Unaccomplished'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <p className="text-cyan-300 font-bold">
                    Classified Order: {p.mission.title}
                  </p>
                  <p className="text-slate-300">{p.mission.objective}</p>
                </div>

                {p.guessOpponentMission && (
                  <p className="text-slate-400 text-[11px]">
                    Final Investigation Guess: <strong className="text-white">{p.guessOpponentMission}</strong> {p.guessCorrect ? '(Correct!)' : '(Incorrect)'}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                // Fresh random assignments for same players
                handleStartRoleAssignment();
              }}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN (NEW MISSIONS)</span>
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

// Modal for How to Play Rules
const RulesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <h3 className="text-xl font-black text-white">GATE 7 — OFFICIAL RULES</h3>
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
            <strong>GATE 7</strong> is a real-life multiplayer party game for 2–4 friends sharing one device. Players physically act out an airport journey while the app acts as your digital Game Master!
          </p>

          <div className="space-y-2">
            <h4 className="font-bold text-cyan-300 uppercase text-xs tracking-wider">How to Play:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong>Pass & Reveal:</strong> Each player secretly views their classified role (Passenger or Airport Worker) and secret mission on the shared screen.
              </li>
              <li>
                <strong>Teammates:</strong> In 3-player and 4-player games, teammates share identical secret missions and cooperate covertly.
              </li>
              <li>
                <strong>6 Airport Stages:</strong> Check-In, Security, Duty Free, VIP Lounge, Gate Area, and Gate 7 Boarding. Each stage has a countdown timer and spontaneous events.
              </li>
              <li>
                <strong>Act in Real Life:</strong> Players bluff, inspect, persuade, and act out their objectives in person without revealing what their mission is.
              </li>
              <li>
                <strong>Gate 7 Boarding:</strong> At the final gate, players verify if anyone successfully accomplished their secret mission.
              </li>
              <li>
                <strong>Investigation Phase:</strong> If all missions failed, players take turns privately guessing their opponents’ secret objectives to snatch victory!
              </li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
        >
          Got it, Return to Game
        </button>
      </div>
    </div>
  );
};
