import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getStoredDevice } from '../services/storage';
import { SearchScreen } from '../screens/SearchScreen';
import { DeviceFoundScreen } from '../screens/DeviceFoundScreen';
import { ConnectedScreen } from '../screens/ConnectedScreen';
import { GestureIntroScreen } from '../screens/GestureIntroScreen';
import { GestureTestScreen } from '../screens/GestureTestScreen';
import { PermissionsScreen } from '../screens/PermissionsScreen';
import { SetupDoneScreen } from '../screens/SetupDoneScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    (async () => {
      const device = await getStoredDevice();
      setInitialRoute(device ? 'Home' : 'Search');
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="DeviceFound" component={DeviceFoundScreen} />
      <Stack.Screen name="Connected" component={ConnectedScreen} />
      <Stack.Screen name="GestureIntro" component={GestureIntroScreen} />
      <Stack.Screen name="GestureTest" component={GestureTestScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="SetupDone" component={SetupDoneScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};
