import React from 'react';
import { StoryFn, Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/client-api';

import SendToWalletPageRender from '../../components/SendToWalletPageRender';

export default {
  title: 'Pages/Send To Wallet',
  component: SendToWalletPageRender,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'iphone12promax',
    },
    controls: {
      exclude: [ 'isLoading' ],
    },
  },
  argTypes: {
    isLoading: {
      table: {
        disable: true,
      },
    },
    availableBalance: {
      type: {
        name: 'string',
        required: true,
      },
    },
    inputAddress: {
      type: {
        name: 'string',
        required: true,
      },
    },
    areInputsValid: {
      type: {
        name: 'boolean',
        required: true,
      },
    },
    sendButtonOnClick: {
      action: `'Send' Button Clicked`,
    },
    clearButtonOnClick: {
      action: `'Clear' Button Clicked`,
    },
    getContactOnClick: {
      action: `'Get Contact' Button Clicked`,
    },
    scanQROnClick: {
      action: `'Scan QR' Button Clicked`,
    },
  },
} as Meta<typeof SendToWalletPageRender>;

const Template: StoryFn<typeof SendToWalletPageRender> = (args) => {
  const [
    {
      inputAddress,
      onInputAddressChange,
      onInputAddressFocus,
    },
    updateArgs,
  ] = useArgs();

  const handleValueChange = (inputAddress: string) => {
    updateArgs({ inputAddress: inputAddress });
    onInputAddressChange(inputAddress);
  };

  const handleFocus = (prefill?: string) => {
    if (!prefill) {
      return;
    }
    updateArgs({ inputAddress: prefill });
    onInputAddressFocus(prefill);
  };

  return (
    <SendToWalletPageRender
      availableBalance="45725.06"
      areInputsValid={ false }
      { ...args }
      isLoading={ false }
      inputAddress={ inputAddress }
      onInputAddressChange={ handleValueChange }
      onInputAddressFocus={ handleFocus }
    />
  );
};

type Story = StoryObj<typeof SendToWalletPageRender>;

export const Valid: Story = {
  render: Template,

  args: {
    availableBalance: '45725.06',
    inputAmount: '10000',
    inputAddress: '0xeA2a9ca3d52BEF67Cf562B59c5709B32Ed4c0eca',
    areInputsValid: true,
  },
};

export const Empty: Story = {
  render: Template,

  args: {
    availableBalance: '45725.06',
    inputAmount: '',
    inputAddress: '',
    areInputsValid: false,
  },
};

export const WithError: Story = {
  render: Template,

  args: {
    availableBalance: '45725.06',
    inputAmount: '46000',
    inputAddress: '0xeA2a9ca3d52BEF67Cf562B59c5709B32Ed4c0eca',
    inputAmountErrorMessage: 'Not Enough Money',
    areInputsValid: false,
  },
};

export const Submitting: Story = {
  render: Template,

  args: {
    availableBalance: '45725.06',
    inputAmount: '10000',
    inputAddress: '0xeA2a9ca3d52BEF67Cf562B59c5709B32Ed4c0eca',
    areInputsValid: true,
    isSubmitting: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },

  parameters: {
    controls: {
      hideNoControlsWarning: true,
      exclude: [
        'areInputsValid',
        'availableBalance',
        'inputAddress',
        'inputAmount',
        'inputAmountErrorMessage',
        'isSubmitting',
        'onInputAddressChange',
        'onInputAddressFocus',
        'onInputAmountChange',
        'sendButtonOnClick',
        'clearButtonOnClick',
        'getContactOnClick',
        'scanQROnClick',
      ],
    },
  },
};
