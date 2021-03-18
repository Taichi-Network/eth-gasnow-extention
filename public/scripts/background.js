var timer;
var ws;

var websocket;
var reConnectTimes = 0;

browser.runtime.onInstalled.addListener(onInstalled)
browser.runtime.onStartup.addListener(onStartup)

// chrome.alarms.onAlarm.addListener(onAlarm)


function onInstalled() {
    // _updateRepeatingAlarms()
    periodFectchGas()
}

function onStartup() {
    // _updateRepeatingAlarms()
    periodFectchGas()
}

function _updateRepeatingAlarms() {
    browser.alarms.get('fetchETHPrice', function (alarm) {
        if (!alarm) {
            console.log('create price alarms')
            browser.alarms.create('fetchETHPrice', {when: Date.now(), periodInMinutes: 5.0})
        }
    })
}


function onAlarm() {
    getETHPrice()
}


function periodFectchGas() {
  initLocalStorage();
  // default start connect websocket
  getGas(true);
  // initTimerWorker();
}

function initTimerWorker() {
  // intervalTimer = setInterval(function() {
  //   validateGasTimestamp();
  // }, 8000);
  // if (!timer) {
  //   getGas()
  //   timer = setInterval(function () {
  //     getGas();
  //   }, 1000 * 8)
  // } else {
  //   showPopupContent(arr)
  // }
}

function getETHPrice() {
  let url = "https://www.gasnow.org/api/v1/eth/price?utm_source=GasNowExtension"
  fetch(url, {method: 'get'}).then(function (res) {
    console.log(res.json());
    return res.json()
  }).then(function (json) {
    const ethPrice = json.data
    saveETHPriceToStorage(ethPrice)
  }).catch(function (err) {
      console.log(err)
  })
}

function fetchGasData() {
  clearTimeout(timer);
  // fetch gas prices
  fetch("https://www.gasnow.org/api/v3/gas/price?utm_source=GasNowExtension", {
    method: 'get'
  }).then(function (res) {
    return res.json()
  }).then(function (json) {
    saveToStorage(json.data);
    showBadge();
    reConnectTimes = 0;
    timer = setTimeout(function() {
      // get gas connect WebSocket
      getGas(true);
    }, 8000);
  }).catch(function (err) {
    // refresh now 20 times
    if (reConnectTimes < 20) {
      reConnectTimes++;
      getGas()
    } else {
      setTimeout(getGas, 5000);
    }
  });
}

/**
 * Create WebSocket
 * @param  {Boolean} type  true: reconnect WebSocket, false: fetch api
 * @return {[type]}        [description]
 */
function createWebSocketConnection() {
  if (ws) { return }
  if('WebSocket' in window) {
    // initial websocket status
    websocket = false;

    // ws = new WebSocket('ws://localhost:8005/ws');
    // ws = new WebSocket('wss://gasnow-test.sparkpool.com/ws/gasprice');
    ws = new WebSocket('wss://www.gasnow.org/ws/gasprice');

    ws.onopen = function() {
      console.log('WebSocket onOpen');
    };

    ws.onmessage = function (event) {
      var dataStr = event.data;
      var json = JSON.parse(dataStr);
      console.log('WebSocket onMessage:', json.data);
      saveToStorage(json.data);
      showBadge();
    };

    ws.onclose = function() {
      console.log('WebSocket onClose get Gas By WebSocket:', websocket);
      ws = undefined;
      getGas(websocket);
    };
  } else {
    // not support WebSocket, fetch Gas by api;
    getGas();
  }
}

/**
 * get gas prices
 * @param  {Boolean} type true: connect WebSocket, false: fetch api
 * @return {[type]}           [description]
 */
function getGas(type) {
  type ? createWebSocketConnection() : fetchGasData();
}

// save gas prices to storage
function saveToStorage(gasPrice) {
  const arr = [
    Math.floor((gasPrice.rapid / Math.pow(10, 9))),
    Math.floor((gasPrice.fast / Math.pow(10, 9))),
    Math.floor((gasPrice.standard / Math.pow(10, 9))),
    Math.floor((gasPrice.slow / Math.pow(10, 9))),
  ]
  showNotification(arr);
  // save gasPrices
  browser.storage.local.set({
    array: arr,
    timestamp: gasPrice.timestamp
  }).then(function () {
    showPopupContent()
  });
}

function saveETHPriceToStorage(ethPrice) {
  browser.storage.local.set({object:{k:'price', v:ethPrice}})
}

var noticeId = '';
function showNotification(data) {
  browser.notifications.getAll().then(function(ids) {
    // console.log(noticeId, ids);
    Object.keys(ids).forEach(function(id) {
      browser.notifications.clear(id);
    });
    noticeId = '';
    // validate timestamp
    checkNotificationsStatus(data);
  });
}

// validate lasted times notification date
function checkNotificationsStatus(data) {
  browser.storage.local.get(['int', 'noticeValue', 'noticeDateTime']).then(function({
    int,
    noticeValue,
    noticeDateTime
  }) {
    // no alarm value, reutrn
    if (!noticeValue || +noticeValue <= 0) { return }
    // gas now > alarm value
    if ((data[+int] >= +noticeValue)) { return }
    // lasted notification times < 10min
    if (+noticeDateTime && new Date().getTime() - (+noticeDateTime) < 10 * 60 * 1000) {
      return;
    }
    createNotification(data, +int);
  });
}

// create notification
function createNotification(data, int) {
  var titles = ['Rapid', 'Fast', 'Standard', 'Slow'];
  browser.notifications.create(data[int].toString(), {
    type : "basic",
    title : `${titles[int]}: ${data[+int]} Gwei`,
    message: "ETH GasPrice forecast by GasNow",
    iconUrl: '/images/icon48.png',
  }).then(function(id) {
    browser.storage.local.set({ noticeDateTime: new Date().getTime() })
    noticeId = id;
  });
}

function showPopupContent() {
  browser.storage.local.get(['array']).then(function (obj) {
    const arr = obj.array
    browser.runtime.sendMessage({ arr })
      .then((res) => {
        // console.log(res);
      }, (err) => {
        // console.log(err);
      });
  })
}

function showBadge() {
  let obj = browser.storage.local.get(['int', 'array'])
  obj.then(function (item) {
    const selectedItem = item.int
    const selectedGas = item.array[selectedItem].toString()
    browser.browserAction.setBadgeText({text: selectedGas})
  }).catch(function (err) {
    console.log(err)
  })
}

// initial default value
function initLocalStorage() {
  browser.storage.local.clear()
  browser.storage.local.set({array: [0, 0, 0, 0], int: 1})
}

// close WebSocket, fetch gas data
window.closeWebSocket = function() {
  if (!ws) { return }
  websocket = true;
  ws.close();
};
