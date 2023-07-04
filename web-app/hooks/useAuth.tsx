import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES } from '@web3auth/base';
import {
  OpenloginAdapter,
  OpenloginUserInfo,
} from '@web3auth/openlogin-adapter';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';
import { WalletConnectV2Adapter } from '@web3auth/wallet-connect-v2-adapter';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import deploySafe from '@/services/safe/deploySafe';
import { useGlobalLoadingContext } from '@/store/GlobalLoadingStore';
import { useRelayAdapter } from '@/store/GelatoRelayStore';
import { useSafeActions } from '@/store/SafeStore';
import {
  WEB3_AUTH_CLIENT_ID,
  WEB3_AUTH_NETWORK_TYPE,
  DEFAULT_USER,
  CHAIN_ID_HEX,
  RPC_TARGET,
  SAFE_TRANSACTION_SERVICE_URL,
} from '@/constants';

export type Web3AuthProvider = NonNullable<Web3Auth['provider']>;
export type Provider = ethers.providers.Web3Provider;
export type Signer = ethers.providers.JsonRpcSigner;
export type User = typeof DEFAULT_USER & Partial<OpenloginUserInfo>;

const useAuth = () => {
  const [ web3Auth, setWeb3Auth ] = useState<Web3Auth | null>(null);
  const [ provider, setProvider ] = useState<Provider | null>(null);
  const [ signer, setSigner ] = useState<Signer | null>(null);
  const [ user, setUser ] = useState<User | null>(null);

  const { setIsAuthLoaded } = useGlobalLoadingContext();
  const router = useRouter();
  const relayAdapter = useRelayAdapter();
  const {
    setSafeService,
    setSafe,
    setSafeAddress,
    setEthAdapter,
  } = useSafeActions();

  const effectCalled = useRef(false);

  const initWeb3Auth = useCallback(async () => {
    const web3Auth = new Web3Auth({
      clientId: WEB3_AUTH_CLIENT_ID,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: CHAIN_ID_HEX,
        rpcTarget: RPC_TARGET,
      },
      uiConfig: {
        appName: 'DOM',
        appLogo: `${location.origin}/images/logo/logo-dark.svg`,
        theme: 'dark',
      },
    });

    const openloginAdapter = new OpenloginAdapter({
      adapterSettings: {
        network: WEB3_AUTH_NETWORK_TYPE,
        uxMode: 'popup',
        whiteLabel: {
          name: 'DOM Wallet',
          logoLight: `${location.origin}/images/logo/logo-light-with-text.svg`,
          logoDark: `${location.origin}/images/logo/logo-dark-with-text.svg`,
          defaultLanguage: 'en',
          dark: true,
        },
      },
    });
    const metamaskAdapter = new MetamaskAdapter({
      clientId: WEB3_AUTH_CLIENT_ID,
    });

    web3Auth.configureAdapter(openloginAdapter);
    web3Auth.configureAdapter(metamaskAdapter);
    web3Auth.configureAdapter(new WalletConnectV2Adapter());

    await web3Auth.initModal();
    setWeb3Auth(web3Auth);

    return web3Auth;
  }, []);

  const initProviderAndSinger = useCallback(
      (web3AuthProvider: Web3AuthProvider) => {
        const provider = new ethers.providers.Web3Provider(web3AuthProvider);

        // Implementing reload on network change
        provider.on('network', (newNetwork, oldNetwork) => {
          // When a Provider makes its initial connection, it emits a "network"
          // event with a null oldNetwork along with the newNetwork. So, if the
          // oldNetwork exists, it represents a changing network
          if (oldNetwork) router.reload();
        });
        setProvider(provider);
        const signer = provider.getSigner();
        setSigner(signer);
        return signer;
      },
      [ router ],
  );

  const initSafe = useCallback(async (signer: Signer) => {
    const walletAddress = await signer.getAddress();

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer,
    });

    const safeService = new SafeApiKit({
      txServiceUrl: SAFE_TRANSACTION_SERVICE_URL,
      ethAdapter,
    });

    // Setting safeService and ethAdapter as global state
    setSafeService(safeService);
    setEthAdapter(ethAdapter);

    const { safes } = await safeService.getSafesByOwner(walletAddress);

    let safe: Safe;

    if (safes.length === 0) {
      // Deploying a safe
      safe = await deploySafe(ethAdapter, signer, relayAdapter);
    } else {
      // Loading existing safe
      console.log(`Available Safes:\n\t${safes.join('\n\t')}`);

      safe = await Safe.create({
        ethAdapter,
        safeAddress: safes[ safes.length - 1 ],
      });
    };

    // Setting safe as global state
    setSafe(safe);

    const safeAddress = await safe.getAddress();

    // Setting safeAddress as global state
    setSafeAddress(safeAddress);

    console.log('Loaded Safe:', safeAddress);
  }, [ relayAdapter, setSafeService, setSafe, setSafeAddress, setEthAdapter ]);

  const initUser = useCallback(async (
      web3Auth: Web3Auth,
      web3AuthProvider: Web3AuthProvider,
  ) => {
    const signer = initProviderAndSinger(web3AuthProvider);

    setIsAuthLoaded(false);
    await initSafe(signer);
    setIsAuthLoaded(true);

    console.log(await web3Auth.getUserInfo());

    setUser({
      ...DEFAULT_USER,
      ...await web3Auth.getUserInfo(),
    });
  }, [ initProviderAndSinger, initSafe, setIsAuthLoaded ]);

  useEffect(() => {
    if (effectCalled.current) return;

    const initAuth = async () => {
      try {
        const web3Auth = await initWeb3Auth();

        // If user has active session
        if (web3Auth.connected && web3Auth.provider) {
          await initUser(web3Auth, web3Auth.provider);
        };
      } catch (error) {
        console.error(error);
      } finally {
        setIsAuthLoaded(true);
      };
    };

    initAuth();
    effectCalled.current = true;
  }, [ initUser, initWeb3Auth, setIsAuthLoaded ]);

  const login = useCallback(async () => {
    if (!web3Auth) {
      console.log('web3Auth not initialized yet');
      return;
    };
    const web3AuthProvider = await web3Auth.connect();
    if (!web3AuthProvider) return;

    await initUser(web3Auth, web3AuthProvider);
  }, [ web3Auth, initUser ]);

  const logout = useCallback(async () => {
    if (!web3Auth) {
      console.log('web3Auth not initialized yet');
      return;
    }
    await web3Auth.logout();
    setUser(null);
    setProvider(null);
    setSigner(null);
    setSafeService(null);
    setSafe(null);
    setSafeAddress(null);
  }, [ web3Auth, setSafe, setSafeAddress, setSafeService ]);

  return {
    user,
    provider,
    signer,
    login,
    logout,
  };
};

export default useAuth;
