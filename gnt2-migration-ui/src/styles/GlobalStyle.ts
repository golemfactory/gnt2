import {createGlobalStyle} from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @font-face {
  font-family: 'AktivGrotesk';
  font-style: normal;
  font-weight: 400;
  src: url('./fonts/AktivGrotesk-Regular.eot');
  src: local('Aktiv Grotesk'), local('AktivGrotesk'),
       url('./fonts/regular/AktivGrotesk-Regular.eot?#iefix') format('embedded-opentype'),
       url('./fonts/regular/AktivGrotesk-Regular.woff2') format('woff2'),
       url('./fonts/regular/AktivGrotesk-Regular.woff') format('woff'),
       url('./fonts/regular/AktivGrotesk-Regular.ttf') format('truetype'),
       url('./fonts/regular/AktivGrotesk-Regular.svg#OpenSans') format('svg');
  }
  @font-face {
    font-family: 'AktivGrotesk';
    font-style: normal;
    font-weight: 700;
    src: url('./fonts/AktivGrotesk-Bold.eot');
    src: local('Aktiv Grotesk'), local('AktivGrotesk'),
        url('./fonts/bold/AktivGrotesk-Bold.eot') format('embedded-opentype'),
        url('./fonts/bold/AktivGrotesk-Bold.woff2') format('woff2'),
        url('./fonts/bold/AktivGrotesk-Bold.woff') format('woff'),
        url('./fonts/bold/AktivGrotesk-Bold.ttf') format('truetype'),
        url('./fonts/bold/AktivGrotesk-Bold.svg') format('svg');
  }
  
  body {
    font-family: 'AktivGrotesk';
  }

  button {
    cursor: pointer;
  }
`;
