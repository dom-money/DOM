import React from 'react';
import { screen } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { renderWithProviders } from '../utils';
import MainPage from '@/pages';
import { useAuthContext } from '@/context/AuthContext';
import * as useSafeUsdtBalance from '@/hooks/useSafeUsdtBalance';
import * as useWealthBalance from '@/hooks/useWealthBalance';

const MOCK_ADDRESS = {
  withTransactions: '0x64ff637fb478863b7468bc97d30a5bf3a428a1fa',
  noTransactions: '0x64ff637fb478863b7468bc97d30a5bf3a428a1fd',
};

jest.mock('../../context/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../hooks/useSafeUsdtBalance', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../hooks/useWealthBalance', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const useAuthContextMock = useAuthContext as jest.Mock;
const useSafeUsdtBalanceMock = useSafeUsdtBalance.default as jest.Mock;
const useWealthBalanceMock = useWealthBalance.default as jest.Mock;

// Setting up mocks
beforeEach(() => {
  useAuthContextMock.mockReturnValue({
    user: {
      email: '',
      name: 'Anonymous User',
      profileImage: '',
    },
    signer: {
      getAddress: () => MOCK_ADDRESS.noTransactions,
    },
  });
  useSafeUsdtBalanceMock.mockReturnValue({
    data: {
      balanceAsString: '1000.0',
      balanceAsBigNumber: BigNumber.from(1000 * 1e6),
      tokenDecimals: 6,
    },
    isLoading: false,
    isError: false,
  });
  useWealthBalanceMock.mockReturnValue({
    data: {
      balanceAsString: '100.0',
      balanceAsBigNumber: BigNumber.from(100 * 1e6),
      tokenDecimals: 6,
      apy: 10,
      rewards: '0',
    },
    isLoading: false,
    isError: false,
  });
});

describe('Main Page', () => {
  test('displays correct total balance,', async () => {
    renderWithProviders(<MainPage />);

    const totalBalance = await screen.findByText('1,100');

    expect(totalBalance).toBeVisible();
  });

  test('displays correct wallet balance', async () => {
    renderWithProviders(<MainPage />);

    const walletBalance = await screen.findByText('1,000');

    expect(walletBalance).toBeVisible();
  });

  test('displays correct wealth balance', async () => {
    renderWithProviders(<MainPage />);

    const wealthBalance = await screen.findByText('100');

    expect(wealthBalance).toBeVisible();
  });

  test('displays "No transactions" message"', async () => {
    renderWithProviders(<MainPage />);

    const emptyTransactionsText =
      await screen.findByText('Make your first transaction! ✨');

    expect(emptyTransactionsText).toBeVisible();
  });

  test('displays transactions', async () => {
    // TBD: Works, but overrides returned value for next tests
    useAuthContextMock.mockReturnValue({
      user: {
        email: '',
        name: 'Anonymous User',
        profileImage: '',
      },
      signer: {
        getAddress: () => MOCK_ADDRESS.withTransactions,
      },
    });
    renderWithProviders(<MainPage />);

    const firstTransaction = await screen.findByText(
        'Transfer to 0xe09b59e73e61b4cbacdc99db87f049fc0fa23a4b',
    );

    const secondTransaction = await screen.findByText(
        'Transfer to 0x1d32a345b2058f7ca092531815d02ac9ae45adf4',
    );

    expect(firstTransaction).toBeVisible();
    expect(secondTransaction).not.toBeVisible();
  });
});
