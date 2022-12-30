import React, { FC, useEffect, useState } from 'react';
import {
  Block,
  Input,
  DataTable,
  DataTableRow,
  Modal,
  Link,
  Error,
  Loader,
  Text,
  Success,
  Wsteth,
} from '@lidofinance/lido-ui';
import {
  useContractSWR,
  useSDK,
  useSTETHBalance,
  useWSTETHBalance,
} from '@lido-sdk/react';
import { useWstETHContractRpc, useWstETHContractWeb3 } from 'hooks';
import { BigNumber, utils } from 'ethers';
import styled from 'styled-components';
import { formatBalance } from 'utils';
import { decimals, SCANNERS } from 'config';
// import getConfig from 'next/config';
import SubmitOrConnect from 'components/submitOrConnect';
import { parseUnits } from '@ethersproject/units';
import MaxButton from 'components/maxButton';

const InputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

const Unwrap: FC = () => {
  const { chainId } = useSDK();
  const [enteredAmount, setEnteredAmount] = useState('');
  const wstSymbol = 'wstETH';
  const [reward, setReward] = useState('0');
  const stSymbol = 'stETH';
  const [isSwapping, setIsSwapping] = useState(false);
  const [canSwap, setCanSwap] = useState(false);
  const gasFee = '0';
  const [inputError, setInputError] = useState('');
  const steth = useSTETHBalance();
  const wsteth = useWSTETHBalance();
  const wstETHContractWeb3 = useWstETHContractWeb3();
  const wstETHContractRpc = useWstETHContractRpc();
  const [openModal, setOpenModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    modalTitle: '',
    modalSubTitle: '',
    modalIcon: <></>,
    modalElement: <></>,
  });
  const stETHPerToken = useContractSWR({
    contract: wstETHContractRpc,
    method: 'stEthPerToken',
  });

  const stringToBalance = (amount: string) => {
    try {
      const str = parseUnits(amount, decimals).toString();
      return str;
    } catch (error) {
      return '0';
    }
  };

  const getStETHByWstETH = useContractSWR({
    contract: wstETHContractRpc,
    method: 'getStETHByWstETH',
    params: [stringToBalance(enteredAmount)],
  });

  useEffect(() => {
    if (+enteredAmount == 0) {
      setReward(formatBalance(getStETHByWstETH.data, 4));
    } else {
      setReward('0');
    }
  }, [getStETHByWstETH.data]);

  useEffect(() => {
    if (+enteredAmount == 0) {
      setEnteredAmount(formatBalance(wsteth.data, 18));
    }
  }, [wsteth.data])

  const checkInput = (amount: string) => {
    let isValid = true;
    try {
      // console.log(`amount, ${amount}, len: ${amount.length}`)
      if (!amount || amount.length == 0) {
        setInputError('Amount is required');
        isValid = false;
      }
      if (isValid && +amount <= 0) {
        setInputError('Amount must be greater than 0');
        isValid = false;
      }
      if (isValid && wsteth.data) {
        if (wsteth.data.lt(utils.parseUnits(amount, decimals))) {
          setInputError(
            `Amount must not be greater than ${formatBalance(
              wsteth.data,
              decimals,
            )}`,
          );
          isValid = false;
        }
      }
      if (!isValid) {
        setReward('0');
        setCanSwap(false);
      }
    } catch (error) {
      isValid = false;
      if (amount.length > decimals) {
        setInputError(
          `Amount must be a number with up to ${decimals} decimal places`,
        );
      } else {
        setInputError('Amount must be a number');
      }
      setReward('0');
      setCanSwap(false);
    }
    return isValid;
  };

  useEffect(()=>{
    if(checkInput(enteredAmount)){
      setInputError("");
      setCanSwap(true);
    }
  }, [enteredAmount])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setEnteredAmount(amount);
  };

  const setErrorModal = () => {
    setModalProps({
      modalTitle: 'Transaction failed',
      modalSubTitle: 'Something went wrong.',
      modalIcon: <Error color="green" height={64} width={64} />,
      modalElement: <Link href="#">Retry</Link>,
    });
  };

  const unwrap = (amount: BigNumber) => {
    return wstETHContractWeb3?.unwrap(amount);
  };

  const handleSubmit = () => {
    setOpenModal(true);
    if (!canSwap) {
      return;
    }
    if (wsteth.data == undefined || getStETHByWstETH.data == undefined) {
      return;
    }
    const amount = enteredAmount;
    const newStBalance = formatBalance(
      steth.data?.add(getStETHByWstETH.data),
      4,
    );
    setModalProps({
      modalTitle: `You are now unwrapping ${amount} ${wstSymbol}`,
      modalSubTitle: `Unwrapping ${amount} ${wstSymbol}. You will receive ${reward} ${stSymbol}`,
      modalIcon: <Loader size="large" />,
      modalElement: (
        <Text color="secondary" size="xxs">
          Confirm this transaction in your wallet
        </Text>
      ),
    });
    setIsSwapping(true);
    unwrap(utils.parseUnits(amount, decimals))
      ?.then((tx) => {
        const link = SCANNERS[chainId] + 'tx/' + tx.hash;
        setModalProps({
          modalTitle: `You are now unwrapping ${amount} ${wstSymbol}`,
          modalSubTitle: 'Awaiting block confirmation',
          modalIcon: <Loader size="large" />,
          modalElement: <Link href={link}>View on Etherscan</Link>,
        });
        tx.wait()
          .then(() => {
            setModalProps({
              modalTitle: `Your new balance is ${newStBalance} ${stSymbol}!`,
              modalSubTitle:
                'Unwrapping operation was successful. Transaction can be viewed on Etherscan.',
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

  const handleMaxButtonSubmit = () => {
    setEnteredAmount(formatBalance(wsteth.data, 18));
  };

  return (
    <Block>
      <InputWrapper>
        <Input
          fullwidth
          value={enteredAmount}
          label="Amount"
          disabled={isSwapping}
          onChange={handleChange}
          error={inputError}
          rightDecorator={<MaxButton onClick={handleMaxButtonSubmit} />}
          leftDecorator={<Wsteth />}
        />
      </InputWrapper>
      <SubmitOrConnect
        submit={handleSubmit}
        isSubmitting={isSwapping}
        disabledSubmit={!canSwap}
        submitLabel="Unwrap"
        fullwidth={true}
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
        <DataTableRow title="Gas fee">
          ${Number(gasFee).toFixed(2)}
        </DataTableRow>
        <DataTableRow title="Exchange rate">
          1 {wstSymbol} = {formatBalance(stETHPerToken.data, 4)} {stSymbol}
        </DataTableRow>
        <DataTableRow title="You will recieve">
          {reward} {stSymbol}
        </DataTableRow>
      </DataTable>
    </Block>
  );
};

export default Unwrap;
