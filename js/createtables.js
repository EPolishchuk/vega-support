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

    return {
        zone: fil,
        data: valueD,
        trouble: trb
    };
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
                ? $('input[name="' + element + '"]').removeClass('hide').addClass('helper-input')
                : $('input[name="' + element + '"]').not('.hide').addClass('hide').removeClass('helper-input');
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

function olForm(param, modelJson) {
    loadJSON('tables.json', function (response) {
        var list = JSON.parse(response);
        var defVal = list[param.data][param.zone].def;
        var arr = (param.zone === 'c' || param.zone === 'n') ? list[param.data].s[param.trouble] : list[param.data][param.zone][param.trouble];
        var fromArr = defVal.concat(arr);
        var result = document.getElementById('ol');
        result.innerHTML = '';
        for (var i = 0; i < fromArr.length; i++) {
            result.appendChild(createElement(fromArr[i], modelJson));
        }
        result.appendChild(createElement('add', modelJson));
        getHelpers();
        $("#divwbut").removeClass('hide');
    });
}

function createElement(name, modelJson) {
    var wrapperRow = document.createElement('tr');    
    wrapperRow.appendChild(createTD(modelJson[name].q));
    switch (modelJson[name].t) {
        case 'list':
            wrapperRow.appendChild(createList(name, modelJson[name].a));
            return wrapperRow;
            break;
        case 'text':
            wrapperRow.appendChild(createText(name, modelJson[name].a));
            return wrapperRow;
            break;
        case 'radio':
            wrapperRow.appendChild(createRadio(name, modelJson[name].a));
            if (modelJson[name].hasOwnProperty('h')) {
                wrapperRow = createHelper(wrapperRow, modelJson, name);    
            }
            return wrapperRow;
            break;
        default:
            wrapperRow.appendChild(errorBlock());
            return wrapperRow;
            break;
    }
}

function createTD(innerText) {
    var tableCell = document.createElement('td');
    tableCell.innerHTML = innerText;
    return tableCell;
}

function createHelper(wrapperRow, modelJson, name) {
    var helperInput = document.createElement('input');
    helperInput.type = 'text';

    if ((modelJson[name].h).hasOwnProperty('n')) {
        helperInput.name = modelJson[name].h.n;
    }
    else {
        helperInput.name = 'helper' + (~~(Math.random()*1000));        
    }
    helperInput.placeholder = modelJson[name].h.p;
    helperInput.className += 'hide';

    var tdChoices = wrapperRow.lastChild;

    tdChoices.insertBefore(helperInput, tdChoices.lastChild);

    return wrapperRow;
}

function createText(innerText) {
    var tdChoices = createTD('');
    var inputText = document.createElement('input');

    inputText.type = text;
    inputText.name = name;

    tdChoices.appendChild(inputText);

    return tdChoices;
}

function createList(name, listChoices) {
    var tdChoices = createTD('');
    var inputList = document.createElement('input');

    inputList.autocomplete = 'off';
    inputList.name = name;
    inputList.setAttribute('list', name);

    tdChoices.appendChild(inputList);

    var datalist = document.createElement('datalist');
    datalist.id = name;

    for (var i = 0; i < listChoices.length; i++) {
        var option = document.createElement('option');
        option.value = listChoices[i];
        datalist.appendChild(option);
    }
    tdChoices.appendChild(datalist);
    return tdChoices;
}

function createRadio(name, radioChoices) {
    var tdChoices = createTD('');
    for (var i = 0; i < radioChoices.length; i++) {
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = i;
        radio.id = name + '' + i;

        var label = document.createElement('label');
        label.setAttribute('for', radio.id);
        label.innerHTML = radioChoices[i];        

        var br = document.createElement('br');

        tdChoices.appendChild(radio);
        tdChoices.appendChild(label);
        tdChoices.appendChild(br);        
    } 

    return tdChoices;
}

function errorBlock() {
    return createTD('Creation of this block was stopped due to error. Reload page and try again.');
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