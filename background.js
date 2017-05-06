if (typeof browser === 'undefined') var browser = chrome

browser.contextMenus.create({
  id: "scan-qr",
  title: browser.i18n.getMessage("cmScanQR"),
  contexts: ["image"],
  checked: false
})

var cfgCache = { scrmode: false }
function reloadCfg() {
  browser.storage.local.get("config", function (o) {
    Object.assign(cfgCache, o.config || {})
    if (cfgCache.scrmode) {
      browser.contextMenus.create({
        id: "scan-qr-screen",
        title: browser.i18n.getMessage("cmScanQR"),
        contexts: ["frame", "page", "selection", "video"],
        checked: false
      })
    } else {
      browser.contextMenus.remove("scan-qr-screen")
    }
    lastImageRect = null
  })
}
setTimeout(reloadCfg, 10)

var lastImage = ''
var lastImageRect = null

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request === 'get_last_image') {
      sendResponse({
        img: lastImage,
        rect: lastImageRect
      })
      lastImage = ''
      lastImageRect = null
    } else if (request === 'reload_cfg') {
      reloadCfg()
    } else if (request.type === 'image_commit') {
      lastImage = request.img
      lastImageRect = request.rect
    }
  })

function open_recognizer(opts_override) {
  var err = browser.runtime.lastError
  var page = err ? "/popup/error.html" : "/popup/popup.html"
  var opts = {
    url: browser.extension.getURL(page),
    width: 750,
    height: 550,
    type: "popup"
  }
  if (typeof opts_override === 'object') Object.assign(opts, opts_override)
  browser.windows.create(opts)
}

browser.contextMenus.onClicked.addListener(function (info, tab) {
  var mid = info.menuItemId
  if (mid == "scan-qr") {
    lastImage = info.srcUrl
    open_recognizer(null)
  }
  if (mid == "scan-qr-screen") {
    browser.tabs.captureVisibleTab(undefined, { format: 'png' }, function (image) {
      lastImage = image
      var img = new Image()
      img.onload = function () {
        var opts = {
          width: 5 + ~~img.width,
          height: 75 + ~~img.height
        }
        open_recognizer(opts)
      }
      img.src = image
    })
  }
})
