import React, { FC, useEffect, useState } from 'react';
import {
  Block,
  DataTable,
  DataTableRow,
  Success,
  Error,
  Loader,
  Modal,
  Text,
  Link,
} from '@lidofinance/lido-ui';
import {
  useEthereumBalance,
  useSDK,
  useSTETHBalance,
  useWSTETHBalance,
} from '@lido-sdk/react';
import {
  useStETHContractRpc,
  useStETHContractWeb3,
  useWstETHContractRpc,
  useWstETHContractWeb3,
} from 'hooks';
import { BigNumber, utils } from 'ethers';
import { formatBalance } from 'utils';
import SubmitOrConnect from 'components/submitOrConnect';
// import { useWeb3 } from '@reef-knot/web3-react';
import { useContractSWR } from '@lido-sdk/react';
import {
  decimals,
  stSymbol,
  wstSymbol,
  getWstETHAddress,
  SCANNERS,
} from 'config';
import { parseUnits } from '@ethersproject/units';
import WrapInput from './wrapInput';

const Wrap: FC = () => {
  // const { publicRuntimeConfig } = getConfig();
  const { account, chainId, providerWeb3 } = useSDK();
  const steth = useSTETHBalance();
  const wsteth = useWSTETHBalance();
  const eth = useEthereumBalance();
  const [enteredAmount, setEnteredAmount] = useState('');
  const [reward, setReward] = useState('0');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [canSwap, setCanSwap] = useState(false);
  const [canUnlock, setCanUnlock] = useState(false);
  const gasFee = '0';
  const unlockFee = '0';
  const [openModal, setOpenModal] = useState(false);
  const wstETHContractWeb3 = useWstETHContractWeb3();
  const wstETHContractRpc = useWstETHContractRpc();
  const stETHContractWeb3 = useStETHContractWeb3();
  const stETHContractRpc = useStETHContractRpc();
  const [currentTokenSymbol, setCurrentTokenSymbol] = useState(stSymbol);

  const [modalProps, setModalProps] = useState({
    modalTitle: '',
    modalSubTitle: '',
    modalIcon: <></>,
    modalElement: <></>,
  });

  const [currentToken, setCurrentToken] = useState('steth'); //steth/eth
  const [unlockIcon, setUnlockIcon] = useState('');

  useEffect(() => {
    if (steth.data) {
      let amount = enteredAmount;
      if (+enteredAmount == 0) {
        amount = formatBalance(steth.data, decimals);
        setEnteredAmount(amount);
      }
      checkAllowance(amount);
    }
  }, [steth.data]);

  const setDisabled = () => {
    setCanUnlock(false);
    setUnlockIcon('');
    setCanSwap(false);
    setReward('0');
  };

  const checkAllowance = (amount: string) => {
    if (+amount == 0) {
      setDisabled();
      return;
    }
    try {
      if (currentToken == 'steth') {
        if (allowance.data && steth.data) {
          if (parseUnits(amount).gt(steth.data)) {
            setDisabled();
            return;
          } else if (parseUnits(amount).gt(allowance.data)) {
            setCanUnlock(true);
            setUnlockIcon('lock');
            setCanSwap(false);
            setReward('0');
            return;
          } else {
            setCanUnlock(false);
            setUnlockIcon('');
            setCanSwap(true);
            return;
          }
        }
      } else {
        if (eth.data) {
          if (parseUnits(amount).gte(eth.data)) {
            setDisabled();
            return;
          } else {
            setCanUnlock(false);
            setUnlockIcon('');
            setCanSwap(true);
            return;
          }
        }
      }
      setDisabled();
    } catch (e) {
      // console.log("checkAllowance, error occured!");
      setCanUnlock(false);
      setCanSwap(false);
      setReward('0');
    }
  };

  const tokensPerStEth = useContractSWR({
    contract: wstETHContractRpc,
    method: 'tokensPerStEth',
  });

  useEffect(() => {
    setCurrentTokenSymbol(currentToken == 'steth' ? stSymbol : 'ETH');
  }, [currentToken]);

  const stringToBalance = (amount: string) => {
    try {
      const str = parseUnits(amount, decimals).toString();
      return str;
    } catch (error) {
      return '0';
    }
  };

  const getWstETHByStETH = useContractSWR({
    contract: wstETHContractRpc,
    method: 'getWstETHByStETH',
    params: [stringToBalance(enteredAmount)],
  });

  useEffect(() => {
    if (canSwap) {
      setReward(formatBalance(getWstETHByStETH.data, 4));
    } else {
      setReward('0');
    }
  }, [getWstETHByStETH.data]);

  const allowance = useContractSWR({
    contract: stETHContractRpc,
    method: 'allowance',
    params: [account, getWstETHAddress(chainId)],
  });

  useEffect(() => {
    checkAllowance(enteredAmount);
  }, [allowance.data, enteredAmount]);

  const submitLable = () => {
    return canSwap ? 'Wrap' : 'Unlock token to wrap';
  };

  const approve = (spender: string, amount: BigNumber) => {
    return stETHContractWeb3?.approve(spender, amount);
  };

  const wrap = (amount: BigNumber) => {
    return wstETHContractWeb3?.wrap(amount);
  };

  const setErrorModal = () => {
    setModalProps({
      modalTitle: 'Transaction failed',
      modalSubTitle: 'Something went wrong.',
      modalIcon: <Error color="green" height={64} width={64} />,
      modalElement: <Link href="#">Retry</Link>,
    });
  };

  const transfer = (amount: BigNumber) => {
    if (account) {
      return providerWeb3?.send('eth_sendTransaction', [
        {
          from: account,
          to: getWstETHAddress(chainId),
          value: amount.toHexString(),
        },
      ]);
    }
  };

  const processUnlock = () => {
    const amount = enteredAmount;
    setModalProps({
      modalTitle: `You are now approving ${stSymbol}`,
      modalSubTitle: `Approving ${stSymbol}.`,
      modalIcon: <Loader size="large" />,
      modalElement: (
        <Text color="secondary" size="xxs">
          Confirm this transaction in your wallet
        </Text>
      ),
    });
    setIsUnlocking(true);
    approve(getWstETHAddress(chainId), utils.parseUnits(amount, decimals))
      ?.then((tx) => {
        const link = SCANNERS[chainId] + 'tx/' + tx.hash;
        setModalProps({
          modalTitle: `You are now approving ${stSymbol}`,
          modalSubTitle: 'Awaiting block confirmation',
          modalIcon: <Loader size="large" />,
          modalElement: <Link href={link}>View on Etherscan</Link>,
        });
        tx.wait()
          .then(() => {
            setModalProps({
              modalTitle: 'Unlock successful!',
              modalSubTitle: `${amount} ${stSymbol} was unlocked to wrap.`,
              modalIcon: <Success color="green" height={64} width={64} />,
              modalElement: <Link href={link}>View on Etherscan</Link>,
            });
            setIsUnlocking(false);
          })
          .catch(() => {
            setErrorModal();
            setIsUnlocking(false);
          });
      })
      .catch(() => {
        setErrorModal();
        setIsUnlocking(false);
      });
  };

  const processWrap = () => {
    if (wsteth.data == undefined || getWstETHByStETH.data == undefined) {
      setErrorModal();
      return;
    }
    const amount = enteredAmount;
    const newWstBalance = formatBalance(
      wsteth.data.add(getWstETHByStETH.data),
      4,
    );
    setModalProps({
      modalTitle: `You are now wrapping ${amount} ${stSymbol}`,
      modalSubTitle: `Wrapping ${amount} ${stSymbol}. You will receive ${reward} ${wstSymbol}`,
      modalIcon: <Loader size="large" />,
      modalElement: (
        <Text color="secondary" size="xxs">
          Confirm this transaction in your wallet
        </Text>
      ),
    });
    setIsSwapping(true);
    wrap(utils.parseUnits(amount, decimals))
      ?.then((tx) => {
        const link = SCANNERS[chainId] + 'tx/' + tx.hash;
        setModalProps({
          modalTitle: `You are now wrapping ${amount} ${stSymbol}`,
          modalSubTitle: 'Awaiting block confirmation',
          modalIcon: <Loader size="large" />,
          modalElement: <Link href={link}>View on Etherscan</Link>,
        });
        tx.wait()
          .then(() => {
            setModalProps({
              modalTitle: `Your new balance is ${newWstBalance} ${wstSymbol}!`,
              modalSubTitle:
                'Wrapping operation was successful. Transaction can be viewed on Etherscan.',
              modalIcon: <Success color="green" height={64} width={64} />,
              modalElement: <Link href={link}>View on Etherscan</Link>,
            });
            setIsSwapping(false);
          })
          .catch(() => {
            setErrorModal();
            setIsSwapping(false);
          });
      })
      .catch(() => {
        setErrorModal();
        setIsSwapping(false);
      });
  };

  const processTransfer = () => {
    if (!wsteth.data || !getWstETHByStETH.data) {
      setErrorModal();
      return;
    }
    const amount = enteredAmount;
    const newWstBalance = formatBalance(
      wsteth.data.add(getWstETHByStETH.data),
      4,
    );
    setModalProps({
      modalTitle: `You are now wrapping ${amount} ETH`,
      modalSubTitle: `Wrapping ${amount} ETH. You will receive ${reward} ${wstSymbol}`,
      modalIcon: <Loader size="large" />,
      modalElement: (
        <Text color="secondary" size="xxs">
          Confirm this transaction in your wallet
        </Text>
      ),
    });
    setIsSwapping(true);
    transfer(utils.parseUnits(amount, decimals))
      ?.then((tx) => {
        const link = SCANNERS[chainId] + 'tx/' + tx.hash;
        setModalProps({
          modalTitle: `You are now wrapping ${amount} ETH`,
          modalSubTitle: 'Awaiting block confirmation',
          modalIcon: <Loader size="large" />,
          modalElement: <Link href={link}>View on Etherscan</Link>,
        });
        tx.wait()
          .then(() => {
            setModalProps({
              modalTitle: `Your new balance is ${newWstBalance} ${wstSymbol}!`,
              modalSubTitle:
                'Wrapping operation was successful. Transaction can be viewed on Etherscan.',
              modalIcon: <Success color="green" height={64} width={64} />,
              modalElement: <Link href={link}>View on Etherscan</Link>,
            });
            setIsSwapping(false);
          })
          .catch(() => {
            setErrorModal();
            setIsSwapping(false);
          });
      })
      .catch(() => {
        setErrorModal();
        setIsSwapping(false);
      });
  };

  const handleSubmit = async () => {
    setOpenModal(true);
    if (canUnlock) {
      processUnlock();
    } else if (canSwap) {
      if (currentToken == 'steth') {
        processWrap();
      } else {
        processTransfer();
      }
    }
  };

  return (
    <Block>
      <WrapInput
        enteredAmount={enteredAmount}
        setEnteredAmount={setEnteredAmount}
        // leftDecorator={<Tokens handleChange={handleTokenChange} />}
        setCurrentToken={setCurrentToken}
      />
      <SubmitOrConnect
        submit={handleSubmit}
        isSubmitting={isUnlocking || isSwapping}
        disabledSubmit={!(canUnlock || canSwap)}
        submitLabel={submitLable()}
        fullwidth={true}
        unlockLabel={unlockIcon}
      />
      <Modal
        onClose={() => {
          setOpenModal(false);
        }}
        subtitle={modalProps.modalSubTitle}
        themeOverride="light"
        title={modalProps.modalTitle}
        open={openModal}
        titleIcon={modalProps.modalIcon}
        center={true}
      >
        <br />
        {modalProps.modalElement}
      </Modal>
      <DataTable>
        <DataTableRow title="Unlock fee">
          {Number(unlockFee).toFixed(2)}
        </DataTableRow>
        <DataTableRow title="Gas fee">{Number(gasFee).toFixed(2)}</DataTableRow>
        <DataTableRow title="Exchange rate">
          1 {currentTokenSymbol} = {formatBalance(tokensPerStEth.data, 4)}{' '}
          {wstSymbol}
        </DataTableRow>
        <DataTableRow title="Allowance">
          {formatBalance(allowance.data)}
        </DataTableRow>
        <DataTableRow title="You will recieve">
          {reward} {wstSymbol}
        </DataTableRow>
        {/* <DataTableRow
          title="Reward fee"
          help="Please note: this fee applies to staking rewards/earnings only,
          and is NOT taken from your staked amount. It is a fee on earnings only."
        >
          10%
        </DataTableRow> */}
      </DataTable>
    </Block>
  );
};

export default Wrap;
