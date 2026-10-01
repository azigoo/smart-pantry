export const fonts = {
  display: 'Baloo2_700Bold',
  displaySemibold: 'Baloo2_600SemiBold',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_800ExtraBold',
} as const;

export const type = {
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.displaySemibold, fontSize: 18, lineHeight: 24 },
  bigNumber: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 20 },
} as const;
