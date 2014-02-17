function AppUtil () {
	var util = {
		checkEnvironment: function() {
			
		}
	};

	return {
		env: util.checkEnvironment
	}
}

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