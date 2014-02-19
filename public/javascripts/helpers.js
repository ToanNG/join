//Monkey patching
Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

Array.prototype.uniq = function() {
  var prim = {"boolean":{}, "number":{}, "string":{}}, obj = [];

  return this.filter(function(x) {
    var t = typeof x;
    return (t in prim) ? 
      !prim[t][x] && (prim[t][x] = 1) :
      obj.indexOf(x) < 0 && obj.push(x);
  });
};

String.prototype.highlight = function(key) {
  var temp = this.substr(this.toLowerCase().indexOf(key.toLowerCase()), key.length);
  return this.replace(new RegExp(key, "i"), '<span style="background-color: yellow;">'+temp+'</span>');
};

//Helpers
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();