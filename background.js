browser.contextMenus.create({
  id: "scan-qr",
  title: browser.i18n.getMessage("cmScanQR"),
  contexts: ["image"],
  checked: false
})

var cfgCache = { scrmode: false }
function reloadCfg() {
  browser.storage.local.get("config", function (o) { Object.assign(cfgCache, o.config || {}) })
  lastImageRect = null
}

var lastImage = ''
var lastImageRect = null

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request === 'get_last_image') sendResponse({
      img: lastImage,
      rect: lastImageRect
    })
    if (request === 'reload_cfg') reloadCfg()
    else if (request.type === 'image_commit') {
      lastImage = request.img
      lastImageRect = request.rect
      // console.log("image updated")
    }
  })

function open_recognizer() {
  var err = browser.runtime.lastError
  var page = err ? "/popup/error.html" : "/popup/popup.html"
  browser.windows.create({
    url: browser.extension.getURL(page),
    width: 750,
    height: 550,
    type: "popup"
  })
}

browser.contextMenus.onClicked.addListener(function (info, tab) {
  switch (info.menuItemId) {
    case "scan-qr":
      if (cfgCache.scrmode || !lastImage) {
        browser.tabs.captureVisibleTab(undefined, { format: 'png' }, function (image) {
          lastImage = image
          open_recognizer()
        })
      } else {
        open_recognizer()
      }
      break
  }
})