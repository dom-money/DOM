import { SAFE_PROXY_DEPLOYMENT_SALT_NONCE } from '@/constants';
import { ethers } from 'ethers';

const getConstantSaltNonce = () => {
  if (!SAFE_PROXY_DEPLOYMENT_SALT_NONCE) {
    throw new Error('SAFE_PROXY_DEPLOYMENT_SALT_NONCE is not provided');
  };

  const hash = ethers.utils.id(SAFE_PROXY_DEPLOYMENT_SALT_NONCE);
  const saltNonce = ethers.BigNumber.from(hash).toString();
  return saltNonce;
};

export default getConstantSaltNonce;
