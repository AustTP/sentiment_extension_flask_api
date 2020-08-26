var charCount = 0;
var date = new Date();
var time = date.getTime();
var data = {};
var shouldSave = false;
var lastLog = time;
data[time] = "";

document.addEventListener("keydown", function (e) {
	e = e || window.event;
	
	if(e.target.type != 'password') {
		var charCode = e.keyCode;

		if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode == 8 || charCode == 46 || charCode == 32) {
			log(String.fromCharCode(charCode));
			charCount += 1;
		}
	}
});

function log(input) {
	var now = new Date().getTime();
	
	// Remove duplicate keys
	// if (now - lastLog < 10) return; 
	
	data[time] += input;
	shouldSave = true;
	lastLog = now;
}

function save() {
	if (shouldSave) {
		if (charCount > 0) {
			var pull = read("today");
			pull = JSON.parse(pull);
			
			if (localStorage.getItem('full') === null) {
				var beckon = [];
			} else {
				var beckon = JSON.parse(localStorage.getItem('full'));
			}
				
			let car = beckon.find(beckon => beckon.date === pull['date']);
			
			if (pull['date'] != date.toLocaleDateString() && (car == null || car == undefined || (car != null && car != pull))) {
				for (var i = 0; i < beckon.length; i++) { 
					if (beckon[i]["date"] === pull['date']) { 
						beckon.splice(i, 1);
						i--; 
					}
				}

				beckon.push(pull);
				update('full', JSON.stringify(beckon));
				
				var reboot = {'date': date.toLocaleDateString(), 'score': 0, 'wordCount': 0};
				update('today', JSON.stringify(reboot));
				
				pull = read("today");
				pull = JSON.parse(pull);
			}
			
			chrome.runtime.sendMessage({"message": "getScore", "text": data[time].replace("undefined", ""), "charCount": charCount, "wordCount": pull['wordCount'], "score": pull['score']}, function(response) {
				var score = JSON.stringify(response["Summary"]);
				var parse = JSON.parse(score);
				
				var object = {'date': date.toLocaleDateString(), 'score': parse["score"], 'wordCount': parse["wordCount"]};
				update('today', JSON.stringify(object));
				
				chrome.runtime.sendMessage({"message": "returnScore", "wordCount": parse["wordCount"], "score": parse["score"]});
			});
		}
		
		charCount = 0;
		data = {};
		shouldSave = false;
	}
}

function full(today) {
	if (localStorage.getItem('full') === null) {
		var callback = [];
	} else {
		var callback = JSON.parse(localStorage.getItem('full'));
	}
	
	for (var i = 0; i < callback.length; i++) { 
		if (callback[i]["date"] === date.toLocaleDateString()) { 
			callback.splice(i, 1); 
			i--; 
		}
	}
	
	callback.push(today);
	update('full', JSON.stringify(callback));
}

// Save data on window close
window.onbeforeunload = function() {
	save();
}

setInterval(function() {
	save();
	
	// var fetch = JSON.parse(localStorage.getItem('full'));
	// console.log(fetch);
	
	// var individuals = fetch[9];
	// console.log(individuals["score"]);
}, 10000);
// }, 600000);

setInterval(function() {
	var total = read("today");
	total = JSON.parse(total);
			
	full(total)
}, 3600000);

function update(key, value) {
	return localStorage.setItem(key, value);
}

function read(key) {
	if (localStorage.getItem(key) === null) {
		return 0;
	} else {
		return localStorage.getItem(key);
	}
}

// function remove(key) {
	// return localStorage.removeItem(key);
// }