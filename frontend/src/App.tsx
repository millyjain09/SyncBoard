import React from 'react';
import { CommandSearchModal } from './components/shared/CommandSearchModal';
import { ToastStack } from './components/shared/CommonAtoms';
import { NotificationsDrawer } from './components/shared/NotificationsDrawer';
import {
  BoardSettingsModal,
  CompleteSprintModal,
  CreateTaskModal,
  GitHubModal,
  WorkspaceProjectModal,
} from './components/shared/ProductModals';
import { StudioBar } from './components/studio/StudioBar';
import { ConceptShell } from './layouts/ConceptShell';
import { KanbanBoardScreen } from './screens/KanbanBoardScreen';
import { SprintAnalyticsScreen } from './screens/SprintAnalyticsScreen';
import { TaskDetailsScreen } from './screens/TaskDetailsScreen';
import { TeamPermissionsScreen } from './screens/TeamPermissionsScreen';
import { WeeklyTimesheetScreen } from './screens/WeeklyTimesheetScreen';
import { MavericksProvider, useMavericks } from './state/MavericksContext';

const ActiveScreenView: React.FC = () => {
  const { screen } = useMavericks();

  switch (screen) {
    case 'board':
      return <KanbanBoardScreen />;
    case 'task':
      return <TaskDetailsScreen />;
    case 'sprint':
      return <SprintAnalyticsScreen />;
    case 'timesheet':
      return <WeeklyTimesheetScreen />;
    case 'team':
      return <TeamPermissionsScreen />;
  }
};

export const App: React.FC = () => {
  return (
    <MavericksProvider>
      <div className="min-h-screen flex flex-col">
        <StudioBar />
        <ConceptShell>
          <ActiveScreenView />
        </ConceptShell>

        {/* Product-Wide Overlays & Modals */}
        <CommandSearchModal />
        <NotificationsDrawer />
        <CreateTaskModal />
        <GitHubModal />
        <CompleteSprintModal />
        <WorkspaceProjectModal />
        <BoardSettingsModal />
        <ToastStack />
      </div>
    </MavericksProvider>
  );
};

export default App;

