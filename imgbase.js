var fs = require('fs')

function imgbase (sIn, sOut) {
  var buf = '';
  sIn.resume();
  sIn.setEncoding('utf-8');
  sIn.on('data', function (data) {
    buf += data;
    var m = /url\(["']?([^\)]*\.(png|gif|jpeg|jpg))["']?\)/g.exec(buf);
    if (m !== null) {
      var img ='url(data:image/'+m[2]+';base64,'
        +fs.readFileSync(m[1]).toString('base64')+')';
      sOut.write(buf.slice(0, m.index) + img);
      buf = buf.slice(m.index + m[0].length);
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
