import { useState, useEffect } from 'react';
import LoginView from './views/Auth/LoginView';
import SetupView from './views/Auth/SetupView';
import AppShell from './components/layout/AppShell';
import DashboardView from './views/CommandCenter/DashboardView';
import ClientOS from './views/ClientOS';
import FulfillmentOS from './views/FulfillmentOS';
import ContentOS from './views/ContentOS';
import KnowledgeVault from './views/KnowledgeVault';
import OnboardingOS from './views/OnboardingOS';
import { loadData, saveData, AppData } from './utils/storage';
import { AppDataProvider } from './contexts/AppDataContext';

export default function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [authLevel, setAuthLevel] = useState<'ceo' | 'team' | null>(() => {
    return (sessionStorage.getItem('authLevel') as 'ceo' | 'team') || null;
  });
  const [activeView, setActiveView] = useState('command');
  const [selectedGlobalClient, setSelectedGlobalClient] = useState<string | null>(null);

  useEffect(() => {
    if (data.settings.initialized) {
      saveData(data);
    }
  }, [data]);

  const handleInitialize = (ceoHash: string, teamHash: string) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ceoPhraseHash: ceoHash,
        teamPhraseHash: teamHash,
        initialized: true,
      },
    }));
  };

  const handleLogin = (level: 'ceo' | 'team') => {
    setAuthLevel(level);
    sessionStorage.setItem('authLevel', level);
    // Team lands on Fulfillment OS, CEO on Command Center
    setActiveView(level === 'ceo' ? 'command' : 'fulfillment');
  };

  const handleLogout = () => {
    setAuthLevel(null);
    sessionStorage.removeItem('authLevel');
  };

  // 1. Initial Setup Mode
  if (!data.settings.initialized) {
    return (
      <AppDataProvider data={data} setData={setData}>
        <SetupView onInitialize={handleInitialize} />
      </AppDataProvider>
    );
  }

  // 2. Login Screen
  if (!authLevel) {
    return (
      <AppDataProvider data={data} setData={setData}>
        <LoginView
          onLogin={handleLogin}
          ceoHash={data.settings.ceoPhraseHash || ''}
          teamHash={data.settings.teamPhraseHash || ''}
        />
      </AppDataProvider>
    );
  }

  return (
    <AppDataProvider data={data} setData={setData}>
      <AppShell
        activeView={activeView}
        setActiveView={setActiveView}
        selectedClient={selectedGlobalClient}
        setSelectedClient={setSelectedGlobalClient}
        authLevel={authLevel}
        onLogout={handleLogout}
      >
        {activeView === 'command' && authLevel === 'ceo' && <DashboardView onNavigate={(view, id) => {
          setActiveView(view);
          if (id) setSelectedGlobalClient(id);
        }} />}
        {activeView === 'client' && <ClientOS onNavigate={(view, id) => {
          setActiveView(view);
          if (id) setSelectedGlobalClient(id);
        }} />}
        {activeView === 'fulfillment' && <FulfillmentOS onNavigate={(view, id) => {
          setActiveView(view);
          if (id) setSelectedGlobalClient(id);
        }} />}
        {activeView === 'content' && <ContentOS onNavigate={(view, id) => {
          setActiveView(view);
          if (id) setSelectedGlobalClient(id);
        }} />}
        {activeView === 'vault' && <KnowledgeVault selectedClient={selectedGlobalClient} />}
        {activeView === 'onboarding' && <OnboardingOS onNavigate={(view, id) => {
          setActiveView(view);
          if (id) setSelectedGlobalClient(id);
        }} />}
        {/* Fallback if team tries to access command center */}
        {activeView === 'command' && authLevel !== 'ceo' && <FulfillmentOS onNavigate={(view, id) => {
          setActiveView(view);
          if (id) setSelectedGlobalClient(id);
        }} />}
      </AppShell>
    </AppDataProvider>
  );
}

