export type AppDataMode = "guest" | "account";

export type Settings = {
  guestMode: boolean;
  blockPopups: boolean;
  autoplayTrailers: boolean;
  enableAnimations: boolean;
  dataSaver: boolean;
};

export type SettingsScope =
  | { mode: "guest" }
  | { mode: "account"; uid: string };
