export type AppDataMode = "guest" | "account";

export type Settings = {
  guestMode: boolean;
  allowPopups: false;
  autoplayTrailers: boolean;
  enableAnimations: boolean;
  dataSaver: boolean;
};

export type SettingsScope =
  | { mode: "guest" }
  | { mode: "account"; uid: string };
