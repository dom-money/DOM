import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';

import SendToWalletPageRender from '@/components/SendToWalletPageRender';

import AddressQRReader from '@/components/AddressQRReader';
import PaymentStatus from '@/components/PaymentStatus';
import useSafeUsdtBalance from '@/hooks/useSafeUsdtBalance';
import useInputAmount from '@/hooks/useInputAmount';
import useInputAddress from '@/hooks/useInputAddress';
import useQRAddressReader from '@/hooks/useQRAddressReader';
import useSendFromSafe from '@/hooks/useSendFromSafe';

const SendToWalletPage: NextPage = () => {
  const { data: walletBalance, isLoading, isError } = useSafeUsdtBalance();

  const {
    amount: inputAmount,
    amountAsBigNumber: inputAmountAsBigNumber,
    isValid: inputAmountIsValid,
    errorMessage: inputAmountErrorMessage,
    handleChange: inputAmountHandleChange,
    handleClear: inputAmountHandleClear,
  } = useInputAmount({
    balance: walletBalance?.balanceAsBigNumber,
    tokenDecimals: walletBalance?.tokenDecimals,
  });

  const {
    address: inputAddress,
    setAddress: setInputAddress,
    isValid: inputAddessIsValid,
    handleChange: inputAddressHandleChange,
    handleClear: inputAddressHandleClear,
  } = useInputAddress();

  const [
    isQRDialogOpen,
    handleQRDialogOpen,
    handleQRReaderResult,
    handleQRDialogClose,
  ] = useQRAddressReader({ setInputAddress: setInputAddress });

  const sendFromSafe = useSendFromSafe();

  const [ isPaymentStatusOpen, setIsPaymentStatusOpen ] = useState(false);

  useEffect(() => {
    if (sendFromSafe.isSuccess || sendFromSafe.isError) {
      setIsPaymentStatusOpen(true);
    }
  }, [ sendFromSafe.isSuccess, sendFromSafe.isError ]);

  const handleSendFromSafe = () => {
    sendFromSafe.mutate({
      amount: inputAmountAsBigNumber,
      recipient: inputAddress,
    });
  };

  const handlePaymentStatusDrawerClose = (shouldPreserveState?: boolean) => {
    setIsPaymentStatusOpen(false);
    sendFromSafe.reset();

    if (!shouldPreserveState) handleClearInputs();
  };

  const isSubmitReady = inputAmountIsValid && inputAddessIsValid;

  const handleClearInputs = () => {
    inputAmountHandleClear();
    inputAddressHandleClear();
  };

  if (isLoading || isError) {
    return <SendToWalletPageRender isLoading />;
  };

  return (
    <>
      <SendToWalletPageRender
        availableBalance={ walletBalance.balanceAsString }
        inputAmount={ inputAmount }
        onInputAmountChange={ inputAmountHandleChange }
        inputAddress={ inputAddress }
        onInputAddressChange={ inputAddressHandleChange }
        inputAmountErrorMessage={
          inputAmountErrorMessage ?
          inputAmountErrorMessage :
          undefined
        }
        scanQROnClick={ handleQRDialogOpen }
        areInputsValid={ isSubmitReady }
        isSubmitting={ sendFromSafe.isLoading }
        sendButtonOnClick={ handleSendFromSafe }
        clearButtonOnClick={ handleClearInputs }
      />
      <AddressQRReader
        isOpen={ isQRDialogOpen }
        onResult={ handleQRReaderResult }
        onClose={ handleQRDialogClose }
      />
      {
        sendFromSafe.isSuccess &&
        <PaymentStatus
          type='successful'
          isOpen={ isPaymentStatusOpen }
          onClose={ handlePaymentStatusDrawerClose }
          paymentTo={ inputAddress }
          amount={ inputAmount }
          message='Submitted successfully'
          sendAgainOnClick={ handlePaymentStatusDrawerClose }
        />
      }
      {
        sendFromSafe.isError &&
        <PaymentStatus
          type='failed'
          isOpen={ isPaymentStatusOpen }
          onClose={ handlePaymentStatusDrawerClose }
          paymentTo={ inputAddress }
          amount={ inputAmount }
          errorMessage={ sendFromSafe.error.message }
          tryAgainOnClick={ () => handlePaymentStatusDrawerClose(true) }
        />
      }
    </>
  );
};

export default SendToWalletPage;
