import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design was made for 402x874 viewport
const BASE_WIDTH = 402;
const BASE_HEIGHT = 874;

export const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

export const COLORS = {
  background: '#F6FBFF',
  black: '#000000',
  white: '#FFFFFF',
  green: '#00BA34',
  greenDark: 'rgba(0, 130, 36, 0.90)',
  greenLight: 'rgba(0, 242, 68, 0.90)',
  greenShadow1: 'rgba(0, 130, 36, 0.20)',
  greenShadow2: 'rgba(0, 130, 36, 0.50)',
  greenShadow3: 'rgba(0, 242, 68, 0.30)',
  greenBoxDark: 'rgba(0, 167, 47, 0.90)',
  greenBoxLight: 'rgba(0, 205, 57, 0.90)',
  greenBoxShadow1: 'rgba(0, 167, 47, 0.20)',
  greenBoxShadow2: 'rgba(0, 167, 47, 0.50)',
  greenBoxShadow3: 'rgba(0, 205, 57, 0.30)',
  red: '#F52E2E',
  redDark: '#DD2A2A',
  redShadowDark: 'rgba(163, 31, 31, 0.90)',
  redShadowLight: 'rgba(255, 57, 57, 0.90)',
  redShadow1: 'rgba(163, 31, 31, 0.20)',
  redShadow2: 'rgba(163, 31, 31, 0.50)',
  redShadow3: 'rgba(255, 57, 57, 0.30)',
  neumorphShadowDark: 'rgba(230, 230, 230, 0.90)',
  neumorphShadowLight: 'rgba(255, 255, 255, 0.90)',
  neumorphShadow1: 'rgba(230, 230, 230, 0.20)',
  neumorphShadow2: 'rgba(230, 230, 230, 0.50)',
  neumorphShadow3: 'rgba(255, 255, 255, 0.30)',
  raisedShadowDark: 'rgba(174, 174, 174, 0.90)',
  raisedShadowLight: 'rgba(255, 255, 255, 0.90)',
  raisedShadow1: 'rgba(174, 174, 174, 0.20)',
  raisedShadow2: 'rgba(174, 174, 174, 0.50)',
  raisedShadow3: 'rgba(255, 255, 255, 0.30)',
  boxShadowDark: 'rgba(224, 224, 224, 0.90)',
  boxShadowLight: 'rgba(255, 255, 255, 0.90)',
  boxShadow1: 'rgba(224, 224, 224, 0.20)',
  boxShadow2: 'rgba(224, 224, 224, 0.50)',
  boxShadow3: 'rgba(255, 255, 255, 0.30)',
};

export const FONTS = {
  mono: 'IBMPlexMono_500Medium',
  monoBold: 'IBMPlexMono_700Bold',
};
