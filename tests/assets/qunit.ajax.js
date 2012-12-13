function _tester(method) {
  return function(url, statusCode, _data) {
    var data;
    var label = method.toUpperCase() + ' ' + url;
    if(statusCode.toString() == '[object Object]') {
      //get('/foo', {foo: 'bar'}, 200, '{ok: true}')
      data = statusCode;
      statusCode = _data;
      _data = arguments[3];
    }
    stop();
    ajax({
        url: url,
        type: method,
        dataType: 'json',
        data: data || {},
        success: function (d, code, resp) {
          equal(resp.status, statusCode, label + ' : Status code');
          if(_data) { deepEqual(d, _data, label + ' : data'); }
          start();
        },
        error: function(resp) {
          equal(resp.status, statusCode, label + ' : Status code');
          start()
        }
    });
  }
}


var get = _tester('get');
var post = _tester('post');
var put = _tester('put');
var del = _tester('delete');