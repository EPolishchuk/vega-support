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

function createEventOk(element, textForSelectors) {
    element.onclick = function(){        
        $('#'+textForSelectors).addClass('hide');
        $('#'+textForSelectors+'-button').removeClass('hide');
        $('input[name='+textForSelectors+']').attr('checked',false);
        if ($('input[name='+textForSelectors+'-text]').length) {
            $('input[name='+textForSelectors+'-text]').not('.hide').addClass('hide');
            $('input[name='+textForSelectors+'-text]').val('');                
        }
    }
}

function createEventProblem(element, textForSelectors) {    
    var parentRow = $(element).closest('tr').find('td');
    var siblingElementText = '';
    parentRow.each(function(){
        if (this.id.indexOf(textForSelectors) == -1) {
          siblingElementText = sliceOutId(this.id, siblingElementText);

        }
    });
    element.onclick = function(){        
        $('#'+siblingElementText).addClass('hide');
        $('#'+textForSelectors).removeClass('hide');
        $('#'+textForSelectors+'-button').addClass('hide');
        $('#'+siblingElementText+'-button').removeClass('hide');
    }
}

function applyAutoHide(nodes) {
    for (var i = 0; i < nodes.length; i++) {  
        var id = nodes[i].id;  
        var textForSelectors = sliceOutId(id, textForSelectors);  
        if (nodes[i].id.indexOf('ok') != -1) {
            createEventOk(nodes[i], textForSelectors);            
        }
        else {
            createEventProblem(nodes[i], textForSelectors);
        }
    }
}

function sliceOutId(idName, textForSelectors) {
    var idPosition = idName.indexOf("-", idName.indexOf("-") + 1);
    textForSelectors = idName.slice(0, idPosition); 
    return textForSelectors;
}

function applyHelpers(nodes) {
    $(nodes).each(function(){
        checkRadio(this.name);
    })
}

$(document).ready(function() {
    applyAutoHide($('td button'));

    applyHelpers($('[name*=-text]'));

	checkPBX();
});

function checkRadio(element) {
    var name = element.replace('-text', '');
    var rad = $('input[name="' + name + '"]');
    for (var i = 0; i < rad.length; i++) {
        rad[i].onclick = function () {
            rad[rad.length - 1].checked
                ? $('input[name="' + element + '"]').removeClass('hide')
                : $('input[name="' + element + '"]').not('.hide').addClass('hide');
        };
    }
}

function checkPBX() {    
    var rad = $('input[name="pbx"]');
    for (var i = 0; i < rad.length; i++) {
        rad[i].onclick = function () {
            rad[0].checked
                ? $('#reload-pbx').removeClass('hide')
                : $('#reload-pbx').not('.hide').addClass('hide');
        };
    }
}

function checkInputTel(inputs) {
    var cell = [];
    for (var i = 0; i < inputs.length; i++) {
        if ((cell.indexOf(inputs[i].name) == -1)
            && (inputs[i].name != 'add')
            && inputs[i].name.indexOf('pbxreload') == -1)
            cell.push(inputs[i].name);
    }
    var pbx = document.getElementById('reload-pbx');
    if (pbx.className.indexOf('hide') == -1)  {
        cell.push('pbxreload');
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

function checkInOut() {
    var inOut = $("td > div");
    var none = true;
    for (var i = 0; i < inOut.length; i++) {
        if (inOut[i].className.indexOf('hide') == -1) {
            $('input[name*="' + inOut[i].id + '"]').each(function () {
				if (this.checked) {
					none = false;					
				}
				if ((this.className.indexOf('hide') === -1) && this.type === 'text' && !this.value) {
					none = true;
				}
			});
		}
    }
    if (none) {
        $('#out-general-block').addClass('danger');
        $('#out-quality-block').addClass('danger');
        $('#in-general-block').addClass('danger');
        $('#in-quality-block').addClass('danger');
        return false;
    }
    else {
        $('#out-general-block').removeClass('danger');
        $('#out-quality-block').removeClass('danger');
        $('#in-general-block').removeClass('danger');
        $('#in-quality-block').removeClass('danger');
        return true;
    }
}

function getTelText() {
    var inputs = $("td > input"); // all inputs except in/out 
    if (checkInputTel(inputs) && checkInOut()) {
        loadJSON('modeltel.json', function (response) {
            var model = JSON.parse(response);
            var text = '';
            text += getInOutText(model);
            for (var i = 0; i < inputs.length; i++) {
                    inputs[i].name = inputs[i].name.replace('-text', '');
                    var radioNode = model[inputs[i].name].f[inputs[i].value];
                    if (inputs[i].type === 'radio' && inputs[i].checked) {
                        (inputs[i + 1].name.indexOf('text') == -1)
                            ? (text += radioNode + '\n')
                            : (text += radioNode);
                    }
            }
            document.getElementById('text').innerHTML = text;
            $('#myModal').modal('toggle');
        });
    }
}

function getInOutText(model) {
    var inOutText = '';
    var elements = $('td > div:not(.hide)');
    return getTextByElements(elements, model, inOutText);
}

function getTextByElements(elements, model, inOutText) {
    var helper = ['Входящая связь: ', 'Исходящая связь: '];
    if (elements.length > 2 || elements.length < 1) {
        inOutText += 'Failed to generate text. Reload page and try again';
    }
    else {
        if (jQuery(elements).find('[id*=out]').length && jQuery(elements).find('[id*=in]').length) {
            for (var i = 0; i < elements.length; i++) {
                inOutText +=  helper[i] + getText(elements[i], model);
            }
            return inOutText;
        }
        else if (!jQuery(elements).find('[id*=out]').length) {
            inOutText += helper[0] + 'работает' + '\n' + helper[1] + getText(elements[0], model);            
            return inOutText;
        }
        else {
            inOutText += helper[0] + getText(elements[0], model) + helper[1] + 'работает' + '\n';
            return inOutText;
        }       
    }
}   

function getText(element, model){
    var id = element.id;
    var textForOut = id.substr(id.indexOf("-") + 1);
    var result = '';
    element = element.getElementsByTagName('input');
    for (var i = 0; i < element.length; i++) {
        var radioNode = model[textForOut].f[element[i].value];
        if (element[i].type === 'radio' && element[i].checked) {
            ((i + 1 === element.length) || (element[i + 1].name.indexOf('text') == -1))
                ? (result += radioNode + '\n')
                : (result += radioNode + element[i+1].value + '\n');
        }
    }
    return result;
}