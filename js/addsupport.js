function checkDsl() {
    var selopt = document.getElementById('dsl');
    if (document.getElementById('fiber').checked || document.getElementById('vpnfiber').checked) {
        selopt.setAttribute("disabled", true);
    }
    else {
        selopt.removeAttribute("disabled");
    }
}

function rightChoice() {
    var trouble = document.getElementById("trouble");
    if (trouble.options[5].selected) {
        trouble.options[0].selected = true;
    }
}

function disData() {
    var zone = document.getElementById("zone");
    var fvpn = document.getElementById('fvpn');
    var avpn = document.getElementById('avpn');
    if (zone.options[2].selected) {
        fvpn.removeAttribute("disabled");
    }
    else if (zone.options[4].selected) {
        fvpn.setAttribute("disabled", true);
        avpn.removeAttribute("disabled");
    }
    else {
        fvpn.setAttribute("disabled", true);
        avpn.setAttribute("disabled", true);
    }
}