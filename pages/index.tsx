import { FC, FormEventHandler, useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import styled from 'styled-components';
import Head from 'next/head';
import SubmitOrConnect from 'components/submitOrConnect';
import {
  useContractSWR,
  useSTETHContractRPC,
  useSTETHContractWeb3,
} from '@lido-sdk/react';
import {
  Block,
  Link,
  DataTable,
  DataTableRow,
  Input,
  Steth,
  // Button,
} from '@lidofinance/lido-ui';
import { trackEvent, MatomoEventType } from '@lidofinance/analytics-matomo';
import Wallet from 'components/wallet';
import Section from 'components/section';
import Layout from 'components/layout';
import Faq from 'components/faq';
import { etherToString, stringToEther } from 'utils';
import { FAQItem, getFaqList } from 'utils/faqList';
import BigNumber from 'bignumber.js';

interface HomeProps {
  faqList: FAQItem[];
}

const InputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

const Home: FC<HomeProps> = ({ faqList }) => {
  useEffect(() => {
    const matomoSomeEvent: MatomoEventType = [
      'Lido_Frontend_Template',
      'Mount index component',
      'mount_index_component',
    ];

    trackEvent(...matomoSomeEvent);
  }, []);

  const [enteredAmount, setEnteredAmount] = useState('');
  const [canStake, setCanStake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contractWeb3 = useSTETHContractWeb3();

  const handleSubmit: FormEventHandler<HTMLFormElement> | undefined = (
    event,
  ) => {
    event.preventDefault();

    if (enteredAmount && enteredAmount !== '0') {
      setIsSubmitting(true);

      contractWeb3
        ?.submit('0x0000000000000000000000000000000000000000', {
          value: stringToEther(enteredAmount),
        })
        .then((tx) => {
          console.log('tx:', tx);
          tx.wait()
            .then((contractReceipt) => {
              setIsSubmitting(false);
              setEnteredAmount('');
              setCanStake(false);
              console.log('contractReceipt:', contractReceipt);
              alert('tx success');
            })
            .catch((reason) => {
              console.log('tx fail:', reason);
              alert('tx fail');
            });
        })
        .catch((reason) => {
          setIsSubmitting(false);
          setCanStake(true);
          console.log('ex:', reason);
          alert('tx 已取消');
        });

      alert('Submitted');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;
    if (isNaN(+amount) || /^00/.test(amount) || +amount < 0) {
      return;
    }
    if (+amount === 0) {
      setCanStake(false);
    } else {
      setCanStake(true);
    }
    setEnteredAmount(amount);
  };

  const stETHContractRpc = useSTETHContractRPC();
  const tokenName = useContractSWR({
    contract: stETHContractRpc,
    method: 'name',
  });
  const beaconStat = useContractSWR({
    contract: stETHContractRpc,
    method: 'getBeaconStat',
  });

  const totalPooledEther = useContractSWR({
    contract: stETHContractRpc,
    method: 'getTotalPooledEther',
  });

  return (
    <Layout
      title="Stake Ether"
      subtitle="Stake ETH and receive stETH while staking."
    >
      <Head>
        <title>Lido | Frontend Template</title>
      </Head>
      <Wallet />
      <Block>
        <form action="" method="post" onSubmit={handleSubmit}>
          <InputWrapper>
            <Input
              fullwidth
              value={enteredAmount}
              placeholder="0"
              leftDecorator={<Steth />}
              label="Token amount"
              onChange={handleChange}
            />
          </InputWrapper>
          <SubmitOrConnect
            isSubmitting={isSubmitting}
            disabledSubmit={!canStake}
            submitLabel="Stake now"
            fullwidth={false}
            submit={handleSubmit}
          />
          {/*<Button fullwidth type="submit">*/}
          {/*  Submit*/}
          {/*</Button>*/}
        </form>
        <DataTable>
          <DataTableRow
            title="You will receive"
            loading={tokenName.initialLoading}
          >
            {enteredAmount ? enteredAmount : 0} stETH
          </DataTableRow>
          <DataTableRow
            title="Exchange rate"
            loading={tokenName.initialLoading}
          >
            {}
          </DataTableRow>
          <DataTableRow
            title="Transaction cost"
            loading={tokenName.initialLoading}
          >
            {}
          </DataTableRow>
          <DataTableRow title="Reward fee" loading={tokenName.initialLoading}>
            {}
          </DataTableRow>
        </DataTable>
      </Block>
      <Section
        title="Lido statistics"
        headerDecorator={<Link href="#">Link</Link>}
      >
        <Block>
          <DataTable>
            <DataTableRow
              title="Annual percentage rate"
              loading={tokenName.initialLoading}
            >
              {}
            </DataTableRow>
            <DataTableRow
              title="Total staked with Lido"
              loading={tokenName.initialLoading}
            >
              {etherToString(totalPooledEther.data)} ETH
            </DataTableRow>
            <DataTableRow title="Stakers" loading={tokenName.initialLoading}>
              {(
                beaconStat.data?.depositedValidators as unknown as BigNumber
              )?.toString(10)}
            </DataTableRow>
            <DataTableRow
              title="stETH market cap"
              loading={tokenName.initialLoading}
            >
              {}
            </DataTableRow>
          </DataTable>
        </Block>
      </Section>
      <Faq faqList={faqList} />
    </Layout>
  );
};

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => ({
  props: {
    faqList: await getFaqList(['lido-frontend-template']),
  },
});
