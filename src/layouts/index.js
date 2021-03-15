import React, { useState, useEffect } from 'react';
import { router } from 'umi';

import styles from './index.less';

function BasicLayout(props) {

  const [gasPrices, setGasPrices] = useState(['', '', '', '']);

  useEffect(() => {
    router.push('/');
    initLocalStorageGasPrices();
    handleLinsteningGasPrices();
  }, [])

  // initial gasPrices
  const initLocalStorageGasPrices = () => {
    browser.storage.local.get(['array']).then(function (obj) {
      const arr = obj.array
      setGasPrices(arr);
    });
  }

  // listening gasPrices
  const handleLinsteningGasPrices = () => {
    browser.extension.onMessage.addListener(function(message, messageSender, sendResponse) {
      const { arr } = message;
      setGasPrices(arr);
    });
  }

  return (
    <div className={styles.normal}>
      {
        React.Children.map(props.children, child => {
          return React.cloneElement(child, null, React.Children.map(child.props.children, child => {
            return React.cloneElement(child, { gasPrices });
          }))
        })
      }
    </div>
  );
}

export default BasicLayout;
