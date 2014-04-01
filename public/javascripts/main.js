(function() {
	window.App = {
		Models: {},
		Collections: {},
		Views: {},
		Router: {}
	};

	window.vent = _.extend({}, Backbone.Events);

	window.template = function(id) {
		return Handlebars.compile( $('#' + id).html() );
	};

	window.TemplateManager = {
		templates: {},

		get: function(id, callback) {
			if (this.templates[id]) {
				return callback(this.templates[id]);
			}

			var url = '/templates/' + id + '.html',

			promise = $.get(url),
			that = this;

			promise.done(function(template) {
				// When we pre-compile a template for performance, 
				// it returns a function that we can store in our 
				// cache for future use.
				var tmp = Handlebars.compile(template);
				that.templates[id] = tmp;
				callback(tmp);
			});
		},

		partials: [
			'group-tab',
			'chat-window'
		],

		// Pre-load partials when our app is initialized
		preloadPartials: function(callback) {
			var that = this;

			_.each(this.partials, function(partial, index) {
				that.get(partial, function(tmp) {
					if (index + 1 === that.partials.length) {
						callback();
					}
				});
			});
		}
	};
})();