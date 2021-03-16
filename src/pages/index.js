import React, { useState, useEffect } from 'react';
import { Link } from 'umi';
import ProgressBar from 'progressbar.js';

import styles from './index.less';

export default function({
  gasPrices = [],
}) {

  const [badgeTextLevel, setBadgeTextLevel] = useState(1);
  // get localStorage default option level
  const getLocalStorageInt = () => {
    browser.storage.local.get(['int']).then(function (obj) {
      const { int } = obj;
      setBadgeTextLevel(+int);
    })
  }

  let bar;
  const initialProgressBar = () => {
    bar = new ProgressBar.Path('#loading-ath', {
      easing: 'easeInOut',
      duration: 8000
    });
    bar.set(0);
    bar.animate(0.999);
  }

  useEffect(() => {
    getLocalStorageInt();
    initialProgressBar();
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

  const renderLoadingPath = (index) => {
    if (+index !== +badgeTextLevel) { return null }
    return (
      <div className={styles.loadingContainer}>
        <svg width="116px" height="134px" viewBox="0 0 116 134" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="path-warp" transform="translate(-209.000000, -247.000000)" stroke="#FF7828" strokeWidth="2">
                    <path d="M313,248 C316.037566,248 318.787566,249.231217 320.778175,251.221825 C322.768783,253.212434 324,255.962434 324,259 L324,259 L324,369 C324,372.037566 322.768783,374.787566 320.778175,376.778175 C318.787566,378.768783 316.037566,380 313,380 L313,380 L221,380 C217.962434,380 215.212434,378.768783 213.221825,376.778175 C211.231217,374.787566 210,372.037566 210,369 L210,369 L210,259 C210,255.962434 211.231217,253.212434 213.221825,251.221825 C215.212434,249.231217 217.962434,248 221,248 L221,248 Z" id="loading-ath"></path>
                </g>
            </g>
        </svg>
      </div>
    )
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
                  {gasPrices[index] || 120}
                  {renderLoadingPath(+index)}
                </div>
        				<div className={styles.item_time}>
                  ~{list[key].time}&nbsp;
                  <span>
                    {browser.i18n.getMessage(list[key].text)}
                  </span>
                </div>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  );
}
