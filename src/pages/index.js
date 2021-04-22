/**
 * HomePage
 * @type {Array}
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'umi';

import styles from './index.less';

const HomePage = ({
  theme,
  price,
  gasPrices = [],
}) => {

  const [badgeTextLevel, setBadgeTextLevel] = useState(1);
  // get localStorage default option level
  const getLocalStorageInt = () => {
    browser.storage.local.get(['int']).then(({ int = 1 }) => {
      console.log('homePage getLocalStorageInt', int);
      setBadgeTextLevel(+int);
    })
  }

  const language = (browser.i18n.getUILanguage() || 'us').includes('zh') ? 'cny' : 'usd';
  const symbol = {
    cny: '￥',
    usd: '$'
  };

  useEffect(() => {
    getLocalStorageInt();
    // initialProgressBar();
  }, [gasPrices]);

  const list = {
    rapid: {
      time: 15,
      text: 'seconds'
    },
    fast: {
      time: 1,
      text: 'minute',
    },
    standard: {
      time: 3,
      text: 'minutes',
    },
    slow: {
      time: 10,
      text: 'minutes',
    },
  }

  return (
    <div className={styles.normal}>
      <div className={styles.header}>
        <div className={styles.price}>
          ETH: {symbol[language]}{(+price[language]).toLocaleString()}
        </div>
        <img
          src={require(`@/assets/images/GASNOW_${theme}.svg`)}
          alt="GASNOW"
        />
        <Link to="/setting">
          <img
            src={require(`@/assets/images/setting_${theme}.svg`)}
            alt="setting"
          />
        </Link>
      </div>
      <div className={styles.container}>
        <ul>
          {
            Object.keys(list).map((key, index) => (
              <li
                key={key}
                className={+index === +badgeTextLevel ? styles.active : ''}>
                <div className={styles.item_title}>
        					<img src={require(`@/assets/images/${key}.svg`)} alt="" />
        					<span>
                    {browser.i18n.getMessage(key)}
                  </span>
        				</div>
        				<div id={`${key}-value`} className={`${styles.item_value} ${styles[key]}`}>
                  {gasPrices[index]}
                </div>
                <div className={styles.item_price}>
                  {symbol[language]}{(21000 * price[language] * +gasPrices[index] / 1e9).toFixed(2)}
                </div>
        				<div className={styles.item_time}>
                  ~{list[key].time}&nbsp;
                  <span>
                    {browser.i18n.getMessage(list[key].text)}
                  </span>
                </div>
                {
                  +index === +badgeTextLevel && gasPrices[index] ? (
                    <div
                      className={styles.bgFill}
                      key={Math.random()}
                    />
                  ) : null
                }
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
