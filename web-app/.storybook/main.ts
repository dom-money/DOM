import type { StorybookConfig } from '@storybook/nextjs';
const config: StorybookConfig = {
  stories: [ '../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)' ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-jest',
    '@storybook/addon-mdx-gfm',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      legacyRootApi: false,
      strictMode: true,
    }
  },
  docs: {
    autodocs: 'tag',
  },
};
export default config;
