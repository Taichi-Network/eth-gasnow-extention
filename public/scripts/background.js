var timer;
var ws;

var restful;   // api status

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
            console.log('创建price alarms')
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
  createWebSocketConnection();
}

function initTimerWorker() {
  if (!timer) {
    getGas()
    timer = setInterval(function () {
      getGas();
    }, 1000 * 8)
  } else {
    showPopupContent(arr)
  }
}

function delayExecute(localDateSeconds, delay) {
    setTimeout(function () {
        timer = setInterval(function () {
            if (localDateSeconds == 0) {
                getGas()
                localDateSeconds = 8
            } else {
                localDateSeconds--
            }

        }, 1000 )
    }, delay)
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

function getGas() {
  console.log('getGas', restful);
  clearTimeout(timer);
  // connect WebSocket
  if (!restful) {
    createWebSocketConnection();
    return;
  }
  // fetch gas prices
  fetch("https://www.gasnow.org/api/v3/gas/price?utm_source=GasNowExtension", {
    method: 'get'
  }).then(function (res) {
    return res.json()
  }).then(function (json) {
    console.log(96, 'gasPrices:', json.data);
    saveToStorage(json.data);
    showBadge();
    restful = false;
    timer = setTimeout(getGas, 8000);
  }).catch(function (err) {
    console.log(102, 'fetch gas error:', err)
    timer = setTimeout(getGas, 8000);
  })
}

function createWebSocketConnection() {
  if (ws) { return }
  if('WebSocket' in window){
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
      console.log('WebSocket onClose');
      ws = undefined;
      restful = true;
      getGas();
    };
  }
}

function saveToStorage(gasPrice) {
  const arr = [
    Math.floor((gasPrice.rapid / Math.pow(10, 9))),
    Math.floor((gasPrice.fast / Math.pow(10, 9))),
    Math.floor((gasPrice.standard / Math.pow(10, 9))),
    Math.floor((gasPrice.slow / Math.pow(10, 9))),
  ]
  showNotification(arr);
  // save gasPrices
  browser.storage.local.set({ array: arr })
    .then(function () {
      showPopupContent()
    })
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
    // 检查是否需要弹窗
    checkNotificationsStatus(data);
  });
}

// 检查是否可以弹出通知
function checkNotificationsStatus(data) {
  browser.storage.local.get(['int', 'noticeValue', 'noticeDateTime']).then(function({
    int,
    noticeValue,
    noticeDateTime
  }) {
    // console.log(int, data[+int], noticeValue, noticeDateTime);
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

// 创建通知框
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

function initLocalStorage() {
  browser.storage.local.clear()
  browser.storage.local.set({array: [0, 0, 0, 0], int: 1})
}
