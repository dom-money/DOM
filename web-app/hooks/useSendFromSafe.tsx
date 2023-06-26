import { ethers, BigNumber } from 'ethers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Safe, {
  EthersAdapter,
  getSafeContract,
} from '@safe-global/protocol-kit';
import { GelatoRelayPack } from '@safe-global/relay-kit';
import {
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
  RelayTransaction,
} from '@safe-global/safe-core-sdk-types';
import { useAuthContext } from '@/context/AuthContext';
import { useEthAdapter, useSafe, useSafeAddress } from '@/store/SafeStore';
import { useRelayAdapter } from '@/store/GelatoRelayStore';
import { Signer } from './useAuth';
import pollRelayTaskStatus, {
  TaskStatus,
} from '@/services/safe/infra/pollRelayTaskStatus';
import { CHAIN_ID, PAYMENT_TOKEN_CONTRACT_ADDRESS } from '@/constants';
import genericErc20Abi from '@/utils/Erc20.json';

type TransactionData = {
  amount: BigNumber,
  recipient: string,
};

const sendFromSafe = async (
    signer: Signer | null,
    safe: Safe | null,
    safeAddress: string | null,
    ethAdapter: EthersAdapter | null,
    relayAdapter: GelatoRelayPack,
    transactionData: TransactionData,
) => {
  if (!signer || !safe || !safeAddress || !ethAdapter) {
    // eslint-disable-next-line max-len
    throw new Error('signer, safe, safeAddress or ethAdapter are not initialized');
  };

  // Create an instance of the contract
  const tokenContract = new ethers.Contract(
      PAYMENT_TOKEN_CONTRACT_ADDRESS,
      genericErc20Abi,
      signer,
  );

  const { amount, recipient } = transactionData;

  // Populate the transaction
  const tx = await tokenContract.populateTransaction.transfer(
      recipient,
      amount,
  );
  if (!tx.data) throw new Error('The population of transaction failed');

  // Create a transaction object
  const safeTransactionData: MetaTransactionData = {
    to: PAYMENT_TOKEN_CONTRACT_ADDRESS,
    value: '0',
    data: tx.data,
    operation: OperationType.Call,
  };

  const options: MetaTransactionOptions = {
    gasLimit: '100000',
    gasToken: PAYMENT_TOKEN_CONTRACT_ADDRESS,
    isSponsored: true,
  };

  const safeTransaction = await safe.createTransaction({ safeTransactionData });

  const signedSafeTx = await safe.signTransaction(safeTransaction);
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

  const { taskId } = await relayAdapter.relayTransaction(relayTransaction);

  const transactionResponse = await pollRelayTaskStatus(taskId, relayAdapter);

  return transactionResponse;
};

const useSendFromSafe = () => {
  const { signer } = useAuthContext();
  const safe = useSafe();
  const safeAddress = useSafeAddress();
  const ethAdapter = useEthAdapter();
  const relayAdapter = useRelayAdapter();

  const queryClient = useQueryClient();

  return useMutation<TaskStatus, Error, TransactionData>({
    mutationFn: (transactionData: TransactionData) => {
      return sendFromSafe(
          signer,
          safe,
          safeAddress,
          ethAdapter,
          relayAdapter,
          transactionData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ 'safeUsdtBalance' ] });
    },
  });
};

export default useSendFromSafe;
