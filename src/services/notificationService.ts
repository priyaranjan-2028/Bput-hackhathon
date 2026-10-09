import { ProjectUserNotification, ProjectUserSubmission } from '../types/projectUser';
import { SubmissionStatus } from '../types';
import { notifications as mockNotifications } from '../data/mockData';
import { readStoredValue, PROJECT_USER_STORAGE_KEYS, writeStoredValue } from './localStorageService';

export function getUserNotifications(userId: string): ProjectUserNotification[] {
  const stored = readStoredValue<ProjectUserNotification[] | null>(PROJECT_USER_STORAGE_KEYS.notifications, null);
  if (stored === null) {
    const seeded = mockNotifications.filter(notification => notification.userId === userId).map(notification => ({
      notificationId: notification.id,
      userId,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      read: notification.read,
      submissionId: notification.entityId,
    }));
    writeStoredValue(PROJECT_USER_STORAGE_KEYS.notifications, seeded);
    return seeded.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return stored
    .filter(notification => notification.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addSubmissionNotification(submission: ProjectUserSubmission, resubmitted = false): void {
  const notifications = readStoredValue<ProjectUserNotification[]>(PROJECT_USER_STORAGE_KEYS.notifications, []);
  const isDraft = submission.status === SubmissionStatus.DRAFT;
  if (isDraft) return;
  notifications.unshift({
    notificationId: `NOT-${crypto.randomUUID()}`,
    userId: submission.userId,
    title: resubmitted ? 'Submission resubmitted' : 'Submission submitted',
    message: `${submission.submissionId} has been sent to your Project Supervisor for verification.`,
    createdAt: new Date().toISOString(),
    read: false,
    submissionId: submission.submissionId,
  });
  writeStoredValue(PROJECT_USER_STORAGE_KEYS.notifications, notifications);
}

export function markNotificationRead(userId: string, notificationId: string): void {
  const notifications = readStoredValue<ProjectUserNotification[]>(PROJECT_USER_STORAGE_KEYS.notifications, []);
  writeStoredValue(PROJECT_USER_STORAGE_KEYS.notifications, notifications.map(notification =>
    notification.userId === userId && notification.notificationId === notificationId
      ? { ...notification, read: true }
      : notification
  ));
}

export function markAllNotificationsRead(userId: string): void {
  const notifications = readStoredValue<ProjectUserNotification[]>(PROJECT_USER_STORAGE_KEYS.notifications, []);
  writeStoredValue(PROJECT_USER_STORAGE_KEYS.notifications, notifications.map(notification =>
    notification.userId === userId ? { ...notification, read: true } : notification
  ));
}
