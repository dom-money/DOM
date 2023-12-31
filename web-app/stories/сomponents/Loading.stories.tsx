import React from 'react';
import { StoryFn, Meta, StoryObj } from '@storybook/react';

import Loading from '../../components/Loading';
import SendToWalletPageRender from '../../components/SendToWalletPageRender';

export default {
  title: 'Components/Loading',
  component: Loading,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'iphone12promax',
    },
  },
} as Meta<typeof Loading>;

const Template: StoryFn<typeof Loading> = (args) => {
  return (
    <>
      <SendToWalletPageRender
        availableBalance="45725.06"
        inputAmount="10000"
        inputAddress="0xeA2a9ca3d52BEF67Cf562B59c5709B32Ed4c0eca"
        areInputsValid={ true }
      />
      <Loading { ...args } />
    </>
  );
};

type Story = StoryObj<typeof Loading>;

export const Primary: Story = {
  render: Template,

  args: {
    isOpen: true,
    primary: true,
    ariaLabel: 'Showcasing <Loading /> component',
  },
};

export const Default: Story = {
  render: Template,

  args: {
    isOpen: true,
    ariaLabel: 'Showcasing <Loading /> component',
  },
};
