
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ClientsPage } from './pages/ClientsPage';
import { CrmPage } from './pages/CrmPage'; 
import { LeadDetailPage } from './pages/LeadDetailPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { FinancesPage } from './pages/FinancesPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { 
  MOCK_TASKS, MOCK_INSPECTIONS, 
  ALL_MOCK_APPOINTMENTS, ALL_MOCK_PAYMENTS, MOCK_USER
} from './constants'; 
import { 
  Project, Client, Task, Inspection, Appointment, Payment, Lead, CostSimulation, 
  OfficeCostConfigItem, TeamMemberConfigItem, User as TeamUser 
} from './types';
import * as dbService from './services/databaseService';

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth(); 
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isLoading, setIsLoading] = useState(true);
  
  // States will be populated from DB
  const [appProjects, setAppProjects] = useState<Project[]>([]);
  const [appClients, setAppClients] = useState<Client[]>([]);
  const [appTasks, setAppTasks] = useState<Task[]>(MOCK_TASKS); // Not migrated yet
  const [appInspections, setAppInspections] = useState<Inspection[]>(MOCK_INSPECTIONS); // Not migrated
  const [appAppointments, setAppAppointments] = useState<Appointment[]>(ALL_MOCK_APPOINTMENTS);  // Not migrated
  const [appPayments, setAppPayments] = useState<Payment[]>(ALL_MOCK_PAYMENTS); // Not migrated

  const [appLeads, setAppLeads] = useState<Lead[]>([]);
  const [appCostSimulations, setAppCostSimulations] = useState<CostSimulation[]>([]);
  const [appOfficeCostConfigs, setAppOfficeCostConfigs] = useState<OfficeCostConfigItem[]>([]);
  const [appTeamMemberConfigs, setAppTeamMemberConfigs] = useState<TeamMemberConfigItem[]>([]);
  const [appTeamMembers, setAppTeamMembers] = useState<TeamUser[]>([]);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Initialize DB and load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const dbInitialized = await dbService.initDB();
      if (dbInitialized) {
        setAppClients(await dbService.getClients());
        setAppProjects(await dbService.getProjects());
        setAppLeads(await dbService.getLeads());
        setAppCostSimulations(await dbService.getCostSimulations());
        setAppOfficeCostConfigs(await dbService.getOfficeCostConfigs());
        setAppTeamMemberConfigs(await dbService.getTeamMemberConfigs());
        setAppTeamMembers(await dbService.getTeamUsers());
      } else {
        // Handle DB initialization error (e.g. show error message)
        console.error("Failed to initialize database. App may not function correctly.");
      }
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  // This effect for payments might need adjustment if payments are moved to DB
   useEffect(() => {
    const allProjectPayments = appProjects.flatMap(proj => 
        (proj.payments || []).map(p => ({
            ...p,
            projectName: proj.name,
            clientName: proj.clientName || appClients.find(c => c.id === proj.client_id)?.name || 'N/A'
        }))
    );
    // If payments are in DB, this would be a query or derived differently
    // For now, keep as is if payments are part of project JSON
    setAppPayments(allProjectPayments);
  }, [appProjects, appClients]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-clarissa-primary">Carregando dados...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  let currentPageComponent;
  if (currentPath.startsWith('/projects/') && currentPath.split('/').length === 3) {
    const projectId = currentPath.split('/')[2];
    currentPageComponent = <ProjectDetailPage 
                              projectId={projectId} 
                              navigateTo={navigateTo} 
                              projects={appProjects} // Pass projects from state
                              setProjects={async (updatedProjectsOrFn) => {
                                // This needs careful handling. If it's a function, apply it first.
                                // Then, individual project updates should go through dbService.updateProject.
                                // For simplicity now, assuming direct state update reflects temporary UI change before full save.
                                // A full save pattern would be: call dbService.updateProject, then reload projects.
                                if (typeof updatedProjectsOrFn === 'function') {
                                    setAppProjects(updatedProjectsOrFn); 
                                } else {
                                    setAppProjects(updatedProjectsOrFn);
                                }
                                // Ideally: individual project updates via dbService then refresh
                              }}
                              clients={appClients}
                              tasks={appTasks} 
                              setTasks={setAppTasks} // Not migrated yet
                              appointments={appAppointments} // Not migrated
                              setAppointments={setAppAppointments} // Not migrated
                              teamMembers={appTeamMembers}
                           />;
  } else if (currentPath.startsWith('/crm/') && currentPath.split('/').length === 3) {
    const leadId = currentPath.split('/')[2];
    currentPageComponent = <LeadDetailPage
                              leadId={leadId}
                              navigateTo={navigateTo}
                              leads={appLeads}
                              setLeads={setAppLeads} // Will be updated to use dbService
                              costSimulations={appCostSimulations}
                              setCostSimulations={setAppCostSimulations} // Will be updated to use dbService
                              clients={appClients}
                              setClients={setAppClients} // Will be updated to use dbService
                              projects={appProjects}
                              setProjects={setAppProjects} // Will be updated to use dbService
                              officeCostConfigs={appOfficeCostConfigs}
                              teamMemberConfigs={appTeamMemberConfigs} 
                              teamMembers={appTeamMembers}
                           />;
  } else {
    switch (currentPath) {
      case '/':
        currentPageComponent = <DashboardPage 
                                projects={appProjects} 
                                tasks={appTasks} 
                                inspections={appInspections}
                                payments={appPayments}
                                navigateTo={navigateTo}
                              />;
        break;
      case '/projects':
        currentPageComponent = <ProjectsPage 
                                  navigateTo={navigateTo} 
                                  projects={appProjects} 
                                  setProjectsState={setAppProjects} // Prop to update local state
                                  clients={appClients}
                                  setClientsState={setAppClients} 
                                />;
        break;
      case '/crm': 
        currentPageComponent = <CrmPage 
                                  leads={appLeads}
                                  setLeadsState={setAppLeads}
                                  clients={appClients}
                                  setClientsState={setAppClients}
                                  projects={appProjects}
                                  setProjectsState={setAppProjects}
                                  teamMembers={appTeamMembers}
                                  navigateTo={navigateTo}
                                />;
        break;
      case '/clients':
        currentPageComponent = <ClientsPage 
                                  clients={appClients} 
                                  setClientsState={setAppClients} // Prop to update local state
                               />;
        break;
      case '/inspections':
        currentPageComponent = <InspectionsPage 
                                inspections={appInspections} 
                                setInspections={setAppInspections} 
                                clients={appClients}
                              />;
        break;
      case '/finances':
        currentPageComponent = <FinancesPage payments={appPayments} projects={appProjects} />;
        break;
      case '/tasks':
        currentPageComponent = <TasksPage 
                                tasks={appTasks} 
                                setTasks={setAppTasks} 
                                projects={appProjects} 
                              />;
        break;
      case '/calendar':
        currentPageComponent = <CalendarPage 
                                appointments={appAppointments} 
                                setAppointments={setAppAppointments} 
                                projects={appProjects}
                                tasks={appTasks} 
                                inspections={appInspections} 
                              />;
        break;
      case '/settings':
        currentPageComponent = <SettingsPage 
                                  user={user || MOCK_USER} 
                                  officeCostConfigs={appOfficeCostConfigs}
                                  setOfficeCostConfigsState={setAppOfficeCostConfigs}
                                  teamMemberConfigs={appTeamMemberConfigs}
                                  setTeamMemberConfigsState={setAppTeamMemberConfigs}
                                  teamMembers={appTeamMembers}
                                  setTeamMembersState={setAppTeamMembers} // To update MOCK_TEAM_MEMBERS state
                                />;
        break;
      case '/help':
        currentPageComponent = <HelpPage />;
        break;
      default:
        currentPageComponent = <DashboardPage 
                                projects={appProjects} 
                                tasks={appTasks} 
                                inspections={appInspections}
                                payments={appPayments}
                                navigateTo={navigateTo}
                               />; 
        if (currentPath !== '/') { 
          navigateTo('/'); 
        }
    }
  }

  return (
    <MainLayout navigateTo={navigateTo} currentPath={currentPath}>
      {currentPageComponent}
    </MainLayout>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
