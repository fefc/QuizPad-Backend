cordova.define("cordova-plugin-barcodegenerator.BarcodeGeneratorProxy", function(require, exports, module) { async function generate(successCallback, errorCallback, data) {
  var params = data[0];

  if (params.format == 11) {
    var qrcodeContainer = document.createElement('div');
    qrcodeContainer.id = 'qrcode';

    //Create QRCode instance without text, so we can add onload event
    var qrcode = new QRCode(qrcodeContainer, {
      width: params.width,
      height: params.height,
      colorDark : params.foregroundColor,
      colorLight : params.backgroundColor,
      correctLevel : QRCode.CorrectLevel.L
    });

    qrcodeContainer.children[1].onload = function(pic) {
      //When picture content is loaded we can return it
      var base64 = qrcodeContainer.children[1].getAttribute('src').replace('data:image/png;base64,', '');
      successCallback(base64);
    };

    //Now that the event is hooked we can add text
    qrcode.makeCode(data[0].content);

  } else {
    errorCallback("BarcodeGenerator only supports QRCode on browser.");
  }
}

module.exports = {
  generate: generate
};

require( "cordova/exec/proxy" ).add( "BarcodeGenerator", module.exports );

});
