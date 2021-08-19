import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import LotteryAppBar from './components/LotteryAppBar';
import Balance from './components/Balance';
import EnterButtonV2 from './components/EnterButtonV2';
import ConnectButton from './components/ConnectButton';
import LotteryHub from './components/LotteryHub';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <div>
    <ConnectButton></ConnectButton>
    </div>
    <div>
    <EnterButtonV2></EnterButtonV2>
    </div>
    <div>
    <Balance></Balance>
    </div>
    <div>
    <LotteryHub></LotteryHub>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
