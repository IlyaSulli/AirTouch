import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, scale } from '../constants/theme';

interface DotIndicatorProps {
  total: number;
  current: number;
}

export const DotIndicator: React.FC<DotIndicatorProps> = ({ total, current }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  activeDot: {
    backgroundColor: COLORS.black,
  },
  inactiveDot: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
