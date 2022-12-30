import { FC, PropsWithChildren } from 'react';
import { RewardsMainStyle } from './rewardsStyles';

const RawardsMain: FC<PropsWithChildren> = (props) => {
  return <RewardsMainStyle size="content" forwardedAs="main" {...props} />;
};

export default RawardsMain;
