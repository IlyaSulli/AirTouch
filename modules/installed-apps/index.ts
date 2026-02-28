import { requireNativeModule } from "expo-modules-core";

export interface InstalledApp {
  label: string;
  packageName: string;
  icon: string; // base64 PNG
}

const InstalledAppsModule = requireNativeModule("InstalledApps");

export async function getInstalledApps(): Promise<InstalledApp[]> {
  return await InstalledAppsModule.getInstalledApps();
}
