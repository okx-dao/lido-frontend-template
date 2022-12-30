import {
  RewardsLayoutTitleStyle,
  RewardsLayoutSubTitleStyle,
} from './rewardsStyles';
import { RewardsLayoutProps } from './types';
import { FC, PropsWithChildren } from 'react';
import Header from '../header';
import Head from 'next/head';
import RawardsMain from './rewardsmain';
const RewardsLayout: FC<PropsWithChildren<RewardsLayoutProps>> = (props) => {
  const { title, subtitle } = props;
  const { children } = props;

  return (
    <>
      <Head>
        <meta name="description" content="Lido Template" />
      </Head>
      <Header />
      <RawardsMain>
        <RewardsLayoutTitleStyle>{title}</RewardsLayoutTitleStyle>
        <RewardsLayoutSubTitleStyle>{subtitle}</RewardsLayoutSubTitleStyle>
        {children}
      </RawardsMain>
    </>
  );
};

export default RewardsLayout;
