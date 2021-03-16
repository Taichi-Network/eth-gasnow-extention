var timer;
var ws;

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
  // 默认启用 websocket
  createWebSocketConnection();
}

function initTimerWorker() {
  if (!timer) {
    getGas()
    timer = setInterval(function () {
      getGas()
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
  let url = "https://www.gasnow.org/api/v3/gas/price?utm_source=GasNowExtension"
  fetch(url, {
    method: 'get'
  }).then(function (res) {
    return res.json()
  }).then(function (json) {
    console.log('Fetch Data:', json.data);
    saveToStorage(json.data)
    showBadge()
  }).catch(function (err) {
    console.log(err)
  })
}

function createWebSocketConnection() {
  if('WebSocket' in window){
    ws = new WebSocket('wss://gasnow-test.sparkpool.com/ws/gasprice');

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
      // 清除就的定时器
      clearInterval(timer);
      // 启用旧版定时刷新 gas 方式
      initTimerWorker();
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
    // 本地存储
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
    console.log(noticeId, ids);
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
    console.log(int, data[+int], noticeValue, noticeDateTime);
    // 未设置监控值
    if (!noticeValue || +noticeValue <= 0) { return }
    // 当前值大于等于监控值
    if ((data[+int] >= +noticeValue)) {
      return;
    }
    // 上次提醒时间间隔不足十分钟
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
        console.log(res);
      }, (err) => {
        console.log(err);
      });
  })

    // var views = browser.extension.getViews({type:'popup'});
    // if (views.length > 0) {
    //     // console.log("views.count:" + views.length)
    //     // console.log(views[0].document.title)
    //
    //     for(i = 0; i < views.length; i++) {
    //         views[i].document.getElementById('slow-value').innerHTML = arr[0]
    //         views[i].document.getElementById('standard-value').innerHTML = arr[1]
    //         views[i].document.getElementById('fast-value').innerHTML = arr[2]
    //         views[i].document.getElementById('rapid-value').innerHTML = arr[3]
    //     }
    //
    // }
}

function showBadge() {
    /**
    browser.storage.local.get(['int', 'array'], function (obj) {
        const selectedItem = obj.int
        const selectedGas = obj.array[selectedItem].toString()
        browser.browserAction.setBadgeText({text: selectedGas})
    })
    */
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
