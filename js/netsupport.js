function hide() { //alert("!!!");
 document.getElementById('pcheck').style.display='none';
 document.getElementById('tcheck').style.display='none';
 document.getElementById('fl').style.display='none'; 
 document.getElementById('dns').style.display='none';
 document.getElementById('port').style.display='none';
 document.getElementById('mask').style.display='none';
 // document.getElementById('dns').style.display='none';
 //visibility: visible | hidden | collapse | inherit
}
function pcheck(event) { hide();
  document.getElementById('pcheck').style.display='block';
}
function tcheck(event) { hide();
  document.getElementById('tcheck').style.display='block';
}
function any(event) { hide();
   document.getElementById('fl').style.display='block';
   document.getElementById('dns').style.display='block';
}
function any_(event) { hide();
   document.getElementById('fl').style.display='block';
}

function port(event) { hide();
   document.getElementById('port').style.display='block';
}

function mask_(event) { hide();
   document.getElementById('mask').style.display='block';
}

function w(event) { hide();
}

window.onload = function () { 
	pcheck();
}