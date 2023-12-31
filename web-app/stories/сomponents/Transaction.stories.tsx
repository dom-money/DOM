import { Meta, StoryObj } from '@storybook/react';

import Transaction from '../../components/Transaction';

export default {
  title: 'Components/Transaction',
  component: Transaction,
  decorators: [
    (story) => (
      <div
        style={{
          display: 'flex',
          alignSelf: 'center',
          height: '100vh',
          width: 'min(100% - 2rem, 600px)',
          marginInline: 'auto',
        }}
      >
        { story() }
      </div>
    ),
  ],
  argTypes: {
    isLoading: {
      table: {
        disable: true,
      },
    },
    id: {
      type: { name: 'string', required: true },
    },
    name: {
      type: { name: 'string', required: true },
    },
    // TBD: prop 'type' should be displayed as required, but it's ...
    // ..currently not possible to implement correctly due to this problem: ...
    // .. https://github.com/storybookjs/storybook/issues/12028
    timestamp: {
      type: { name: 'number', required: true },
      control: 'date',
    },
    amount: {
      type: { name: 'string', required: true },
    },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      inlineStories: false,
      iframeHeight: 250,
    },
    backgrounds: { default: 'darkAdditional' },
  },
} as Meta<typeof Transaction>;

type Story = StoryObj<typeof Transaction>;

export const CryptoTopUp: Story = {
  args: {
    id: '1',
    name: 'Deposit from 0xEe5b9E3a125F5c6c74cE8AEbFa76b72B3D6CF009',
    type: 'Crypto Top Up',
    timestamp: new Date().getTime(),
    amount: '1000.00',
  },
};

export const CardTopUp: Story = {
  args: {
    id: '2',
    name: 'Revolut LTD Visa *8035',
    type: 'Card Top Up',
    timestamp: new Date().getTime() - 86400000,
    amount: '560.00',
  },
};

export const Invest: Story = {
  args: {
    id: '3',
    name: 'Wallet to Wealth',
    type: 'Invest',
    timestamp: new Date().getTime() - 5 * 86400000,
    amount: '750.37',
  },
};

export const Withdraw: Story = {
  args: {
    id: '4',
    name: 'Wealth to Wallet',
    type: 'Withdraw',
    timestamp: new Date().getTime() - 14 * 86400000,
    amount: '764.13',
  },
};

export const Transfer: Story = {
  args: {
    id: '5',
    name: 'Transfer to 0xEe5b9E3a125F5c6c74cE8AEbFa76b72B3D6CF009',
    type: 'Transfer',
    timestamp: new Date().getTime() - 365 * 86400000,
    amount: '250.17',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },

  parameters: {
    controls: {
      hideNoControlsWarning: true,
      exclude: [ 'id', 'name', 'type', 'timestamp', 'amount', 'isLoading' ],
    },
  },
};
