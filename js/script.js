// /*Day Themes*/ /*Night Themes*/
// --nav-color: #4747FF #00008F;
// --main-splash-color: #00a4b6#3A3370;
// --primary-backround-color: #ffffff #E5E5E5;
// --primary-text-color: #212121;
// --secondary-backround-color: #E5E5E5 #292929;
// --secondary-text-color: #212121 #E5E5E5;

const _ = {};

_.each = function (list, callback) {
	
	// test for array
	if (Array.isArray(list)===true) {
		for (i  = 0; i < list.length; i++) {
			callback(list[i], i, list);
		};
	} else {
		for (key in list) {
			callback(list[key], key, list);
		};
	};
};




let root = document.documentElement;


//Set up night and day palletes

const themePalette = {
	day:    {
			'--nav-color': '#4747FF',
			'--main-splash-color': '#00a4b6',
			'--primary-backround-color': '#ffffff',
			'--secondary-backround-color': '#E5E5E5',
			'--secondary-text-color': '#212121'
		},
	night: {
			'--nav-color': '#00008F',
			'--main-splash-color': '#3A3370',
			'--primary-backround-color': '#E5E5E5',
			'--secondary-backround-color': '#292929',
			'--secondary-text-color': '#E5E5E5'
		},
};


//Currently the default theme is night
let nextTheme = themePalette.day;

function swapTheme() {
	if (nextTheme == themePalette.night) {

		_.each (nextTheme, function(hexVal, cssVarName) {
			root.style.setProperty(cssVarName, hexVal);
		});
		nextTheme = themePalette.day;
	} else {
		
		_.each (nextTheme, function(hexVal, cssVarName) {
			root.style.setProperty(cssVarName, hexVal);
		});
		
		nextTheme = themePalette.night;
	}

};