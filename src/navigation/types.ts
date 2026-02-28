export type RootStackParamList = {
  Search: { excludedIds?: string[] } | undefined;
  DeviceFound: {
    deviceId: string;
    deviceName: string;
    excludedIds: string[];
  };
  Connected: {
    deviceId: string;
    deviceName: string;
  };
  GestureIntro: {
    deviceId: string;
    deviceName: string;
  };
  GestureTest: {
    deviceId: string;
    deviceName: string;
    gestureNumber: number;
  };
  Permissions: undefined;
  SetupDone: undefined;
  Home: undefined;
};
