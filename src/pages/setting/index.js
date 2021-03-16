import React, { useState, useEffect } from 'react';
import { Select, InputNumber, message } from 'antd';
import { Link } from 'umi';
import styles from './styles.less';

const { Option } = Select;

let inputEl;
let messageVisible;
export default function({
  gasPrices,
  theme,
}) {

  const [badgeTextLevel, setBadgeTextLevel] = useState(1);
  const [noticeValue, setNoticeValue] = useState('');

  // get localStorage default option
  const getLocalStorageInt = () => {
    browser.storage.local.get(['int']).then(({ int }) => {
      setBadgeTextLevel(+int);
    });
  }

  // get localStorage alarm value
  const getLocalStorageNoticeValue = () => {
    browser.storage.local.get(['noticeValue']).then(({ noticeValue }) => {
      setNoticeValue(noticeValue);
    });
  }

  useEffect(() => {
    getLocalStorageInt();
    getLocalStorageNoticeValue();
  }, []);

  // change Badge value
  const handleChagneSelect = (int) => {
    setBadgeTextLevel(int);
    // save default option level
    browser.storage.local.set({ int }).then(function () {
      // update badgeText
      browser.browserAction.setBadgeText({ text: `${gasPrices[int]}` })
    })
  }

  // change alarm value
  const handleChangeInput = () => {
    // value <= 0, return
    if (!+noticeValue) { return }
    // alarm value >0, save alarm value
    browser.storage.local.set({ noticeValue }).then(() => {
      if (!messageVisible) {
        messageVisible = true;
        message.success(browser.i18n.getMessage('noticeSuccessMsg'), () => {
          messageVisible = false;
        });
      }
      inputEl.blur();
    });
  }

  return (
    <div className={styles.setting}>
      <div className={styles.header}>
        <Link to="/" className={styles.backBtn}>
          <img className={styles.bakBtnIcon_dark} src={require('@/assets/images/icon_back_dark.svg')} alt="back"/>
          <img className={styles.bakBtnIcon_light} src={require('@/assets/images/icon_back_light.svg')} alt="back"/>
        </Link>
        <span>{browser.i18n.getMessage('settingTitle')}</span>
      </div>
      <div className={styles.container}>
        <ul>
          <li>
            <div>
              <p>{browser.i18n.getMessage('defaultTitle')}</p>
              <span>{browser.i18n.getMessage('defaultGasMsg')}</span>
            </div>
            <div>
              <Select
                style={{ width: 80 }}
                className={styles.select}
                value={badgeTextLevel}
                onChange={handleChagneSelect}>
                {
                  ['rapid', 'fast', 'standard', 'slow'].map((key, index) => (
                    <Option value={index} key={index}>
                      {browser.i18n.getMessage(key)}
                    </Option>
                  ))
                }
              </Select>
            </div>
          </li>
          <li>
            <div>
              <p>
                {browser.i18n.getMessage('noticeTitle')}
                &nbsp;
                <span>{browser.i18n.getMessage('noticeTitle2')}</span>
              </p>
              <span>{browser.i18n.getMessage('noticeMsg')}</span>
            </div>
            <div>
              <InputNumber
                style={{ width: 80 }}
                className={styles.input}
                placeholder={browser.i18n.getMessage('noticePlaceholder')}
                value={noticeValue}
                min={0}
                ref={(ref) => inputEl = ref}
                onChange={setNoticeValue}
                onPressEnter={handleChangeInput}
                onBlur={handleChangeInput}
              />
            </div>
          </li>
          <li className={styles.aboutus}>
            <div className={styles.aboutus_container}>
              <p>{browser.i18n.getMessage('aboutUsTitle')}</p>
              <div>
                <a
                  href="https://www.gasnow.org/"
                  target="_blank">
                  <img src={require('@/assets/images/icon_gasnow.svg')} alt=""/>
                  <span>
                    gasnow.org
                  </span>
                </a>
                <a
                  href="https://twitter.com/gasnow_org"
                  target="_blank">
                  <img src={require('@/assets/images/icon_contact_us.svg')} alt=""/>
                  <span>
                    Contact us
                  </span>
                </a>
                <a
                  href="https://discord.gg/VSErATqN"
                  target="_blank">
                  <img src={require('@/assets/images/icon_Discord.svg')} alt=""/>
                  <span>
                    Discord
                  </span>
                </a>
                <a
                  href="https://github.com/Taichi-Network/eth-gasnow-extention"
                  target="_blank">
                  <img src={require(`@/assets/images/${theme}/icon_Source_code.svg`)} alt=""/>
                  <span>
                    Source code
                  </span>
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
