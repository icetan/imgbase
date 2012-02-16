var fs = require('fs')
  , http = require('http')

function getBase64 (url, fn) {
  var m = /^(https?):\/\/([^:\/]+)(?::(\d+))?([^:]*)$/.exec(url);
  if (m !== null) {
    http.get({host:m[2], port:parseInt(m[3]||80), path:m[4]}, function (res) {
      var buf = '';
      res.on('data', function (data) { buf += data; });
      res.on('end', function () {
        fn(new Buffer(buf).toString('base64'));
      });
    });
  } else {
    fs.readFile(url, function (err, data) {
      fn(data.toString('base64'));
    });
  }
}

function imgbase (sIn, sOut) {
  var buf = '';
  sIn.resume();
  sIn.on('data', function (data) {
    var re = /url\(["']?([^\)]*\.(png|gif|jpeg|jpg))["']?\)/g;
    buf += data;
    var parse = function (start) {
      var m = re.exec(buf);
      if (m !== null) {
        sIn.pause();
        var index = m.index
          , len = m[0].length
          , url = m[1]
          , type = m[2];
        getBase64(url, function (img) {
          sOut.write(buf.slice(start, index)
            +'url(data:image/'+type+';base64,'+img+')');
          parse(index + len);
        });
      } else {
        buf = buf.slice(start);
        sIn.resume();
      }
    }
    parse(0);
  });
  sIn.on('end', function () {
    sOut.write(buf);
  });
}

module.exports = imgbase;

if (!module.parent) {
  imgbase(process.stdin, process.stdout);
}
