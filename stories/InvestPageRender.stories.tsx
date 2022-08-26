import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import InvestPageRender from '../components/InvestPageRender';

export default {
  title: 'Pages/Invest Page',
  component: InvestPageRender,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'iphone12promax',
    },
  },
  argTypes: {
    investButtonOnClick: { action: '\'Invest\' Button Pressed' },
    clearButtonOnClick: { action: '\'Clear\' Button Pressed' },
  },
} as ComponentMeta<typeof InvestPageRender>;

const Template: ComponentStory<typeof InvestPageRender> = (args) =>
  <InvestPageRender {...args} />;

export const Valid = Template.bind({});
Valid.args = {
  totalAmount: 45725.06,
  inputAmount: '10000',
  isInputValid: true,
};

export const Empty = Template.bind({});
Empty.args = {
  totalAmount: 45725.06,
  isInputValid: false,
};

export const WithError = Template.bind({});
WithError.args = {
  totalAmount: 45725.06,
  inputAmount: '46000',
  errorMessage: 'Not Enough Money',
  isInputValid: false,
};