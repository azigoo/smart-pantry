export const colors = {
  background: '#FBF3E4',
  surface: '#FFFFFF',
  ink: '#2E2A24',
  inkMuted: '#6F665A',
  border: '#EADFC8',

  primary: '#B74417', // naranja Smart Pantry (logo, CTAs principales)
  primaryDark: '#983912',
  secondary: '#2E6E54', // verde (headers, éxito, check)
  secondaryDark: '#23543F',

  danger: '#B4232D',
  warning: '#8A5A00',

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
