import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, scale, verticalScale } from '../constants/theme';

interface OnboardingLayoutProps {
  title: string;
  image: ImageSourcePropType;
  imageStyle?: 'rings' | 'finger';
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  title,
  image,
  imageStyle = 'rings',
  children,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>

        <Image
          source={image}
          style={imageStyle === 'rings' ? styles.ringsImage : styles.fingerImage}
          resizeMode="contain"
        />

        <View style={styles.bottomArea}>{children}</View>
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
  ringsImage: {
    width: scale(688),
    height: verticalScale(459),
    alignSelf: 'center',
    marginTop: verticalScale(13),
  },
  fingerImage: {
    width: scale(407),
    height: verticalScale(498),
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    left: scale(-5),
  },
  bottomArea: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: scale(33),
  },
});
