import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'rebass';
import { injectGlobal } from 'styled-components';

injectGlobal`
  * { box-sizing: border-box; }
  body { margin: 0; background:#8d46e8 }
  min-height: 100vh
`;

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  document.getElementById('root')
);
