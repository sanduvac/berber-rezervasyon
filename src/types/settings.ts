export type NotificationSettings = {
  allNotifications: boolean;
  appointmentReminders: boolean;
  systemNotifications: boolean;
};

export type PrivacySettings = {
  biometricLogin: boolean;
  twoFactorAuth: boolean;
  locationSharing: boolean;
  analyticsData: boolean;
};

export type UserRole = "customer" | "barber" | "admin";
