import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { scale, verticalScale } from '../constants/theme';

interface NumberArrowSvgProps {
  width?: number;
  height?: number;
}

export const NumberArrowSvg: React.FC<NumberArrowSvgProps> = ({
  width = scale(92),
  height = verticalScale(183),
}) => (
  <Svg width={width} height={height} viewBox="0 0 92 183" fill="none">
    <Path
      d="M62.6439 158.617V183H92V158.617V0H46.6553L0 50.6003L18.0855 66.8553L60.547 21.4986H62.6439V158.617Z"
      fill="url(#paint0_linear_61_1193)"
    />
    <Path
      d="M16.073 49.8977L21.8977 44.0729M21.8977 44.0729L16.073 44.0729M21.8977 44.0729L21.8977 49.8977"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M43.073 20.8977L48.8977 15.0729M48.8977 15.0729L43.073 15.0729M48.8977 15.0729L48.8977 20.8977"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M78.0606 23.942V32.1794M78.0606 32.1794L82.1793 28.0607M78.0606 32.1794L73.9419 28.0607"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M78.0606 63.942V72.1794M78.0606 72.1794L82.1793 68.0607M78.0606 72.1794L73.9419 68.0607"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M78.0606 103.942V112.179M78.0606 112.179L82.1793 108.061M78.0606 112.179L73.9419 108.061"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_61_1193"
        x1={75.5225}
        y1={51.9112}
        x2={75.5225}
        y2={113.086}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#000000" />
        <Stop offset={1} stopColor="#666666" />
      </LinearGradient>
    </Defs>
  </Svg>
);
