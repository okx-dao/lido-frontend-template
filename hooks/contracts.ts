import { contractHooksFactory } from '@lido-sdk/react';
import { getExampleAddress, getLidoOracleAddress } from 'config';
import { ExampleAbi__factory, LidoOracleAbi__factory } from 'generated';

const example = contractHooksFactory(ExampleAbi__factory, (chainId) =>
  getExampleAddress(chainId),
);
export const useExampleContractRPC = example.useContractRPC;
export const useExampleContractWeb3 = example.useContractWeb3;

const lidoOracle = contractHooksFactory(LidoOracleAbi__factory, (chainId) =>
  getLidoOracleAddress(chainId),
);
export const useLidoOracleContractRPC = lidoOracle.useContractRPC;
export const useLidoOracleContractWeb3 = lidoOracle.useContractWeb3;
