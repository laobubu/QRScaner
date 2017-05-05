browser.storage.local.get("config", function (o) {
  if (o.config && o.config.scrmode) return

  var doc = window.document
  var last = {
    img: null,
    date: 0,
  }

  function qrscan_commit(token) {
    if (!last.img) return
    /** @type {HTMLImageElement} */
    var img = last.img
    var cr = img.getBoundingClientRect()
    var cr2 = { x: cr.left, y: cr.top, w: cr.width, h: cr.height }

    var canvas = doc.createElement('canvas')
    var w = img.offsetWidth, h = img.offsetHeight
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)

    try {
      var datauri = canvas.toDataURL('image/png')
    } catch (err) {
      // http://stackoverflow.com/questions/2390232/why-does-canvas-todataurl-throw-a-security-exception
      datauri = null
    }
    browser.runtime.sendMessage({ type: 'image_commit', token: token, img: datauri, date: last.date, rect: cr2 })

    last.img = null
  }

  doc.addEventListener("contextmenu", function mm(ev) {
    var target = ev.target

    console.log('cm')

    if (target.nodeName !== 'IMG') return
    last.img = target
    last.date = +new Date()

    qrscan_commit('')
  }, true)

  console.log('inject!')
})
