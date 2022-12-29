import {
  API,
  wrapRequest,
  cacheControl,
  defaultErrorHandler,
} from '@lidofinance/next-api-wrapper';
import { CHAINS, TOKENS, getTokenAddress } from '@lido-sdk/constants';
import { serverLogger } from 'utils';

// Proxy for third-party API.
// Returns 1inch rate
// Example showing how to use API wrappers (error handler and cahce control)
const oneInchRate: API = async (req, res) => {
  const amount = 10 ** 18;
  const api = `https://api.1inch.exchange/v3.0/1/quote`;
  const query = new URLSearchParams({
    fromTokenAddress: getTokenAddress(CHAINS.Goerli, TOKENS.STETH),
    toTokenAddress: getTokenAddress(CHAINS.Goerli, TOKENS.WSTETH),
    amount: amount.toString(),
  });
  const url = `${api}?${query.toString()}`;
  const response = await fetch(url);

  const data: { toTokenAmount: string } = await response.json();

  const rate = parseFloat(data.toTokenAmount) / amount;

  res.json(rate);
};

export default wrapRequest([
  cacheControl(),
  defaultErrorHandler({ serverLogger }),
])(oneInchRate);
