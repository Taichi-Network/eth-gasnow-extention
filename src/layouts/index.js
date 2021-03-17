import React, { useState, useEffect } from 'react';
import { router } from 'umi';

import styles from './index.less';

let defaultTheme = 'light';
try {
  defaultTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
} catch (e) {
  console.log('matchMedia theme error:', e);
}
function BasicLayout(props) {

  const [gasPrices, setGasPrices] = useState(['', '', '', '']);

  const [theme, setTheme] = useState(defaultTheme);
  const handleListeningThemeChange = () => {
    // add Listener on theme change
    try {
      let mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addListener((e) => {
        setTheme(e.matches ? 'dark' : 'light');
      });
    } catch (e) {
      console.log('addListener theme error:', e);
    }
  }

  // initial gasPrices
  const initLocalStorageGasPrices = () => {
    browser.storage.local.get(['array']).then(function (obj) {
      const arr = obj.array
      setGasPrices(arr);
    });
  }

  // listening gasPrices
  const handleListeningGasPrices = () => {
    browser.runtime.onMessage.addListener(function(message, messageSender, sendResponse) {
      const { arr } = message;
      setGasPrices(arr);
    });
  }

  useEffect(() => {
    router.push('/');
    initLocalStorageGasPrices();
    handleListeningGasPrices();
    handleListeningThemeChange();
  }, [])

  return (
    <div className={styles.normal}>
      {
        React.Children.map(props.children, child => {
          return React.cloneElement(child, null, React.Children.map(child.props.children, child => {
            return React.cloneElement(child, { gasPrices, theme });
          }))
        })
      }
    </div>
  );
}

export default BasicLayout;
