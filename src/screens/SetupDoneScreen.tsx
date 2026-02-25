import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SetupDone'>;

export const SetupDoneScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <OnboardingLayout
      title="And we are done."
      image={require('../../assets/setup/rings.png')}
      imageStyle="rings"
    >
      <View style={styles.content}>
        <NeumorphicButton
          label="Continue"
          onPress={() => navigation.replace('Home')}
          variant="raised"
        />
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
  },
});
