var fs = require('fs')
  , http = require('http')
  , Stream = require('stream').Stream;

function getBase64 (url, fn, opt) {
  var m = /^(https?):\/\/([^:\/]+)(?::(\d+))?([^:]*)$/.exec(url);
  if (!opt) opt = {};
  if (m !== null) {
    http.get({host:m[2], port:parseInt(m[3]||80), path:m[4]}, function (res) {
      var buf = ''
      res.setEncoding('binary');
      res.on('data', function (data) { buf += data; });
      res.on('end', function () {
        fn(new Buffer(buf, 'binary').toString('base64'));
      });
    });
  } else {
    if (url[0] === '/') {
      url = (opt.base ? opt.base+'/' : '')+url.slice(1);
    } else {
      url = (opt.rel ? opt.rel+'/' : '')+url;
    }
    fs.readFile(url, function (err, data) {
      fn(data.toString('base64'));
    });
  }
}

function compileStream (sIn, sOut, opt) {
  var buf = '';
  sIn.resume();
  sIn.on('data', function (data) {
    var re = /url\(["']?\s*([^\)]*\.(png|gif|jpeg|jpg))\s*["']?\)/g;
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
        }, opt);
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

function compileString (str, callback, opt) {
    var result = '';
    var re = /url\(["']?\s*([^\)]*\.(png|gif|jpeg|jpg))\s*["']?\)/g;
    var parse = function (start) {
      var m = re.exec(str);
      if (m !== null) {
        var index = m.index
          , len = m[0].length
          , url = m[1]
          , type = m[2];
        getBase64(url, function (img) {
          result += (str.slice(start, index)
            +'url(data:image/'+type+';base64,'+img+')');
          parse(index + len);
        }, opt);
      } else {
        callback(result + str.slice(start));
      }
    }
    parse(0);
}

function imgbase (input, output, opt) {
    if (typeof input === 'string') {
      compileString(input, output, opt);
    } else {
      compileStream(input, output, opt);
    }
}

module.exports = imgbase;
