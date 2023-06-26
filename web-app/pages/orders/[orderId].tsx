import React, { useCallback, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import useSafeUsdtBalance from '@/hooks/useSafeUsdtBalance';
import { ethers } from 'ethers';
import { EthersAdapter, getSafeContract } from '@safe-global/protocol-kit';
import {
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
  RelayTransaction,
} from '@safe-global/safe-core-sdk-types';
import genericErc20Abi from '@/utils/Erc20.json';

import HeaderGoBack from '@/components/HeaderGoBack';
import TotalBalance from '@/components/TotalBalance';
import Button from '@/components/Button';
import GenericContainer from '@/components/GenericContainer';
import useOrder from '@/hooks/useOrder';
import useTimer from '@/hooks/useTimer';
import { useSafeStore } from '@/store/SafeStore';
import { useAuthContext } from '@/context/AuthContext';
import {
  CHAIN_ID,
  PAYMENT_TOKEN_CONTRACT_ADDRESS,
  PAYMENT_TOKEN_DECIMALS,
} from '@/constants';
import backendClient from '@/lib/axios';
import Image from 'next/image';

const Wrapper = styled.div`
  padding: 1.625rem 0.313rem;
`;

const HeaderWithMargin = styled(HeaderGoBack)`
  margin: 0 2.25rem 0;
`;

const ButtonWithMargin = styled(Button)`
  width: auto;
  padding-inline: 8rem;
  margin: auto;
  margin-top: 1rem;
`;

const ContentContainer = styled.div`
  font-size: 1rem;
  color: white;
`;

const Bold = styled.span`
  font-weight: bold;
`;

const OrderPage: NextPage = () => {
  const router = useRouter();

  const orderId = useMemo(() => {
    if (typeof router.query.orderId !== 'string') return '';

    return router.query.orderId;
  }, [ router.query.orderId ]);

  const walletBalance = useSafeUsdtBalance();
  const order = useOrder(orderId);
  const { setEndTime, remainingSeconds } = useTimer();
  const safeAddress = useSafeStore((state) => state.safeAddress);
  const safe = useSafeStore((state) => state.safe);
  const { signer } = useAuthContext();
  const { user } = useAuthContext();

  const handleConfirmPrice = useCallback(async () => {
    if (!user || !order.data) return;

    await backendClient({
      url: `/orders/${order.data.order.id}/actions`,
      method: 'post',
      data: {
        type: 'user_price_confirm',
      },
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });
  }, [ user, order ]);

  const handleConfirmOrder = useCallback(async () => {
    if (!safeAddress || !signer || !safe || !user || !order) return;

    // Create an instance of the contract
    const tokenContract = new ethers.Contract(
        PAYMENT_TOKEN_CONTRACT_ADDRESS,
        genericErc20Abi,
        signer,
    );

    // Specify the recipient and the amount
    const recipient = order.data.order.polygon_address;
    const amount = ethers.utils.parseUnits(
        order.data.order.usdt_amount.toFixed(PAYMENT_TOKEN_DECIMALS),
        PAYMENT_TOKEN_DECIMALS,
    );

    // Populate the transaction
    const tx = await tokenContract.populateTransaction.transfer(
        recipient,
        amount,
    );
    if (!tx.data) return;

    // Create a transaction object
    const safeTransactionData: MetaTransactionData = {
      to: PAYMENT_TOKEN_CONTRACT_ADDRESS,
      value: '0',
      data: tx.data, // leave blank for native token transfers
      operation: OperationType.Call,
    };
    const options: MetaTransactionOptions = {
      gasLimit: '100000',
      gasToken: PAYMENT_TOKEN_CONTRACT_ADDRESS,
      isSponsored: true,
    };

    const safeTransaction =
      await safe.createTransaction({ safeTransactionData });

    const signedSafeTx = await safe.signTransaction(safeTransaction);
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    });
    const safeSingletonContract = await getSafeContract({
      ethAdapter,
      safeVersion: await safe.getContractVersion(),
    });

    const encodedTx = safeSingletonContract.encode('execTransaction', [
      signedSafeTx.data.to,
      signedSafeTx.data.value,
      signedSafeTx.data.data,
      signedSafeTx.data.operation,
      signedSafeTx.data.safeTxGas,
      signedSafeTx.data.baseGas,
      signedSafeTx.data.gasPrice,
      signedSafeTx.data.gasToken,
      signedSafeTx.data.refundReceiver,
      signedSafeTx.encodedSignatures(),
    ]);


    const relayTransaction: RelayTransaction = {
      target: safeAddress,
      encodedTransaction: encodedTx,
      chainId: CHAIN_ID,
      options,
    };

    await backendClient({
      url: `/orders/${orderId}/actions`,
      method: 'post',
      data: {
        type: 'user_payment_confirm',
        relay_transaction: relayTransaction,
      },
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });
  }, [ order, orderId, safe, safeAddress, signer, user ]);

  useEffect(() => {
    if (!order.data || order.data.order.status !== 'created') return;

    const priceValidityTimestamp =
      new Date(order.data.order.price_valid_until).getTime();
    setEndTime(priceValidityTimestamp);
  }, [ order.data, setEndTime ]);

  if (
    (walletBalance.isLoading || walletBalance.isError) ||
    (order.isLoading || order.isError)
  ) return null;

  return (
    <Wrapper>
      <HeaderWithMargin
        href={ '/' }
      />
      <TotalBalance
        amount={ walletBalance.data.balanceAsString }
        asAvailableBalance
      />
      <GenericContainer
        label={ `Order #${orderId}` }
        content={
          <ContentContainer>
            <p><Bold>PIX address</Bold>: { order.data.order.pix_address }</p>
            <p><Bold>Amount</Bold>: { order.data.order.amount } BRL</p>
            <p><Bold>Price in USDT</Bold>: { order.data.order.usdt_amount }</p>
            <p><Bold>Status</Bold>: {
              order.data.order.status.charAt(0).toUpperCase() +
              order.data.order.status.slice(1)
            }</p>
            {
              order.data.order.receipt_image &&
              order.data.order.receipt_image !== 'fileLink' &&
              <Image
                src={ order.data.order.receipt_image }
                priority
                alt='Receipt Image'
                width={ 500 }
                height={ 500 }
                style={{ marginInline: 'auto', display: 'block' }}
              />
            }
          </ContentContainer>
        } />
      {
        order.data.order.status === 'created' &&
        <ButtonWithMargin
          label={ `Confirm order exchange price (${remainingSeconds})` }
          primary
          onClick={ handleConfirmPrice }
        />
      }
      {
        order.data.order.status === 'accepted_by_provider' &&
        <ButtonWithMargin
          label={ `Confirm order` }
          primary
          onClick={ handleConfirmOrder }
        />
      }
    </Wrapper>
  );
};

export default OrderPage;
