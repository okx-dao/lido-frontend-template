import { Container } from '@lidofinance/lido-ui';
import styled, { css } from 'styled-components';

export const HeaderStyle = styled(Container)`
  padding-top: 18px;
  padding-bottom: 18px;
  display: flex;
  align-items: center;
`;

export const HeaderLogoStyle = styled.div`
  overflow: hidden;
  flex-shrink: 0;
  margin-right: ${({ theme }) => theme.spaceMap.xxl}px;

  .header-link {
    margin-left: 60px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    width: 14px;
  }
`;

export const HeaderActionsStyle = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 1;
  overflow: hidden;

  a {
    margin-right: 15px;
  }
`;

export const HeaderMenuActionsStyle = styled.div`
  margin-left: 40px;
  display: flex;
  align-items: center;
  flex-shrink: 1;
  overflow: hidden;

  a {
    margin-right: 15px;
    text-decoration: none;
  }
`;

export const NavItems = styled.div`
  .header-link {
    margin-left: 60px;
  }
  text-decoration: none;
  display: flex;
  align-items: center;
`;

type NavLinkProps = {
  isActive: boolean;
};
export const NavLink = styled.div<NavLinkProps>`
  display: flex;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  transition: color ease ${({ theme }) => theme.duration.norm};

  &:hover {
    transition-duration: ${({ theme }) => theme.duration.fast};
  }

  &:not(:last-child) {
    margin-right: 44px;
  }

  & svg {
    display: block;
    margin-right: 8px;
    fill: currentColor;
  }

  ${({ isActive, theme }) =>
    isActive &&
    css`
      color: ${theme.colors.primary};
    `}
`;
