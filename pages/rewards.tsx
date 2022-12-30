import { GetStaticProps } from 'next';
import { trackEvent, MatomoEventType } from '@lidofinance/analytics-matomo';
import { FAQItem, getFaqList } from 'utils/faqList';
import { FC, useEffect } from 'react';
import Rewards from '../components/rewards';

interface HomeProps {
  faqList: FAQItem[];
}

const Home: FC<HomeProps> = () => {
  useEffect(() => {
    const matomoSomeEvent: MatomoEventType = [
      'Lido_Frontend_Template',
      'Mount index component',
      'mount_index_component',
    ];

    trackEvent(...matomoSomeEvent);
  }, []);

  return <Rewards />;
};

export default Home;

export const getStaticProps: GetStaticProps<HomeProps> = async () => ({
  props: {
    faqList: await getFaqList(['lido-frontend-template']),
  },
});
