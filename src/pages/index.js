/**
 * HomePage
 * @type {Array}
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'umi';

import styles from './index.less';

const HomePage = ({
  gasPrices = [],
}) => {

  const [badgeTextLevel, setBadgeTextLevel] = useState(1);
  // get localStorage default option level
  const getLocalStorageInt = () => {
    browser.storage.local.get(['int']).then(({ int }) => {
      console.log('homePage getLocalStorageInt', int);
      setBadgeTextLevel(+int);
    })
  }

  // let bar;
  // const initialProgressBar = () => {
  //   bar = new ProgressBar.Path('#loading-ath', {
  //     easing: 'easeInOut',
  //     duration: 8000
  //   });
  //   bar.set(0);
  //   bar.animate(0.999);
  // }

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
        <img className={styles.logo_dark} src={require('@/assets/images/GASNOW_dark.svg')} alt="GASNOW"/>
        <img className={styles.logo_light} src={require('@/assets/images/GASNOW_light.svg')} alt="GASNOW"/>
        <Link to="/setting">
          <img className={styles.setting_icon_dark} src={require('@/assets/images/setting_dark.svg')} alt="setting"/>
          <img className={styles.setting_icon_light} src={require('@/assets/images/setting_light.svg')} alt="setting"/>
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
