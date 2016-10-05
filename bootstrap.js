var Cc = Components.classes;
var Ci = Components.interfaces;

function loadIntoWindow(window) {
  if (!window) return;

  var button = window.document.createElement("menuitem");
  button.setAttribute("id", "qrscaner_menu_scan");
  button.setAttribute("label", "Scan QR");

  button.addEventListener("command", function (event) {
    var toI = event.target.parentNode.triggerNode;
    window.qrscaner_image_queue = toI;
    var win = window.open("chrome://qrscaner/content/popup.html", "qrscaner_result", "height=600,width=500,toolbar=no,menubar=no,scrollbars=yes,resizable=no,location=no,status=no");
  }, false);


  // Get the anchor for "overlaying" but make sure the UI is loaded
  //via view-source:chrome://browser/content/browser.xul
  var forward = window.document.getElementById("context-saveimage");
  if (!forward) return;
  var anchor = forward.nextSibling;

  anchor.parentNode.insertBefore(button, anchor);
  window.document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", showChecker, false);
}

function showChecker(event) {
  event.target.children.qrscaner_menu_scan.hidden = !(event.target.triggerNode.tagName.toUpperCase() == "IMG");
}

function unloadFromWindow(window) {
  if (!window) return;
  var button = window.document.getElementById("qrscaner_menu_scan");
  if (button)
    button.parentNode.removeChild(button);
  window.document.getElementById("contentAreaContextMenu").removeEventListener("popupshowing", showChecker, false);
}

/*
 bootstrap.js API
*/

var windowListener = {
  onOpenWindow: function (aWindow) {
    // Wait for the window to finish loading
    var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function () {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  onCloseWindow: function (aWindow) { },
  onWindowTitleChange: function (aWindow, aTitle) { }
};

function startup(aData, aReason) {
  var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

  // Load into any existing windows
  var enumerator = wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    var win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(win);
  }

  // Load into any new windows
  wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean up any UI changes
  if (aReason == APP_SHUTDOWN) return;

  var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

  // Stop watching for new windows
  wm.removeListener(windowListener);

  // Unload from any existing windows
  var enumerator = wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    var win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(win);
  }
}

function install(aData, aReason) { }

function uninstall(aData, aReason) { }