/* eslint-disable max-len */

// Auth
export const DEFAULT_USER = {
  email: '',
  name: 'Anonymous User',
  profileImage: '',
};

// Web3Auth
export const WEB3_AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID;
export const WEB3_AUTH_NETWORK_TYPE = process.env.NEXT_PUBLIC_WEB3_AUTH_NETWORK_TYPE;

// Safe
export const SAFE_TRANSACTION_SERVICE_URL = process.env.NEXT_PUBLIC_SAFE_TRANSACTION_SERVICE_URL;
export const SAFE_PROXY_DEPLOYMENT_SALT_NONCE = process.env.NEXT_PUBLIC_SAFE_PROXY_DEPLOYMENT_SALT_NONCE;

// Gelato Relay
export const GELATO_RELAY_API_KEY = process.env.NEXT_PUBLIC_GELATO_RELAY_API_KEY;

// Chain
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10);
export const CHAIN_ID_HEX = process.env.NEXT_PUBLIC_CHAIN_ID_HEX;
export const RPC_TARGET = process.env.NEXT_PUBLIC_RPC_TARGET;
export const CHAIN_EXPLORER_API_URL = process.env.NEXT_PUBLIC_CHAIN_EXPLORER_API_URL;
export const CHAIN_EXPLORER_URL = process.env.NEXT_PUBLIC_CHAIN_EXPLORER_URL;

// Payment Token
export const PAYMENT_TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_TOKEN_CONTRACT_ADDRESS;
export const PAYMENT_TOKEN_DECIMALS = parseInt(process.env.NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS, 10);

// DOM Contract
export const DOM_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DOM_CONTRACT_ADDRESS;

// P2P Service API
export const P2P_SERVICE_API_URL = process.env.NEXT_PUBLIC_P2P_SERVICE_API_URL;
export const IS_P2P_SERVICE_ENABLED = process.env.NEXT_PUBLIC_IS_P2P_SERVICE_ENABLED === 'true';
