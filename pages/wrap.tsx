import { FC, useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';

import Wallet from 'components/wallet';
import Layout from 'components/layout';
import Faq from 'components/faq';
import { FAQItem, getFaqList } from 'utils/faqList';
import Tabs from 'components/tabs';
import Wrap from 'components/wrap';
import Unwrap from 'components/unwrap';

interface HomeProps {
  faqList: FAQItem[];
}

const Home: FC<HomeProps> = ({ faqList }) => {
  const [selectedTab, setSelectedTab] = useState('Wrap');

  return (
    <Layout
      title="Wrap & Unwrap"
      subtitle="Stable-balance stETH wrapper for DeFi"
    >
      <Head>
        <title>Lido | Frontend Swap</title>
      </Head>
      <Tabs
        options={['Wrap', 'Unwrap']}
        selected={selectedTab}
        onSelectTab={setSelectedTab}
      />
      <Wallet
        style={{
          background: 'linear-gradient(to right,rgb(29,63,85),rgb(35,95,116))',
        }}
      />
      {selectedTab === 'Wrap' ? <Wrap /> : null}
      {selectedTab === 'Unwrap' ? <Unwrap /> : null}
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
