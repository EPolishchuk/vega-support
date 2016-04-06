$(document).ready(function () {
    var classname = document.getElementsByClassName("btn");
    var netRequrest = function() {
        var host = document.getElementById('input-host').value;
        if (host === null || host === "") {  
            $('#input-host').tooltip('show');            
        }
        else {            
            runQuery(this.getAttribute('id'));   
            $('#input-host').tooltip('hide');  
        } 
    };
    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', netRequrest, false);
    }
})

function loadConsole(host, command, options, callback) {
    var xobj = new XMLHttpRequest();
    xobj.open('GET', 'nt-request.php?h=' + host + '&c=' + command + '&a=' + options, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState != 4) return;
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(null, xobj.responseText);
        }
        else if (xobj.status == "412") {
            callback(('Failed. Some options missing. Details: ' + xobj.responseText), null);
        }
        else {
            callback(('Failed. ' + xobj.responseText), null);
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
    loadConsole(inputHost, commandNum, options, function (error, response) {
        if (error) {
            console.log('Error console: ' + error);
            document.getElementById('console').innerHTML = 'NONE';
            $('#loading-animation').addClass('hide');
            $('#console').removeClass('hide');   
            return;
        }
        console.log(response);
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
    switch (command) {
        case 'whois': 
            return '';
        case 'ping':
        case 'traceroute':
            return commandOptions[command][0] + commandDefaults[command][0] + 
            commandOptions[command][1] + commandDefaults[command][1];
        case 'dig':
            if (ipCheck())
                return commandDefaults[command][1];
            else
                return commandDefaults[command][0];
        default:
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
}

var commandDefaults = {
    ping: [5, 32],
    traceroute: [15, ''],
	nslookup: ['any'],
    dig: ['any', '-x'],
    host: ['any', ''],
    nmap: ['80', '']
}

var commandOptions = {
    ping: ['-c ', ' -s '],
    traceroute: ['-m ', ' -n '],
	nslookup: ['-q='],
    dig: [" @"],
    host: [' -t '],
    nmap: ['-p ']
}