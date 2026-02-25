import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { storeDevice } from '../services/storage';
import { COLORS, FONTS, scale, verticalScale } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceFound'>;

export const DeviceFoundScreen: React.FC<Props> = ({ navigation, route }) => {
  const { deviceId, deviceName, excludedIds } = route.params;

  const handleYep = async () => {
    await storeDevice({ id: deviceId, name: deviceName });
    navigation.replace('Connected', { deviceId, deviceName });
  };

  const handleNope = () => {
    const newExcluded = [...excludedIds, deviceId];
    navigation.replace('Search', { excludedIds: newExcluded });
  };

  return (
    <OnboardingLayout
      title="Let's get started."
      image={require('../../assets/setup/rings.png')}
      imageStyle="rings"
    >
      <View style={styles.content}>
        <Text style={styles.questionText}>Is this it?</Text>

        <NeumorphicButton
          onPress={() => {}}
          variant="inset"
          disabled
        >
          <Text style={styles.deviceName}>{deviceName}</Text>
        </NeumorphicButton>

        <View style={styles.buttonRow}>
          <NeumorphicButton
            label="Nope"
            onPress={handleNope}
            variant="red"
            width={scale(150)}
          />
          <NeumorphicButton
            label="Yep"
            onPress={handleYep}
            variant="green"
            width={scale(150)}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
    gap: verticalScale(16),
  },
  questionText: {
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
  buttonRow: {
    flexDirection: 'row',
    gap: scale(20),
  },
});
