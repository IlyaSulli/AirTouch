import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { COLORS, FONTS, scale, verticalScale } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Connected'>;

export const ConnectedScreen: React.FC<Props> = ({ navigation, route }) => {
  const { deviceId, deviceName } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('GestureIntro', { deviceId, deviceName });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, deviceId, deviceName]);

  return (
    <OnboardingLayout
      title="Let's get started."
      image={require('../../assets/setup/rings.png')}
      imageStyle="rings"
    >
      <View style={styles.content}>
        <Text style={styles.label}>Connected to</Text>
        <NeumorphicButton
          onPress={() => {}}
          variant="inset"
          disabled
        >
          <Text style={styles.deviceName}>{deviceName}</Text>
        </NeumorphicButton>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
    gap: verticalScale(8),
  },
  label: {
    fontSize: scale(15),
    fontFamily: FONTS.mono,
    color: COLORS.black,
    textAlign: 'center',
  },
  deviceName: {
    fontSize: scale(15),
    fontFamily: FONTS.mono,
    color: COLORS.black,
    textAlign: 'center',
  },
});
