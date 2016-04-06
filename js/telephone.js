$(document).ready(function() {
    document.getElementById('out-general-button').onclick = function() { 
		$('#out-quality').addClass('hide');
		$('#out-general').removeClass('hide');
		$('#out-general-button').addClass('hide');
		$('#out-quality-button').removeClass('hide');
	};
    document.getElementById('out-quality-button').onclick = function() { 
		$('#out-general').addClass('hide');
		$('#out-quality').removeClass('hide');
		$('#out-quality-button').addClass('hide');
		$('#out-general-button').removeClass('hide');
	};
	document.getElementById('in-general-button').onclick = function() { 
		$('#in-quality').addClass('hide');
		$('#in-general').removeClass('hide');
		$('#in-general-button').addClass('hide');
		$('#in-quality-button').removeClass('hide');
	};
    document.getElementById('in-quality-button').onclick = function() { 
		$('#in-general').addClass('hide');
		$('#in-quality').removeClass('hide');
		$('#in-quality-button').addClass('hide');
		$('#in-general-button').removeClass('hide');
	};
	document.getElementById('out-general-ok-button').onclick = function() { 
		$('#out-general').addClass('hide');
		$('#out-general-button').removeClass('hide');
		$('input[name=out-general]').attr('checked',false);
		$('input[name=out-general-text]').not('.hide').addClass('hide');
		$('input[name=out-general-text]').val('');
	};
	document.getElementById('out-quality-ok-button').onclick = function() { 
		$('#out-quality').addClass('hide');
		$('#out-quality-button').removeClass('hide');
		$('input[name=out-quality]').attr('checked',false);
	};
	document.getElementById('in-general-ok-button').onclick = function() { 
		$('#in-general').addClass('hide');
		$('#in-general-button').removeClass('hide');
		$('input[name=in-general]').attr('checked',false);
		$('input[name=in-general-text]').not('.hide').addClass('hide');
		$('input[name=in-general-text]').val('');
	};
	document.getElementById('in-quality-ok-button').onclick = function() { 
		$('#in-quality').addClass('hide');
		$('#in-quality-button').removeClass('hide');
		$('input[name=in-quality]').attr('checked',false);
	};
	checkPBX();
	checkRadio('type-text');
	checkRadio('out-general-text');
	checkRadio('in-general-text');
	checkRadio('paral-text');
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
    var outG = document.getElementById('out-general');
    var outQ = document.getElementById('out-quality');
    var inG = document.getElementById('in-general');
    var inQ = document.getElementById('in-quality');
	var outT = document.getElementById('out-general-text'); 
	var inT = document.getElementById('in-general-text'); 
    var inOut = [outG, outQ, inG, inQ, outT, inT];
    var none = true;
    for (var i = 0; i < inOut.length; i++) {
        if (inOut[i].className.indexOf('hide') == -1) {
            $('input[name="' + inOut[i].id + '"]').each(function () {
				if (this.checked) {
					none = false;					
				}
				if (this.type === 'text' && !this.value) {
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
	var inputs = $("#ol :input:not(:button)").not("input[name='out-general'], input[name='out-quality'], input[name='in-general'], input[name='in-quality'], input[name='in-general-text'], input[name='out-general-text']");
    if (checkInputTel(inputs) && checkInOut()) {
        loadJSON('modeltel.json', function (response) {
            var model = JSON.parse(response);
            var text = '';
            text += inOutText(model);
            for (var i = 0; i < inputs.length; i++) {
                    inputs[i].name = inputs[i].name.replace('-text', '');
                    //alert(inputs[i].name); alert(inputs[i].value);
                    var radioNode = model[inputs[i].name].f[inputs[i].value];
                    //alert(radioNode);
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

function inOutText(model) {
    var inOutText = '';
    var outText = 'Входящая связь: ';
    var inText = 'Исходящая связь: ';
    var outG = document.getElementById('out-general');
    var outQ = document.getElementById('out-quality');
    var inG = document.getElementById('in-general');
    var inQ = document.getElementById('in-quality');
    var outT = document.getElementById('out-general-text');
    var inT = document.getElementById('in-general-text');
    var inOut = [outG, outQ, inG, inQ, outT, inT];
    if (outG.className.indexOf('hide') != -1 && outQ.className.indexOf('hide') != -1) {
        inOutText += outText + 'работает' + '\n';
    }
    else if (outG.className.indexOf('hide') === -1) {
        var inputOut = $("#out-general :input:not(:button)");
        var textForOut = 'general';
        for (var i = 0; i < inputOut.length; i++) {
            var radioNode = model[textForOut].f[inputOut[i].value];
            if (inputOut[i].type === 'radio' && inputOut[i].checked) {
                (inputOut[i + 1].name.indexOf('text') == -1)
                    ? (inOutText += outText + radioNode + '\n')
                    : (inOutText += outText + radioNode + inputOut[i+1].value + '\n');
            }
        }
    }
    else if (outQ.className.indexOf('hide') === -1) {
        var inputOut = $("#out-quality :input:not(:button)");
        var textForOut = 'quality';
        for (var i = 0; i < inputOut.length; i++) {
            var radioNode = model[textForOut].f[inputOut[i].value];
            if (inputOut[i].type === 'radio' && inputOut[i].checked) {
                    inOutText += outText + radioNode + '\n';
            }
        }
    }

    if (inG.className.indexOf('hide') != -1 && inQ.className.indexOf('hide') != -1) {
        inOutText += inText + 'работает' + '\n';
    }
    else if (inG.className.indexOf('hide') === -1) {
        var inputOut = $("#in-general :input:not(:button)");
        var textForOut = 'general';
        for (var i = 0; i < inputOut.length; i++) {
            var radioNode = model[textForOut].f[inputOut[i].value];
            if (inputOut[i].type === 'radio' && inputOut[i].checked) {
                (inputOut[i + 1].name.indexOf('text') == -1)
                    ? (inOutText += inText + radioNode + '\n')
                    : (inOutText += inText + radioNode + inputOut[i+1].value + '\n');
            }
        }
    }
    else if (inQ.className.indexOf('hide') === -1) {
        var inputOut = $("#in-quality :input:not(:button)");
        var textForOut = 'quality';
        for (var i = 0; i < inputOut.length; i++) {
            var radioNode = model[textForOut].f[inputOut[i].value];
            if (inputOut[i].type === 'radio' && inputOut[i].checked) {
                inOutText += inText + radioNode + '\n';
            }
        }
    }

    return inOutText;
}