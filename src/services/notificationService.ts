import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const ANDROID_CHANNEL_ID = "appointment-reminders";
const REMINDER_MINUTES = [60, 30] as const;

let androidChannelConfigured = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

type AppointmentReminderParams = {
  barberName: string;
  serviceName: string;
  date: string;
  time: string;
};

function parseAppointmentDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android" || androidChannelConfigured) {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Randevu Hatırlatmaları",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 200, 200, 200]
  });

  androidChannelConfigured = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  await ensureAndroidChannel();

  const currentPermission = await Notifications.getPermissionsAsync();
  if (currentPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return requestedPermission.granted;
}

export async function scheduleAppointmentReminderNotifications({
  barberName,
  serviceName,
  date,
  time
}: AppointmentReminderParams): Promise<string[]> {
  const permissionGranted = await ensureNotificationPermission();
  if (!permissionGranted) {
    return [];
  }

  const appointmentDate = parseAppointmentDateTime(date, time);
  const nowMs = Date.now();
  const notificationIds: string[] = [];

  for (const minutesBefore of REMINDER_MINUTES) {
    const reminderTimeMs = appointmentDate.getTime() - minutesBefore * 60 * 1000;
    const secondsUntilReminder = Math.floor((reminderTimeMs - nowMs) / 1000);

    if (secondsUntilReminder <= 0) {
      continue;
    }

    const trigger: Notifications.TimeIntervalTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilReminder,
      repeats: false
    };

    if (Platform.OS === "android") {
      trigger.channelId = ANDROID_CHANNEL_ID;
    }

    const readableRemaining = minutesBefore === 60 ? "1 saat" : "30 dakika";

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Randevu Hatırlatması",
        body: `${barberName} - ${serviceName} randevun ${readableRemaining} sonra (${time}).`,
        sound: true,
        data: {
          reminderMinutesBefore: minutesBefore,
          appointmentDate: date,
          appointmentTime: time
        }
      },
      trigger
    });

    notificationIds.push(notificationId);
  }

  return notificationIds;
}

export async function cancelAppointmentReminderNotifications(
  notificationIds: string[] | undefined
): Promise<void> {
  if (!notificationIds || notificationIds.length === 0) {
    return;
  }

  await Promise.all(
    notificationIds.map((notificationId) =>
      Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => undefined)
    )
  );
}
