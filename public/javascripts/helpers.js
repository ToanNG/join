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