import { contractHooksFactory } from '@lido-sdk/react';
import { getExampleAddress } from 'config';
import { ExampleAbi__factory, IStETH__factory } from 'generated';
import { ILido__factory } from 'generated';
import { WstETH__factory } from 'generated';
import { getLidoAddress } from 'config';
import { getLidoWstethAddress } from 'config';

const example = contractHooksFactory(ExampleAbi__factory, (chainId) =>
  getExampleAddress(chainId),
);
export const useExampleContractRPC = example.useContractRPC;
export const useExampleContractWeb3 = example.useContractWeb3;

const lido = contractHooksFactory(ILido__factory, (chainId) =>
  getLidoAddress(chainId),
);
export const useLidoContractRpc = lido.useContractRPC;
export const useLidoContractWeb3 = lido.useContractWeb3;

const wstETH = contractHooksFactory(WstETH__factory, (chainId) =>
  getLidoWstethAddress(chainId),
);
export const useWstETHContractRpc = wstETH.useContractRPC;
export const useWstETHContractWeb3 = wstETH.useContractWeb3;

const stETH = contractHooksFactory(IStETH__factory, (chainId) =>
  getLidoAddress(chainId),
);
export const useStETHContractRpc = stETH.useContractRPC;
export const useStETHContractWeb3 = stETH.useContractWeb3;
