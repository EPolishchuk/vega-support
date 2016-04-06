function loadJSON(url, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function takeParam() {
    var e = document.getElementById("zone");
    var fil = e.options[e.selectedIndex].value;

    var valueD = getData();

    var f = document.getElementById("trouble");
    var trb = f.options[f.selectedIndex].value;

    return new Object({
        zone: fil,
        data: valueD,
        trouble: trb
    });
}

function getTelephone() {
        var btn = $('#loadinggeneral');
        btn.button('loading');
        loadJSON('model_tel.json', function (response) {
            var some = JSON.parse(response);
            telForm(some);
            btn.button('reset');
        });
}

function getGeneral() {
        var btn = $('#loadinggeneral');
        btn.button('loading');
        loadJSON('model_tel.json', function (response) {
            var some = JSON.parse(response);
            telForm('general', some);
            btn.button('reset');
        });
}

function getQuality() {
        var btn = $('#loadingquality');
        btn.button('loading');
        loadJSON('model_tel.json', function (response) {
            var some = JSON.parse(response);
            telForm('quality', some);
            btn.button('reset');
        });
}

function init() {
    if (dataValid()) {
        var btn = $('#loading');
        btn.button('loading');
        loadJSON('model.json', function (response) {
            var some = JSON.parse(response);
            var param = takeParam();
            olForm(param, some);
            btn.button('reset');
        });
    }
}

function getHelpers() {
    var hiddenInput = $('#ol .hide');
    for (var i = 0; i < hiddenInput.length; i++) {
        checkRadio(hiddenInput[i].name);
    }
}

function checkRadio(element) {
    var name = element.replace('helper', '');
    var rad = $('input[name="' + name + '"]');
    for (var i = 0; i < rad.length; i++) {
        rad[i].onclick = function () {
            rad[rad.length - 1].checked
                ? $('input[name="' + element + '"]').removeClass('hide')
                : $('input[name="' + element + '"]').not('.hide').addClass('hide');
        };
    }
}

function dataValid() {
    if (!getData()) {
        $('#datavalid').tooltip('show');
        return false;
    }
    return true;
}

function getData() {
    var radios = document.getElementsByName('data');
    var value;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].type === 'radio' && radios[i].checked) {
            value = radios[i].id;
        }
    }
    return value;
}

function telForm(type, modelJson) {
		var def = ['teltype', 'paral', 'dslonline', 'pbx', 'pbxreload'];
		var general = ['typetel', 'troublegen'];
		var quality = ['typetel', 'troublequality'];
        var fromArr = type === 'general' ?  general.concat(def) : quality.concat(def);
		alert(fromArr);
        var result = '';
        for (var i = 0; i < fromArr.length; i++) {
            result += createElement(fromArr[i], modelJson);
        }
        result += createElement('add', modelJson);
        document.getElementById('ol').innerHTML = result;
        getHelpers();
        $("#divwbut").removeClass('hide');
}

function olForm(param, modelJson) {
    loadJSON('tables.json', function (response) {
        var list = JSON.parse(response);
        var defVal = list[param.data][param.zone].def;
        var arr = (param.zone === 'c' || param.zone === 'n') ? list[param.data].s[param.trouble] : list[param.data][param.zone][param.trouble];
        var fromArr = defVal.concat(arr);
        var result = '';
        for (var i = 0; i < fromArr.length; i++) {
            result += createElement(fromArr[i], modelJson);
        }
        result += createElement('add', modelJson);
        document.getElementById('ol').innerHTML = result;
        getHelpers();
        $("#divwbut").removeClass('hide');
    });
}

function createElement(name, modelJson) {
    var fPart = '<tr><td>' + modelJson[name].q + '</td><td>';
    var input = '<input type="' + modelJson[name].t + '" name="' + name + '"/>';
    var inputR = '<input type="' + modelJson[name].t + '" name="' + name + '"';
    var inputL = '<input type="text" list="' + name + '" name="' + name + '" autocomplete="off"/>';
    var end = '</td></tr>';
    if (modelJson[name].t === 'text') {
        return fPart + input + end;
    }
    if (modelJson[name].t === 'list') {
        var list = '';
        var startL = '<datalist id="' + name + '">';
        var opt = '<option value="';
        var endL = '">';
        for (var i = 0; i < modelJson[name].a.length; i++) {
            list += opt + modelJson[name].a[i] + endL;
        }
        return fPart + inputL + startL + list + end;
    }
    try {
        var ph = modelJson[name].h.p;
        return fPart + inputGen(inputR, modelJson[name].a) + elementWithHelper(name, ph) + end;
    }
    catch (e) {
        return fPart + inputGen(inputR, modelJson[name].a) + end;
    }
}

function elementWithHelper(name, ph) {
    return '<input class="hide" type="text" name="' + name + 'helper' + '" placeholder="' + ph + '"/>';
}

function inputGen(inputR, ansArray) {
    var result = '';
    for (i = 0; i < ansArray.length; i++) {
        result += inputR + ' value="' + i + '"/>' + ansArray[i] + '<br />';
    }
    return result;
}

function getText() {
    var inputs = $("#ol :input");
    if (checkInput(inputs)) {
        loadJSON('model.json', function (response) {
            var model = JSON.parse(response);
			var t = document.getElementById('trouble');
            var text = t.options[t.selectedIndex].innerHTML + '\n';
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].name.indexOf('helper') == -1) {
                    var radioNode = model[inputs[i].name].f[inputs[i].value];
                    var textNode = model[inputs[i].name].f;
                    if (inputs[i].type === 'radio' && inputs[i].checked) {
                        (inputs[i + 1].name.indexOf('helper') == -1)
                            ? (text += radioNode + '\n')
                            : (text += radioNode);
                    }
                    if (inputs[i].type === 'text' && inputs[i].value) { //check if 'add' filled
                        text += textNode + inputs[i].value + '\n';
                    }
                }
                else {
                    if (inputs[i].value)
                        text += inputs[i].value + '\n';
                }
            }
            document.getElementById('text').innerHTML = text;
			document.getElementById('myModalLabel').innerHTML = 'Проблема: ' + t.options[t.selectedIndex].innerHTML.toLowerCase();
            $('#myModal').modal('toggle');
        });
    }
}

function getTelText() {
	var inputs = $("#ol :input");
    if (checkInput(inputs)) {
        loadJSON('model_tel.json', function (response) {
            var model = JSON.parse(response);
            var text = '';
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].name.indexOf('helper') == -1) {
                    var radioNode = model[inputs[i].name].f[inputs[i].value];
                    var textNode = model[inputs[i].name].f;
                    if (inputs[i].type === 'radio' && inputs[i].checked) {
                        (inputs[i + 1].name.indexOf('helper') == -1)
                            ? (text += radioNode + '\n')
                            : (text += radioNode);
                    }
                    if (inputs[i].type === 'text' && inputs[i].value) { //check if 'add' filled
                        text += textNode + inputs[i].value + '\n';
                    }
                }
                else {
                    if (inputs[i].value)
                        text += inputs[i].value + '\n';
                }
            }
            document.getElementById('text').innerHTML = text;
            $('#myModal').modal('toggle');
        });
    }
}

function checkInput(inputs) {
    var cell = [];
    for (var i = 0; i < inputs.length; i++) {
        if ((cell.indexOf(inputs[i].name) == -1)
            && (inputs[i].name != 'add'))
            cell.push(inputs[i].name);
    }
    var inputValid = true;
    for (var i = 0; i < cell.length; i++) {
        var empty = true;
        $('input[name="' + cell[i] + '"]').each(function () {
            if (this.checked
                || (this.type === 'text' && this.value)) {
                empty = false;
                $(this).closest('td').removeClass('danger');
            }
            if (this.type === 'text' && this.className.indexOf('hide') != -1)
                empty = false;
        });
        if (empty) {
            $('input[name="' + cell[i] + '"]').closest('td').addClass('danger');
            inputValid = false;
        }
    }
    return inputValid;
}