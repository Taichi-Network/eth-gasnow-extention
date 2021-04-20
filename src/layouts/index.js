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

  // validate gas timestamp
  const validateGasTimestamp = (timestamp) => {
    const now = new Date().getTime();
    if (now - timestamp > (10 * 1000)) {
      browser.runtime.getBackgroundPage().then((background) => {
        background.closeWebSocket();
      });
    }
  }

  // initial gasPrices
  const initLocalStorageGasPrices = () => {
    browser.storage.local.get(['array', 'timestamp']).then(({
      array = [0, 0, 0, 0],
      timestamp,
    }) => {
      console.log('initLocalStorageGasPrices', array);
      validateGasTimestamp(timestamp);
      setGasPrices(array);
    });
  }

  // listening gasPrices
  const handleListeningGasPrices = () => {
    browser.runtime.onMessage.addListener(({
      array
    }, messageSender, sendResponse) => {
      setGasPrices(array);
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
