var fs = require('fs')
  , http = require('http')

function getBase64 (url, fn) {
  console.error('> ' + url);
  var m = /^(https?):\/\/([^:\/]+)(?::(\d+))?([^:]*)$/.exec(url);
  if (m !== null) {
    http.get({host:m[2], port:parseInt(m[3]||80), path:m[4]}, function (res) {
      var buf = '';
      res.on('data', function (data) {
        buf += data;
      });
      res.on('end', function () {
        fn(new Buffer(buf).toString('base64'));
      });
    });
  } else {
    fs.readFile(url, function (data) {
      fn(data.toString('base64'));
    });
  }
}

function imgbase (sIn, sOut) {
  var buf = '';
  sIn.resume();
  sIn.setEncoding('utf-8');
  sIn.on('data', function (data) {
    buf += data;
    var m = /url\(["']?([^\)]*\.(png|gif|jpeg|jpg))["']?\)/g.exec(buf);
    if (m !== null) {
      sIn.pause();
      getBase64(m[1], function (img) {
        sOut.write(buf.slice(0, m.index)
          +'url(data:image/'+m[2]+';base64,'+img+')');
        buf = buf.slice(m.index + m[0].length);
        sIn.resume();
      });
    }
  });
  sIn.on('end', function () {
    sOut.write(buf);
  });
}

module.exports = imgbase;

if (!module.parent) {
  imgbase(process.stdin, process.stdout);
}
