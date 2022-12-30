import { parseUnits } from '@ethersproject/units';
import { useSTETHBalance, useEthereumBalance } from '@lido-sdk/react';
import {
  Input,
  InputGroup,
  OptionValue,
  SelectIcon,
  Steth,
  Option,
  Eth,
} from '@lidofinance/lido-ui';
import MaxButton from 'components/maxButton';
import { decimals } from 'config';

import { BigNumber, utils } from 'ethers';
import React, { FC, useEffect, useState } from 'react';
import { formatBalance } from 'utils';
interface Props {
  enteredAmount: string;
  setEnteredAmount: any;
  setCurrentToken: any;
}

const WrapInput: FC<Props> = ({
  enteredAmount,
  setEnteredAmount,
  setCurrentToken,
}) => {
  const [selectionProps, setSelectionProps] = useState({
    value: 'steth',
    icon: <Steth />,
  });

  const [maxInput, setMaxInput] = useState(BigNumber.from(0));
  const steth = useSTETHBalance();
  const eth = useEthereumBalance();

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
      if (isValid && maxInput) {
        if (maxInput.lt(utils.parseUnits(amount, decimals))) {
          setInputError(
            `Amount must not be greater than ${formatBalance(
              maxInput,
              decimals,
            )}`,
          );
          isValid = false;
        }
      }
      if (isValid) {
        setInputError('');
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
    }
  };

  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (+maxInput > 0) {
      checkInput(enteredAmount);
    }
  }, [enteredAmount, maxInput]);

  const calculateMaxAvailableEthBalance = (amount: BigNumber | undefined) => {
    const minBalance = parseUnits('0.01');
    if (amount && amount.gt(minBalance)) {
      return amount.sub(minBalance);
    }
    return BigNumber.from(0);
  };

  useEffect(() => {
    if (selectionProps.value == 'steth') {
      setMaxInput(steth.data ? steth.data : BigNumber.from(0));
    } else {
      setMaxInput(calculateMaxAvailableEthBalance(eth.data));
    }
  }, [steth.data, eth.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    setEnteredAmount(amount);
  };

  const handleTokenChanged = (value: OptionValue) => {
    console.log(`option changed, current value: ${value}`);
    let maxInput = BigNumber.from(0);
    switch (value) {
      case 'steth':
        setSelectionProps({
          value,
          icon: <Steth />,
        });
        maxInput = steth.data ? steth.data : BigNumber.from(0);
        break;
      case 'eth':
        setSelectionProps({
          value,
          icon: <Eth />,
        });
        maxInput = calculateMaxAvailableEthBalance(eth.data);
        break;
      default:
        break;
    }
    setMaxInput(maxInput);
    if (+maxInput > 0) {
      setEnteredAmount(formatBalance(maxInput, decimals));
    } else {
      setEnteredAmount('');
    }
    setCurrentToken(value);
  };

  const handleMaxButtonSubmit = () => {
    if (selectionProps.value == 'steth') {
      setEnteredAmount(formatBalance(steth.data, decimals));
    } else {
      setEnteredAmount(
        formatBalance(calculateMaxAvailableEthBalance(eth.data), decimals),
      );
    }
  };

  return (
    <InputGroup fullwidth>
      <SelectIcon
        color="default"
        icon={selectionProps.icon}
        onChange={handleTokenChanged}
        themeOverride="light"
        value={selectionProps.value}
      >
        <Option leftDecorator={<Steth />} value="steth">
          Lido (STETH)
        </Option>
        <Option leftDecorator={<Eth />} value="eth">
          Ethereum (ETH)
        </Option>
      </SelectIcon>
      <Input
        fullwidth
        value={enteredAmount}
        label="Amount"
        onChange={handleChange}
        placeholder="0"
        rightDecorator={<MaxButton onClick={handleMaxButtonSubmit} />}
        error={inputError}
      />
    </InputGroup>
  );
};
export default WrapInput;
