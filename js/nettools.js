$(document).ready(function () {
    $(function () {
        $("button").click(function () {
            if($('#input-host').val()) {
              runQuery($(this).attr("id"));
              $('#input-host').tooltip('hide');
            }
            else {            
              $('#input-host').tooltip('show');
            }
        });
    });
});

function loadConsole(host, command, options, callback) {
    var xobj = new XMLHttpRequest();
    xobj.open('GET', 'nt-request.php?h=' + host + '&c=' + command + '&a=' + options, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
function runQuery(command) {
	$('#console').addClass('hide');
	$('#loading-animation').removeClass('hide');
    document.getElementById('console').innerHTML = '';
    var inputHost = document.getElementById('input-host').value;
    if (!ipCheck()) {
        inputHost = removeSlash(inputHost);
        inputHost = inputHost.replace(/.*?:\/\//g, "");
    }
    var commandNum = commandObjects[command];
    var options = optionAdd(command);
    loadConsole(inputHost, commandNum, options, function (response) {
        document.getElementById('console').innerHTML = response;
		$('#loading-animation').addClass('hide');
        $('#console').removeClass('hide');
    });
}

function removeSlash(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

function optionAdd(command) {
    if (command === 'whois') {
        return '';
    } else if (command === 'ping' || command === 'traceroute') {
        var part01 = commandOptions[command][0] + commandDefaults[command][0];
        var part02 = commandOptions[command][1] + commandDefaults[command][1];
        return part01 + part02;
    } else if (command === 'dig') {
        if (ipCheck())
            return commandDefaults[command][1];
        else
            return commandDefaults[command][0];
    }
    else {
        return commandOptions[command][0] + commandDefaults[command][0];
    }
}

function ipCheck() {
    var inputHost = document.getElementById('input-host').value;
    var octet = '(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])';
    var ip = '(?:' + octet + '\\.){3}' + octet;
    var quad = '(?:\\[' + ip + '\\])|(?:' + ip + ')';
    var ipRE = new RegExp('(' + quad + ')');
    return ipRE.test(inputHost);
}

var commandObjects = {
    ping: 0,
    traceroute: 1,
    nslookup: 2,
    whois: 3,
    dig: 4,
    host: 5,
    nmap: 6
};

var commandDefaults = {
    ping: [5, 32],
    traceroute: [15, ''],
	nslookup: ['any'],
    dig: ['any', '-x'],
    host: ['any', ''],
    nmap: ['80', '']
};

var commandOptions = {
    ping: ['-c ', ' -s '],
    traceroute: ['-m ', ' -n '],
	nslookup: ['-q='],
    dig: [" @"],
    host: [' -t '],
    nmap: ['-p ']
};

var smartFlag = false;
 
 