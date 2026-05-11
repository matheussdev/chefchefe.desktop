/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from 'styled-components'
export const Containter = styled.div`
  display: flex;
  width: 100vw !important;
  flex: 1;
  flex-direction: column;
`
export const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  z-index: 8;
  width: 100%;
`
export const Navbar = styled.div`
  #navbar-height {
    width: 100%;
    height: 4rem;
  }
  #navbar-fixed {
    z-index: 10;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4rem;
    width: 100%;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 1rem 0.5rem;
    background: ${(props: any) => props.theme.token.bgSideBar};
    border-bottom: 2px solid ${(props: any) => props.theme.token.borderColor};
  }
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background-color: ${(props: any) => props.theme.token.colorPrimary};
    background: ${(props: any) => props.theme.token.gradientPrimary};
    padding: 0.5rem;
    border-radius: 0.5rem;
    color: #fff;
  }
`
