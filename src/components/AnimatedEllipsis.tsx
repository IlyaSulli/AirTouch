import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { COLORS, FONTS, scale } from '../constants/theme';

interface AnimatedEllipsisProps {
  text: string;
}

export const AnimatedEllipsis: React.FC<AnimatedEllipsisProps> = ({ text }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createWave = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay),
        ])
      );

    const anim1 = createWave(dot1, 0);
    const anim2 = createWave(dot2, 200);
    const anim3 = createWave(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const interpolate = (dot: Animated.Value) =>
    dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -4],
    });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.dot,
            { transform: [{ translateY: interpolate(dot) }] },
          ]}
        >
          .
        </Animated.Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: scale(15),
    fontFamily: FONTS.mono,
    color: COLORS.black,
    textAlign: 'center',
  },
  dot: {
    fontSize: scale(15),
    fontFamily: FONTS.mono,
    color: COLORS.black,
  },
});
