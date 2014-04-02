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
var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

//Handlebars helpers
Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {
  if (arguments.length < 3)
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    operator = options.hash.operator || "==";

    var operators = {
      '==':     function(l,r) { return l == r; },
      '===':    function(l,r) { return l === r; },
      '!=':     function(l,r) { return l != r; },
      '<':      function(l,r) { return l < r; },
      '>':      function(l,r) { return l > r; },
      '<=':     function(l,r) { return l <= r; },
      '>=':     function(l,r) { return l >= r; },
      'typeof': function(l,r) { return typeof l == r; }
    };

    if (!operators[operator])
      throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if (result) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
});

Handlebars.registerHelper('truncate', function(value, maxLength, useWordBoundary) {
  if (typeof value !== 'string')
    throw new Error("Handlerbars Helper 'truncate' requires a string");

  var toLong = value.length>maxLength,
      s_ = toLong ? value.substr(0, maxLength-1) : value;
  s_ = useWordBoundary && toLong ? s_.substr(0, s_.lastIndexOf(' ')) : s_;
  return  toLong ? new Handlebars.SafeString(s_+'&hellip;') : new Handlebars.SafeString(s_);
});