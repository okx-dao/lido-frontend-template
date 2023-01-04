import { FC, FormEventHandler, useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import styled from 'styled-components';
import Head from 'next/head';
import SubmitOrConnect from 'components/submitOrConnect';
import {
  useContractSWR,
  useEthereumBalance,
  useEthereumSWR,
  useSDK,
  useSTETHContractRPC,
  useSTETHContractWeb3,
  useTxPrice,
} from '@lido-sdk/react';
import {
  Block,
  Link,
  DataTable,
  DataTableRow,
  Input,
  Modal,
  Error,
  Loader,
  Success,
  Text,
  Eth,
} from '@lidofinance/lido-ui';
import { trackEvent, MatomoEventType } from '@lidofinance/analytics-matomo';
import Wallet from 'components/wallet';
import Section from 'components/section';
import Layout from 'components/layout';
import Faq from 'components/faq';
import { formatBalance, stringToEther } from 'utils';
import { FAQItem, getFaqList } from 'utils/faqList';
import BigNumber from 'bignumber.js';
import { useLidoOracleContractRPC } from '../hooks';
import { SCANNERS } from '../config/scanners';
import MaxButton from '../components/maxButton/maxButton';

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

  const { account, chainId } = useSDK();
  const [enteredAmount, setEnteredAmount] = useState('');
  const [canStake, setCanStake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [gasLimit, setGasLimit] = useState('100000');
  const [modalProps, setModalProps] = useState({
    modalTitle: '',
    modalSubTitle: '',
    modalIcon: <></>,
    modalElement: <></>,
  });

  const eth = useEthereumBalance();

  const setErrorModal = () => {
    setModalProps({
      modalTitle: 'Transaction failed',
      modalSubTitle: 'Something went wrong.',
      modalIcon: <Error color="green" height={64} width={64} />,
      modalElement: <Link href="#">Retry</Link>,
    });
  };
  const stEthContractWeb3 = useSTETHContractWeb3();

  const handleSubmit: FormEventHandler<HTMLFormElement> | undefined = (
    event,
  ) => {
    event.preventDefault();
    setOpenModal(true);

    if (enteredAmount && enteredAmount !== '0') {
      setIsSubmitting(true);
      setModalProps({
        modalTitle: `You are now staking ${enteredAmount} ETH`,
        modalSubTitle: `staking ${enteredAmount} ETH. You will receive ${enteredAmount} stETH`,
        modalIcon: <Loader size="large" />,
        modalElement: (
          <Text color="secondary" size="xxs">
            Confirm this transaction in your wallet
          </Text>
        ),
      });

      stEthContractWeb3
        ?.submit('0x0000000000000000000000000000000000000000', {
          value: stringToEther(enteredAmount),
        })
        .then((tx) => {
          const link = SCANNERS[chainId] + 'tx/' + tx.hash;
          console.log('tx:', tx);
          setModalProps({
            modalTitle: 'You are now approving ETH',
            modalSubTitle: 'Approving ETH.',
            modalIcon: <Loader size="large" />,
            modalElement: (
              <Text color="secondary" size="xxs">
                Confirm this transaction in your wallet
              </Text>
            ),
          });
          tx.wait()
            .then((contractReceipt) => {
              setModalProps({
                modalTitle: 'staking successful!',
                modalSubTitle: `You receive ${enteredAmount} stETH`,
                modalIcon: <Success color="green" height={64} width={64} />,
                modalElement: <Link href={link}>View on Etherscan</Link>,
              });
              setIsSubmitting(false);
              setEnteredAmount('');
              setCanStake(false);
              console.log('contractReceipt:', contractReceipt);
            })
            .catch((reason) => {
              console.log('tx fail:', reason);
              setErrorModal();
            });
        })
        .catch((reason) => {
          setErrorModal();
          setIsSubmitting(false);
          setCanStake(true);
          console.log('ex:', reason);
        });
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
  const lidoOracleContractRpc = useLidoOracleContractRPC();
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

  const fee = useContractSWR({
    contract: stETHContractRpc,
    method: 'getFee',
  });

  // protocolAPR = (postTotalPooledEther - preTotalPooledEther) * secondsInYear / (preTotalPooledEther * timeElapsed)
  // lidoFeeAsFraction = lidoFee / basisPoint
  // userAPR = protocolAPR * (1 - lidoFeeAsFraction)
  const lastReport = useContractSWR({
    contract: lidoOracleContractRpc,
    method: 'getLastCompletedReportDelta',
  });
  const preTotalPooledEther = lastReport.data?.preTotalPooledEther;
  const postTotalPooledEther = lastReport.data?.postTotalPooledEther;
  const timeElapsed = lastReport.data?.timeElapsed;
  const secondsInYear = '31536000';
  const divBasis = timeElapsed?.mul(
    preTotalPooledEther ? preTotalPooledEther : 1,
  );
  const protocolAPR = postTotalPooledEther
    ?.sub(preTotalPooledEther ? preTotalPooledEther : 0)
    .mul('1000000000000000000')
    .mul(secondsInYear)
    .div(divBasis ? divBasis : 1)
    .mul('100');

  const userAPR = protocolAPR
    ?.mul(10000 - (fee.data ? fee.data : 0))
    .div(10000);

  stEthContractWeb3?.estimateGas
    .submit('0x0000000000000000000000000000000000000000', {
      value: stringToEther(enteredAmount),
    })
    .then((gas) => {
      setGasLimit(gas.toString());
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(() => {});

  const gasPirce = useEthereumSWR({
    method: 'getGasPrice',
  });
  const gasFee = gasPirce.data?.mul(gasLimit.toString());

  const setMaxInputValue = () => {
    if (account) {
      const amount = eth.data
        ?.sub('10000000000000000')
        .sub(gasFee ? gasFee : 0);
      if (amount?.gt(0)) {
        setEnteredAmount(formatBalance(amount, 18));
        setCanStake(true);
      }
    }
  };

  const txPrice = useTxPrice(gasLimit.toString());

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
              leftDecorator={<Eth />}
              label="Token amount"
              rightDecorator={<MaxButton onClick={setMaxInputValue} />}
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
            {'1 ETH = 1 stETH'}
          </DataTableRow>
          <DataTableRow
            title="Transaction cost"
            loading={tokenName.initialLoading}
          >
            {txPrice.data ? txPrice.data : 0} $
          </DataTableRow>
          <DataTableRow
            help="Please note: this fee applies to staking rewards/earning only, and is NOT taken from your staked amount. It is a fee on earnings only."
            title="Reward fee"
            highlight
            loading={tokenName.initialLoading}
          >
            {(fee.data ? fee.data : 0) / 100.0} %
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
              help="Moving average of APR for 7 days period."
              title="Annual percentage rate"
              highlight
              loading={tokenName.initialLoading}
            >
              {formatBalance(userAPR, 1)} %
            </DataTableRow>
            <DataTableRow
              title="Total staked with Lido"
              loading={tokenName.initialLoading}
            >
              {formatBalance(totalPooledEther.data, 3)} ETH
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
              ${}
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
