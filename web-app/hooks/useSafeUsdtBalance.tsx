import { ethers, BigNumber } from 'ethers';
import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useSafeStore } from '@/store/SafeStore';
import SafeApiKit from '@safe-global/api-kit';
import {
  PAYMENT_TOKEN_CONTRACT_ADDRESS,
  SAFE_TRANSACTION_SERVICE_URL,
  PAYMENT_TOKEN_DECIMALS,
} from '@/constants';

type GetSafeUsdtBalance = (
  safeService: SafeApiKit | null,
  ownerAddress: string | null
) => Promise<{
  balanceAsString: string;
  balanceAsBigNumber: BigNumber;
  tokenDecimals: number;
}>;

const getSafeUsdtBalance: GetSafeUsdtBalance = (
    safeService,
    safeAddress,
) => {
  if (!safeService || !safeAddress ) {
    throw new Error('safeService and safeAddress are not initialized');
  };

  // eslint-disable-next-line max-len
  return axios.get(`${SAFE_TRANSACTION_SERVICE_URL}/api/v1/safes/${safeAddress}/balances`)
      .then((resp) => {
        const tokens = resp.data;
        console.log(tokens);
        const usdt = tokens.find((token: any) =>
          token.tokenAddress === PAYMENT_TOKEN_CONTRACT_ADDRESS,
        );
        if (!usdt) {
          return {
            balanceAsString: '0',
            balanceAsBigNumber: BigNumber.from(0),
            tokenDecimals: PAYMENT_TOKEN_DECIMALS,
          };
        }

        const balanceAsBigNumber = BigNumber.from(usdt.balance);
        const tokenDecimals = usdt.token.decimals;

        const balanceAsString = ethers.utils.formatUnits(
            balanceAsBigNumber,
            tokenDecimals,
        );

        return {
          balanceAsString,
          balanceAsBigNumber,
          tokenDecimals,
        };
      }).catch((error: AxiosError) => {
        if (error.status === 404) {
          return {
            balanceAsString: '0',
            balanceAsBigNumber: BigNumber.from(0),
            tokenDecimals: PAYMENT_TOKEN_DECIMALS,
          };
        };

        throw (error);
      });
};

const useSafeUsdtBalance = () => {
  const safeService = useSafeStore((state) => state.safeService);
  const safeAddress = useSafeStore((state) => state.safeAddress);

  return useQuery(
      [ 'safeUsdtBalance', safeAddress ],
      () => getSafeUsdtBalance(safeService, safeAddress),
      {
        // The query will not execute until the `safeService` and  ...
        // .. `safeAddress` are initialized
        enabled: !!safeService && !!safeAddress,
        // New data on key change will be swapped without Loading state
        keepPreviousData: true,
      },
  );
};

export default useSafeUsdtBalance;
