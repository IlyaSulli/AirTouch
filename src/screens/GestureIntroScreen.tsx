import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { NumberArrowSvg } from '../components/NumberArrowSvg';
import { COLORS, FONTS, scale, verticalScale } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GestureIntro'>;

export const GestureIntroScreen: React.FC<Props> = ({ navigation, route }) => {
  const { deviceId, deviceName } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Gesture time.</Text>
        <Text style={styles.description}>
          Draw each number in the air with your hand as you see it to practice
          how you will do it
        </Text>

        <View style={styles.illustrationArea}>
          <NumberArrowSvg />
        </View>

        {/* Hand image positioned large, overlapping below */}
        <Image
          source={require('../../assets/setup/finger.png')}
          style={styles.fingerImage}
          resizeMode="contain"
        />

        <View style={styles.bottomArea}>
          <NeumorphicButton
            label="Continue"
            onPress={() =>
              navigation.replace('GestureTest', {
                deviceId,
                deviceName,
                gestureNumber: 1,
              })
            }
            variant="raised"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: scale(20),
    fontFamily: FONTS.mono,
    color: COLORS.black,
    textAlign: 'center',
    marginTop: verticalScale(50),
  },
  description: {
    fontSize: scale(14),
    fontFamily: FONTS.mono,
    color: COLORS.black,
    textAlign: 'center',
    paddingHorizontal: scale(33),
    marginTop: verticalScale(8),
  },
  illustrationArea: {
    width: scale(92),
    height: verticalScale(183),
    alignSelf: 'center',
    left: scale(10),
    top: scale(20),
    marginTop: verticalScale(50),
  },
  fingerImage: {
    width: scale(465),
    height: verticalScale(569),
    position: 'absolute',
    bottom: 0,
    left: scale(-58),
  },
  bottomArea: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
