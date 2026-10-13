import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoleDealer } from './components/RoleDealer';
import { KioskSystem } from './components/KioskSystem';
import { StaffCheckInDesk } from './components/StaffCheckInDesk';
import { GuestRequestPortal } from './components/GuestRequestPortal';
import { StaffDispatchConsole } from './components/StaffDispatchConsole';
import { PASoundboard } from './components/PASoundboard';
import { PassGenerator } from './components/PassGenerator';
import { VenueManager } from './components/VenueManager';
import { ScenarioGM } from './components/ScenarioGM';
import { Gate7Game } from './components/Gate7Game';
import { PatientZeroGame } from './components/PatientZeroGame';
import { loadAppState, saveAppState, resetAppState, AppState } from './utils/storage';
import {
  CheckInRecord,
  GuestRequest,
  Player,
  PlayerRole,
  RequestItemOption,
  AnnouncementPreset,
  ScenarioPrompt,
  VenueConfig,
  VenueType,
} from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<string>('kiosk');
  const [selectedPassRecord, setSelectedPassRecord] = useState<CheckInRecord | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Handlers
  const handleResetState = () => {
    const newState = resetAppState();
    setAppState(newState);
  };

  const handleUpdateVenue = (newVenue: VenueConfig) => {
    setAppState((prev) => ({ ...prev, venue: newVenue }));
  };

  const handleUpdateKioskVenue = (venueType: VenueType) => {
    setAppState((prev) => ({ ...prev, activeKioskVenue: venueType }));
  };

  const handleUpdatePlayers = (players: Player[]) => {
    setAppState((prev) => ({ ...prev, players }));
  };

  const handleUpdateRoles = (roles: PlayerRole[]) => {
    setAppState((prev) => ({ ...prev, roles }));
  };

  const handleAddCheckIn = (record: CheckInRecord) => {
    setAppState((prev) => ({
      ...prev,
      checkIns: [record, ...prev.checkIns],
    }));
  };

  const handleUpdateCheckIn = (updatedRecord: CheckInRecord) => {
    setAppState((prev) => ({
      ...prev,
      checkIns: prev.checkIns.map((c) => (c.id === updatedRecord.id ? updatedRecord : c)),
    }));
  };

  const handleDeleteCheckIn = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      checkIns: prev.checkIns.filter((c) => c.id !== id),
    }));
  };

  const handleAddGuestRequest = (request: GuestRequest) => {
    setAppState((prev) => ({
      ...prev,
      guestRequests: [request, ...prev.guestRequests],
    }));
  };

  const handleUpdateRequest = (updatedRequest: GuestRequest) => {
    setAppState((prev) => ({
      ...prev,
      guestRequests: prev.guestRequests.map((r) =>
        r.id === updatedRequest.id ? updatedRequest : r
      ),
    }));
  };

  const handleDeleteRequest = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      guestRequests: prev.guestRequests.filter((r) => r.id !== id),
    }));
  };

  const handleUpdateItems = (requestItems: RequestItemOption[]) => {
    setAppState((prev) => ({ ...prev, requestItems }));
  };

  const handleAddAnnouncement = (announcement: AnnouncementPreset) => {
    setAppState((prev) => ({
      ...prev,
      announcements: [announcement, ...prev.announcements],
    }));
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
  };

  const handleAddScenario = (scenario: ScenarioPrompt) => {
    setAppState((prev) => ({
      ...prev,
      scenarios: [scenario, ...prev.scenarios],
    }));
  };

  const handleSelectPassForPrint = (record: CheckInRecord) => {
    setSelectedPassRecord(record);
    setActiveTab('pass-generator');
  };

  const pendingRequestsCount = appState.guestRequests.filter(
    (r) => r.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Navbar Header */}
      <Header
        venue={appState.venue}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequestsCount={pendingRequestsCount}
        totalCheckInsCount={appState.checkIns.length}
        onResetState={handleResetState}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'kiosk' && (
          <KioskSystem
            venue={appState.venue}
            activeKioskVenue={appState.activeKioskVenue}
            onChangeKioskVenue={handleUpdateKioskVenue}
            onAddCheckInRecord={handleAddCheckIn}
          />
        )}

        {activeTab === 'staff-desk' && (
          <StaffCheckInDesk
            venue={appState.venue}
            checkIns={appState.checkIns}
            onUpdateCheckIn={handleUpdateCheckIn}
            onDeleteCheckIn={handleDeleteCheckIn}
            onAddCheckIn={handleAddCheckIn}
            onSelectPassForPrint={handleSelectPassForPrint}
          />
        )}

        {activeTab === 'guest-portal' && (
          <GuestRequestPortal
            venue={appState.venue}
            requestItems={appState.requestItems}
            guestRequests={appState.guestRequests}
            onAddGuestRequest={handleAddGuestRequest}
          />
        )}

        {activeTab === 'staff-dispatch' && (
          <StaffDispatchConsole
            venue={appState.venue}
            guestRequests={appState.guestRequests}
            requestItems={appState.requestItems}
            onUpdateRequest={handleUpdateRequest}
            onDeleteRequest={handleDeleteRequest}
            onUpdateItems={handleUpdateItems}
          />
        )}

        {activeTab === 'role-dealer' && (
          <RoleDealer
            players={appState.players}
            roles={appState.roles}
            onUpdatePlayers={handleUpdatePlayers}
            onUpdateRoles={handleUpdateRoles}
          />
        )}

        {activeTab === 'pa-system' && (
          <PASoundboard
            venue={appState.venue}
            announcements={appState.announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        )}

        {activeTab === 'pass-generator' && (
          <PassGenerator
            venue={appState.venue}
            checkIns={appState.checkIns}
            selectedCheckInForPass={selectedPassRecord}
          />
        )}

        {activeTab === 'gate7' && (
          <Gate7Game onBackToHub={() => setActiveTab('game-master')} />
        )}

        {activeTab === 'patient-zero' && (
          <PatientZeroGame onBackToHub={() => setActiveTab('game-master')} />
        )}

        {activeTab === 'game-master' && (
          <ScenarioGM
            venue={appState.venue}
            scenarios={appState.scenarios}
            onAddScenario={handleAddScenario}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
          />
        )}

        {activeTab === 'venue-settings' && (
          <VenueManager venue={appState.venue} onUpdateVenue={handleUpdateVenue} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            OmniRoleplay Suite • Playing as <strong className="text-slate-300">{appState.venue.name}</strong>
          </span>
          <span className="text-slate-600">
            All data saved locally on this device • Single Device Couch Roleplay Mode
          </span>
        </div>
      </footer>
    </div>
  );
}
