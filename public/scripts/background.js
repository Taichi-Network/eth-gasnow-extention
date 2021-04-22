var timer;
var ws;

var websocket;
var reConnectTimes = 0;

browser.runtime.onInstalled.addListener(onInstalled)
browser.runtime.onStartup.addListener(onStartup)

function onInstalled() {
  periodFectchGas()
}

function onStartup() {
  periodFectchGas();
}

function periodFectchGas() {
  getGas(true);
  createAlarm();
  onAlarm();
}

function createAlarm() {
  console.log('createAlarm');
  browser.alarms.create('getETHPrice', {
    // delayInMinutes: 1,
    periodInMinutes: 1,
    when: Date.now()
  });
}

function onAlarm() {
  browser.alarms.onAlarm.addListener(() => {
    getETHPrice();
  });
}

function saveEthPrice(price) {
  browser.storage.local.set({ price });
}

function getETHPrice() {
  fetch("https://www.gasnow.org/api/v1/eth/price?utm_source=GasNowExtension", {
    method: 'get'
  }).then((res) => res.json()
  ).then((json) => {
    saveEthPrice(json.data);
  }).catch((err) => {
    console.log(err)
  })
}

// fetch gas prices
function fetchGasData() {
  clearTimeout(timer);
  fetch("https://www.gasnow.org/api/v3/gas/price?utm_source=GasNowExtension", {
    method: 'get'
  }).then((res) => res.json()
  ).then((json) => {
    saveToStorage(json.data);
    showBadge();
    reConnectTimes = 0;
    // get gas connect WebSocket
    timer = setTimeout(() => {
      getGas(true);
    }, 8000);
  }).catch((err) => {
    // refresh 20 times
    if (reConnectTimes < 20) { reConnectTimes++ }
    // reconnect api dealy 1s or 5s
    timer = setTimeout(getGas, reConnectTimes < 20 ? 1000 : 5000);
  });
}

// Create WebSocket
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
  }).then(() => {
    showPopupContent()
  });
}

var noticeId = '';
function showNotification(data) {
  browser.notifications.getAll().then((ids) => {
    // console.log(noticeId, ids);
    Object.keys(ids).forEach((id) => {
      browser.notifications.clear(id);
    });
    noticeId = '';
    // validate timestamp
    checkNotificationsStatus(data);
  });
}

// validate lasted times notification date
function checkNotificationsStatus(data) {
  browser.storage.local.get(['int', 'noticeValue', 'noticeDateTime']).then(({
    int,
    noticeValue,
    noticeDateTime
  }) => {
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
  }).then((id) => {
    browser.storage.local.set({ noticeDateTime: new Date().getTime() })
    noticeId = id;
  });
}

// send message to popup page
function showPopupContent() {
  browser.storage.local.get(['array'])
    .then(({ array }) => {
      browser.runtime.sendMessage({ array })
        .then((res) => {
          // console.log(res);
        }, (err) => {
          // console.log(err);
        });
    })
}

// set badge text
function showBadge() {
  browser.storage.local.get(['int', 'array'])
    .then(({ int, array }) => {
      browser.browserAction.setBadgeText({
        text: array[+int].toString()
      });
    }).catch((err) => {
      console.log(err)
    })
}

// close WebSocket, fetch gas data
window.closeWebSocket = function() {
  if (!ws) { return }
  websocket = true;
  ws.close();
};
