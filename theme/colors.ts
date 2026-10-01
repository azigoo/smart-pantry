export const colors = {
  background: '#FBF3E4',
  surface: '#FFFFFF',
  ink: '#2E2A24',
  inkMuted: '#8A7F6E',
  border: '#EADFC8',

  primary: '#E8672E', // naranja Smart Pantry (logo, CTAs principales)
  primaryDark: '#C9531F',
  secondary: '#3F8F6F', // verde (headers, éxito, check)
  secondaryDark: '#2E6E54',

  danger: '#D64545',
  warning: '#D69A2D',

  cardYellow: '#FCE6A2',
  cardYellowText: '#7A5B12',
  cardBlue: '#C7E4EE',
  cardBlueText: '#2C6478',
  cardPink: '#F6CFD3',
  cardPinkText: '#8A3C43',
  cardLavender: '#D9DEF0',
  cardLavenderText: '#454E7A',
} as const;

export type AppColors = typeof colors;
