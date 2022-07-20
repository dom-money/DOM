import React from 'react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { ThemeProvider } from 'styled-components';

import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import GlobalStyle from '../styles/global';
import theme from '../styles/theme';

export const decorators = [
    Story => (
      <>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Story />
        </ThemeProvider>
      </>
    )
  ];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: 'centered',
  backgrounds: {
    default: 'darkMain',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'darkMain',
        value: '#020202;',
      },
      {
        name: 'darkAdditional',
        value: '#1A1A1A;',
      },
    ],
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  nextRouter: {
    Provider: RouterContext.Provider,
  },
}