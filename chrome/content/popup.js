if (!window.opener) { window.locaion.href = "err.html" }

function $(x) { return document.querySelector(x) }
function $$(x) { return document.querySelectorAll(x) }

var prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch("extensions.qrscaner.");

var img = window.opener.qrscaner_image_queue;

var canvas = $("#canvas");
canvas.width = img.width;
canvas.height = img.height;

var ctx = canvas.getContext("2d");
ctx.drawImage(img, 0, 0, img.width, img.height);

var qr = new QrCode();
qr.callback = function (result, err) {
    if (result) {
        setResult(result, true);
    } else {
        setResult("ERROR! \n" + err, false);
    }
}

function setResult(result, success) {
    var info = $('#info')

    if (success) info.classList.remove('is-failed');
    else info.classList.add('is-failed');

    $('#result').value = result;
}

function decodeOffline() {
    var dataURL = canvas.toDataURL("image/png");
    qr.decode(dataURL);
}

function decodeOnline() {
    var e = $('#decodeOnline');
    e.disabled = true;
    e.textContent = 'Decoding...';
    function reset() {
        e.disabled = false;
        e.textContent = 'Decode Online';
    }

    canvas.toBlob(function (blob) {
        var formData = new FormData();
        formData.append("f", blob);

        var request = new XMLHttpRequest();
        request.onerror = function () {
            reset();
            setResult("Failed to decode online.\nNetwork error.", false);
        }
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                reset();
                t = request.responseText;
                if (t.indexOf('<pre>') === -1) {
                    setResult("Failed to decode online.", false);
                } else {
                    t = t.substr(t.indexOf('<pre>') + 5);
                    t = t.substr(0, t.indexOf('</pre>'));
                    var o = document.createElement('textarea');
                    o.innerHTML = t;
                    setResult(o.value, true);
                }
            }
        }
        request.open("POST", "http://zxing.org/w/decode");
        request.send(formData);
    }, "image/png")
}

decodeOffline();
$('#decodeOnline').addEventListener('click', decodeOnline, false);

// auto close

setTimeout(function () {
    var chk = $('#autoClose');
    chk.addEventListener('click', function () {
        prefs.setBoolPref('autoclose', chk.checked)
    }, false);
    chk.checked = prefs.getBoolPref('autoclose')
    window.onblur = function () { prefs.getBoolPref('autoclose') && window.close() };
}, 50);
