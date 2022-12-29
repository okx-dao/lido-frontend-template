import { FC } from 'react';
import Link from 'next/link';
import { LidoLogo } from '@lidofinance/lido-ui';
import { useRouter } from 'next/dist/client/router';
import { Stake, Wrap, Wallet } from '@lidofinance/lido-ui';
import {
  NavLink,
  HeaderStyle,
  HeaderLogoStyle,
  HeaderActionsStyle,
  NavItems,
  HeaderMenuActionsStyle,
} from './headerStyles';
import HeaderWallet from './headerWallet';

const NavItem = ({
  link,
  icon,
  onClick,
  bchildren,
}: {
  link: string;
  icon: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  bchildren: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <Link passHref href={link}>
      <NavLink isActive={router.pathname === link} onClick={onClick}>
        {icon}
        <div>{bchildren}</div>
      </NavLink>
    </Link>
  );
};

const Header: FC = () => (
  <HeaderStyle size="full" forwardedAs="header">
    <HeaderLogoStyle>
      <Link href="/">
        <LidoLogo />
      </Link>
      <HeaderMenuActionsStyle>
        <NavItems>
          <NavItem link="/" icon={<Stake />} bchildren="STAKE" />
          <NavItem link="/wrap" icon={<Wrap />} bchildren="WRAP" />
          <NavItem link="/rewards" icon={<Wallet />} bchildren="REWARDS" />
        </NavItems>
      </HeaderMenuActionsStyle>
    </HeaderLogoStyle>
    <HeaderActionsStyle>
      <HeaderWallet />
    </HeaderActionsStyle>
  </HeaderStyle>
);

export default Header;
