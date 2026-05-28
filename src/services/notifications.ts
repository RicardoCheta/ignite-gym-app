import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleClassNotification(session: {
  session_id: number;
  title: string;
  session_date: string;
  start_time: string;
  room: string;
}) {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Parse class date/time
  const [hour, minute] = session.start_time.split(':').map(Number);
  const classDate = new Date(session.session_date);
  classDate.setHours(hour, minute, 0, 0);

  // Schedule 1 hour before
  const notifyAt = new Date(classDate.getTime() - 60 * 60 * 1000);

  if (notifyAt <= new Date()) return; // Already passed

  await Notifications.scheduleNotificationAsync({
    identifier: `class-${session.session_id}`,
    content: {
      title: '🔥 Class starting soon!',
      body: `${session.title} starts in 1 hour — Room ${session.room}`,
      data: { session_id: session.session_id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notifyAt },
  });
}

export async function cancelClassNotification(sessionId: number) {
  await Notifications.cancelScheduledNotificationAsync(`class-${sessionId}`);
}
