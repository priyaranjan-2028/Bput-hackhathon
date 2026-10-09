import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import NotificationsPage from './NotificationsPage';
import ProjectUserNotificationsPage from '../project-user/ProjectUserNotificationsPage';

export function NotificationsRoute() {
  const { user } = useAuth();
  return user?.role === UserRole.PROJECT_USER
    ? <ProjectUserNotificationsPage />
    : <NotificationsPage />;
}
