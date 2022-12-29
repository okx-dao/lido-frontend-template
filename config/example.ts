import { CHAINS } from '@lido-sdk/constants';

export const EXAMPLE_BY_NETWORK: {
  [key in CHAINS]: string;
} = {
  [CHAINS.Mainnet]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Ropsten]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Rinkeby]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Goerli]: '0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F',
  [CHAINS.Kovan]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kintsugi]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Kiln]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonbeam]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonriver]: '0x0000000000000000000000000000000000000000',
  [CHAINS.Moonbase]: '0x0000000000000000000000000000000000000000',
};

export const getExampleAddress = (chainId: CHAINS): string => {
  return EXAMPLE_BY_NETWORK[chainId];
};
