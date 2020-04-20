cordova.define("cordova-plugin-barcodegenerator.BarcodeGenerator", function(require, exports, module) { var argscheck = require('cordova/argscheck'),
    exec = require('cordova/exec');

var barcodegenerator_exports = {};

barcodegenerator_exports.generate = function(options, success, error) {
    var defaults = {
        'content': 'DefaultBarcode',
	       'height': 128,
		    'width': 128,
        'format': 11,
        'foregroundColor': '#000000',
        'backgroundColor': '#FFFFFF'
	};

    // Merge optional settings into defaults.
    for (var key in defaults) {
        if (typeof options[key] !== 'undefined') {
            defaults[key] = options[key];
        }
    }

    exec(success, error, 'BarcodeGenerator', 'generate', [ defaults ]);
};

module.exports = barcodegenerator_exports;

});
