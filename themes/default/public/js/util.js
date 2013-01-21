
function getTmpl(name) {
  var tmpl, html;
  if(!App.templates[name]) {
    html = $('script[data-id="' + name +'"]').html();
    tmpl = swig.compile(html, {filename: name});
    App.templates[name] = tmpl;
  }
  return App.templates[name];
}