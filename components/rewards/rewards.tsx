import {
  Block,
  Box,
  Button,
  Checkbox,
  History,
  HStack,
  Identicon,
  Input,
  Link,
  Option,
  Select,
  StackItem,
  Text,
} from '@lidofinance/lido-ui';
import { formatBalance } from '../../utils';
import Section from '../section';
import { ChangeEventHandler, FC, useEffect } from 'react';
import { MatomoEventType, trackEvent } from '@lidofinance/analytics-matomo';
import { useSDK, useSTETHBalance } from '@lido-sdk/react';

import Head from 'next/head';
import styled from 'styled-components';
import RewardsLayout from './rewardslayout';
import { WalletCard } from 'components/walletCard';

const InputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;
const Rewards: FC = () => {
  useEffect(() => {
    const matomoSomeEvent: MatomoEventType = [
      'Lido_Frontend_Template',
      'Mount index component',
      'mount_index_component',
    ];

    trackEvent(...matomoSomeEvent);
  }, []);

  const { account } = useSDK();

  const balance = useSTETHBalance();
  const handleChange: ChangeEventHandler<HTMLInputElement> | undefined = (
    event,
  ) => {
    event.preventDefault();
    alert('changed');
  };

  return (
    <RewardsLayout
      title="Reward History"
      subtitle="Track your Ethereum staking rewards with Lido."
    >
      <Head>
        <title>Track your Ethereum staking rewards | Lido</title>
      </Head>
      <Section>
        <WalletCard>
          <InputWrapper>
            <Input
              color="accent"
              leftDecorator={<Identicon address={account ?? ''} />}
              active
              fullwidth
              onChange={handleChange}
              placeholder="0x"
              label="eth Address"
              defaultValue={account ?? ''}
              rightDecorator={
                <History
                  onClick={function copyToClip() {
                    const ele = document.createElement('input');
                    if (typeof account === 'string') {
                      ele.setAttribute('value', account);
                      document.body.appendChild(ele);
                      ele.select();
                      document.execCommand('copy');
                      document.body.removeChild(ele);
                      alert('copied');
                    }
                  }}
                  style={{
                    fill: 'var(--lido-color-text)',
                  }}
                />
              }
            />
          </InputWrapper>
          <Box
            alignItems="center"
            bg="#7fffac2f"
            color="#CD8500"
            display="flex"
            fontSize={[1, 1, 1, 1]}
            height={25}
            justifyContent="center"
            margin="auto"
            width={1}
          >
            Current balance may differ from last balance in the table due to
            rounding.
          </Box>
        </WalletCard>
        <Block>
          <HStack
            align="flex-start"
            justify="flex-start"
            spacing="lg"
            wrap="wrap"
          >
            <StackItem>
              <Block>
                <Text color="default" strong size="md">
                  stETH balance
                </Text>
                <Text color="default" strong size="md">
                  Ξ {formatBalance(balance.data, 8)}
                </Text>
                <Text color="default" size="sm">
                  ${0}
                </Text>
              </Block>
            </StackItem>
            <StackItem>
              <Block>
                <Text color="default" strong size="md">
                  stETH earned
                </Text>
                <Text color="success" strong size="md">
                  Ξ {0}
                </Text>
                <Text color="default" size="sm">
                  $ {0}
                </Text>
              </Block>
            </StackItem>
            <StackItem>
              <Block>
                <Text color="default" strong size="md">
                  Average APR
                </Text>

                <Text color="default" strong size="md">
                  -
                </Text>
                <Text color="default" underline size="sm">
                  <Link href="https://lido.fi">More &nbsp; Info</Link>
                </Text>
              </Block>
            </StackItem>
            <StackItem>
              <Block>
                <Text color="default" strong size="md">
                  stETH price
                </Text>
                <Text color="default" strong size="md">
                  $ {0}
                </Text>
                <Text color="default" size="sm">
                  Ξ {1}
                </Text>
              </Block>
            </StackItem>
          </HStack>
        </Block>
        <div>
          <br />
          <br />
        </div>
        <Block>
          <HStack
            align="flex-start"
            justify="flex-start"
            spacing="lg"
            wrap="wrap"
          >
            <StackItem>
              <Text color="default" strong size="sm">
                Reward history
              </Text>
            </StackItem>
            <StackItem>
              <Checkbox
                onChange={function noRefCheck() {
                  return;
                }}
                label={'Historical stETH price'}
              />
            </StackItem>
            <StackItem>
              <Checkbox
                onChange={function noRefCheck() {
                  return;
                }}
                label={'Only Show Rewards'}
              />
            </StackItem>
            <StackItem>
              <Select
                arrow="small"
                onChange={function noRefCheck() {
                  return;
                }}
                value={1}
                size={'xxs'}
                variant="small"
              >
                <Option value={1}>USD</Option>
                <Option value={2}>EUR</Option>
                <Option value={3}>GBP</Option>
              </Select>
            </StackItem>
            <StackItem>
              <Button color="primary" size="xxs" variant="outlined">
                export csv
              </Button>
            </StackItem>
          </HStack>
        </Block>
      </Section>
    </RewardsLayout>
  );
};
export default Rewards;
