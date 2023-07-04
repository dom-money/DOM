import React from 'react';
import type { NextPage } from 'next';

import MainPageRender from '@/components/MainPageRender';
import PixCodeQRReader from '@/components/PixCodeQRReader';

import { useAuthContext } from '@/context/AuthContext';
import useSafeUsdtBalance from '@/hooks/useSafeUsdtBalance';
import useWealthBalance from '@/hooks/useWealthBalance';
import useTransactions from '@/hooks/useTransactions';
import usePixCodeQRReader from '@/hooks/usePixCodeQRReader';
import { sumTwoBalancesOfToken } from '@/utils/BigNumberUtils';
import { DEFAULT_USER, IS_P2P_SERVICE_ENABLED } from '@/constants';

const MainPage: NextPage = () => {
  const { user } = useAuthContext();

  const walletBalance = useSafeUsdtBalance();
  const wealthBalance = useWealthBalance();
  const transactions = useTransactions();

  const [
    isQRDialogOpen,
    handleQRDialogOpen,
    handleQRReaderResult,
    handleQRDialogClose,
    isCreatingOrder,
  ] = usePixCodeQRReader();

  if (
    (walletBalance.isLoading || walletBalance.isError) ||
    (wealthBalance.isLoading || wealthBalance.isError) ||
    (transactions.isLoading || transactions.isError) ||
    !user
  ) {
    return <MainPageRender isLoading userName={ DEFAULT_USER.name } />;
  };

  const totalBalance = sumTwoBalancesOfToken(
      walletBalance.data.balanceAsBigNumber,
      wealthBalance.data.balanceAsBigNumber,
      walletBalance.data.tokenDecimals,
  );

  return (
    <>
      <MainPageRender
        scanQROnClick={
          IS_P2P_SERVICE_ENABLED ? handleQRDialogOpen : undefined
        }
        totalBalanceAmount={ totalBalance }
        walletAmount={ walletBalance.data.balanceAsString }
        wealthAmount={ wealthBalance.data.balanceAsString }
        averageAPY={ wealthBalance.data.apy }
        transactions={ transactions.formattedData }
        isLoadingMoreTransactions={ transactions.isLoadingMore }
        onLoadMoreTransactions={ transactions.handleLoadMoreTransactions }
        userName={ user.name }
        avatarImageURL={ user.profileImage }
        isSubmitting={ isCreatingOrder }
      />
      {
        IS_P2P_SERVICE_ENABLED &&
        <PixCodeQRReader
          isOpen={ isQRDialogOpen }
          onResult={ handleQRReaderResult }
          onClose={ handleQRDialogClose }
        />
      }
    </>
  );
};

export default MainPage;
