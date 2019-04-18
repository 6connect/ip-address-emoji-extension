const input = document.getElementById('ip-address-input');
const button = document.getElementById('convert');

if (typeof chrome === "undefined") chrome = browser;

var defaults = {
	settings: {
		length: 10,
		c: ["letters", "letters_upper", "numbers", "symbols"]
	},
	persistance: {
		c: true,
		length: true
	}
};

var options = defaults.settings;
var persistance = defaults.persistance;


function selectIp() {
	if (document.selection) {
		var range = document.body.createTextRange();
		range.moveToElementText(input);
		range.select();
	} else if (window.getSelection) {
		var range = document.createRange();
		range.selectNode(input);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
	}
}

window.addEventListener("keyup", updateKeyTime);
window.addEventListener("keydown", updateKeyTime);
window.addEventListener("keypress", updateKeyTime);

var keyboardTimeout = 0;
function updateKeyTime() {
	keyboardTimeout = Date.now();
}

try {
	chrome.storage.sync.get('key', function (data) {
		console.log(data);
		if (!data || !data.key) data = { key: defaults }
		if (data && data.key && data.key.persistance && data.key.settings) {
			data = data.key;
			options = data.settings;

			for (var i = 0; i < options.c.length; i++) {
				document.getElementById(options.c[i]).checked = true;
			}

		}
		//settingsLoaded();
	});
} catch (e) {
	console.log('Is this a browser extension or a webpage?')
}



/*function settingsLoaded() {
	var eles = document.getElementsByClassName("hide-before-load");
	for (let i = 0; i < eles.length; i++) {
		eles[i].classList.remove("hide-before-load");
	}
	convert();

	selectIp();
}*/



const checkWidth = () => {
	if (input.textContent.match(':') !== null || input.textContent.match('👏') !== null) {
		input.style.fontSize = "10px";
		input.classList.add('ipv6');
	} else {
		input.style.fontSize = "14px";
		input.classList.remove('ipv6');
	}
}

const ipEncode = () => {
	let string = '';
	for (let index = 0; index < input.childNodes.length; index++) {
		if (input.childNodes[index].alt) string += input.childNodes[index].alt;
		else string += input.childNodes[index].textContent;
	}
	input.innerHTML = twemoji.parse(ipemotes.encode(string));
	checkWidth();
}
const ipParse = () => {
	let string = '';
	for (let index = 0; index < input.childNodes.length; index++) {
		if (input.childNodes[index].alt) string += input.childNodes[index].alt;
		else string += input.childNodes[index].textContent;
	}
	input.textContent = ipemotes.parse(string);
	checkWidth();
}


input.addEventListener('keydown', checkWidth);
input.addEventListener('keyup', checkWidth);
input.addEventListener('click', checkWidth);
input.addEventListener('change', checkWidth);

button.addEventListener('click', ()=>{
	if (input.textContent.match(/[a-z0-9]/gi) !== null) {
		try {
			ipEncode();
		} catch (e) {
			ipParse();
		}
	} else {
		try {
			ipParse();
		} catch (e) {
			ipEncode();
		}
	}
	selectIp();
})

const replace = document.getElementById('replace');
replace.addEventListener('click', () => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs)=>{
		console.log(tabs[0])
		
		chrome.tabs.executeScript(tabs[0].ib, {
			file: 'emoji.js'
		});
		chrome.tabs.executeScript(tabs[0].ib, {
			file: 'inject.js'
		});
	});

});