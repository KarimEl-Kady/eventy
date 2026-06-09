import { TextStyle } from 'react-native';

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: '700',
  } as TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  } as TextStyle,
  caption: {
    fontSize: 11,
    fontWeight: '500',
  } as TextStyle,
  button: {
    fontSize: 16,
    fontWeight: '700',
  } as TextStyle,
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
} as const;
