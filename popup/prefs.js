/**
 * providing i18n and prefs service
 *
 * NOTE: prefs is preferences, NOT performances.
 */
function $(x) { return document.querySelector(x) }
function $$(x) { return document.querySelectorAll(x) }
function $$each(selector, func) { [].forEach.call($$(selector), func) }

if (typeof browser === 'undefined') var browser = chrome

$$each('[i18n]', function (b) {
  var key = b.getAttribute('i18n')
  b.textContent = browser.i18n.getMessage(key)
})

!(function () {
  var shortcuts = {}
  $$each('[data-shortcut]', function (b) {
    var key = b.getAttribute('data-shortcut')
    shortcuts[key] = b
  })
  document.body.addEventListener('keypress', function (ev) {
    var o = shortcuts[ev.key]
    if (o) o.click()
  }, false)
})();

var prefs = {
  cache: {},
  getBoolPref: function (key) { return prefs.cache[key] },
  setBoolPref: function (key, value) {
    prefs.cache[key] = !!value
    browser.storage.local.set({ config: prefs.cache })
  }
}

function prefsUpdate(ev) {
  prefs.setBoolPref(ev.target.getAttribute('data-prefs'), ev.target.checked)
  browser.runtime.sendMessage('reload_cfg')
}

browser.storage.local.get("config", function (o) {
  if (o.config) Object.assign(prefs.cache, o.config)

  $$each('[data-prefs]', function (cbox) {
    var name = cbox.getAttribute('data-prefs');
    try {
      cbox.checked = prefs.getBoolPref(name);
    } catch (e) {
      prefs.setBoolPref(name, cbox.checked);
    }
    cbox.addEventListener('change', prefsUpdate, false);
  })
})
