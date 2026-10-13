export type VenueType =
  | 'airport'
  | 'hotel'
  | 'restaurant'
  | 'train'
  | 'boat'
  | 'bus'
  | 'clinic'
  | 'themepark'
  | 'custom';

export interface VenueConfig {
  id: string;
  name: string;
  type: VenueType;
  logoIcon: string; // lucide icon name or emoji
  themeColor: string; // tailwind color or hex
  tagline: string;
  currencySymbol: string;
  locationName: string;
}

export interface PlayerRole {
  id: string;
  title: string;
  category: 'staff' | 'guest' | 'vip' | 'mystery' | 'custom';
  description: string;
  secretObjective: string;
  startingItems: string[];
  clearanceLevel?: string;
  assignedPlayerName?: string;
}

export interface Player {
  id: string;
  name: string;
  assignedRoleId?: string;
  pin?: string;
  isRevealed?: boolean;
}

export type CheckInStatus =
  | 'registered'
  | 'checked_in'
  | 'luggage_dropped'
  | 'security_cleared'
  | 'boarded'
  | 'room_assigned'
  | 'table_seated'
  | 'completed'
  | 'cancelled';

export interface CheckInRecord {
  id: string;
  code: string;
  guestName: string;
  ticketOrBookingRef: string;
  venueType: VenueType;
  timestamp: string;
  status: CheckInStatus;
  
  // Specific fields
  seatOrRoomOrTable: string;
  luggageCount: number;
  luggageTagCode?: string;
  specialRequests: string[];
  dietaryOrNotes: string;
  assignedStaff?: string;
  kioskUsed: boolean;
  
  // Custom extra details
  destinationOrClass?: string;
  passportId?: string;
}

export interface RequestItemOption {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  iconName: string;
  isAvailable: boolean;
}

export type RequestStatus = 'pending' | 'in_progress' | 'fulfilled' | 'rejected';

export interface GuestRequest {
  id: string;
  guestName: string;
  locationRef: string; // e.g. Room 402, Seat 12A, Table 5
  itemId: string;
  itemTitle: string;
  category: string;
  quantity: number;
  totalPrice: number;
  notes?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  assignedWorker?: string;
  workerNotes?: string;
}

export interface AnnouncementPreset {
  id: string;
  title: string;
  venueType: VenueType;
  message: string;
  chime: boolean;
}

export interface ScenarioPrompt {
  id: string;
  venueType: VenueType;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Chaotic';
  eventTriggers: string[];
}
