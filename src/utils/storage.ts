import {
  VenueConfig,
  Player,
  PlayerRole,
  CheckInRecord,
  RequestItemOption,
  GuestRequest,
  AnnouncementPreset,
  ScenarioPrompt,
  VenueType,
} from '../types';
import {
  VENUE_PRESETS,
  DEFAULT_ROLES,
  DEFAULT_REQUEST_ITEMS,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_SCENARIOS,
} from '../data/presets';

const STORAGE_KEY = 'omni_roleplay_app_state_v1';

export interface AppState {
  venue: VenueConfig;
  players: Player[];
  roles: PlayerRole[];
  checkIns: CheckInRecord[];
  requestItems: RequestItemOption[];
  guestRequests: GuestRequest[];
  announcements: AnnouncementPreset[];
  scenarios: ScenarioPrompt[];
  activeKioskVenue: VenueType;
}

export const INITIAL_STATE: AppState = {
  venue: VENUE_PRESETS.airport,
  players: [
    { id: 'p-1', name: 'Alex', assignedRoleId: 'role-1' },
    { id: 'p-2', name: 'Jordan', assignedRoleId: 'role-2' },
    { id: 'p-3', name: 'Taylor', assignedRoleId: 'role-4' },
    { id: 'p-4', name: 'Sam', assignedRoleId: 'role-7' },
  ],
  roles: DEFAULT_ROLES,
  checkIns: [
    {
      id: 'chk-101',
      code: 'RP-8902',
      guestName: 'Taylor Morgan',
      ticketOrBookingRef: 'TKT-9921',
      venueType: 'airport',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'luggage_dropped',
      seatOrRoomOrTable: 'Seat 02A (First Class)',
      luggageCount: 2,
      luggageTagCode: 'LUG-TAG-401',
      specialRequests: ['VIP Lounge Pass', 'Window Seat'],
      dietaryOrNotes: 'Prefers vegetarian meal on flight.',
      assignedStaff: 'Jordan (Check-In Desk)',
      kioskUsed: true,
      destinationOrClass: 'Tokyo (NRT) - First Class',
      passportId: 'PASS-88129',
    },
    {
      id: 'chk-102',
      code: 'RP-8903',
      guestName: 'Sam Rivera',
      ticketOrBookingRef: 'TKT-7734',
      venueType: 'airport',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'checked_in',
      seatOrRoomOrTable: 'Seat 14C (Economy)',
      luggageCount: 1,
      luggageTagCode: 'LUG-TAG-402',
      specialRequests: ['Heavy Luggage Flagged'],
      dietaryOrNotes: 'Carrying locked metallic briefcase.',
      assignedStaff: 'Alex (Captain)',
      kioskUsed: true,
      destinationOrClass: 'Paris (CDG) - Economy',
      passportId: 'PASS-33412',
    },
  ],
  requestItems: DEFAULT_REQUEST_ITEMS,
  guestRequests: [
    {
      id: 'req-201',
      guestName: 'Taylor Morgan',
      locationRef: 'Seat 02A',
      itemId: 'item-6',
      itemTitle: 'Fresh Sparkling Beverage / Wine',
      category: 'Food & Beverage',
      quantity: 1,
      totalPrice: 25,
      notes: 'Chilled glass with extra ice please.',
      status: 'pending',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  announcements: DEFAULT_ANNOUNCEMENTS,
  scenarios: DEFAULT_SCENARIOS,
  activeKioskVenue: 'airport',
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_STATE,
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Failed to parse state from localStorage:', e);
  }
  return INITIAL_STATE;
}

export function saveAppState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function resetAppState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset state:', e);
  }
  return INITIAL_STATE;
}
