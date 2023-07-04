/* eslint-disable no-unused-vars */
import { OPENLOGIN_NETWORK_TYPE } from '@web3auth/modal';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID: string;
      NEXT_PUBLIC_WEB3_AUTH_NETWORK_TYPE: OPENLOGIN_NETWORK_TYPE;
      NEXT_PUBLIC_SAFE_TRANSACTION_SERVICE_URL: string;
      NEXT_PUBLIC_SAFE_PROXY_DEPLOYMENT_SALT_NONCE?: string;
      NEXT_PUBLIC_GELATO_RELAY_API_KEY: string;
      NEXT_PUBLIC_CHAIN_ID: string;
      NEXT_PUBLIC_CHAIN_ID_HEX: string;
      NEXT_PUBLIC_RPC_TARGET: string;
      NEXT_PUBLIC_CHAIN_EXPLORER_API_URL: string;
      NEXT_PUBLIC_CHAIN_EXPLORER_URL: string;
      NEXT_PUBLIC_PAYMENT_TOKEN_CONTRACT_ADDRESS: string;
      NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS: string;
      NEXT_PUBLIC_DOM_CONTRACT_ADDRESS: string;
      NEXT_PUBLIC_P2P_SERVICE_API_URL?: string;
      NEXT_PUBLIC_IS_P2P_SERVICE_ENABLED?: 'true' | 'false';
    };
  };
};

export {};
