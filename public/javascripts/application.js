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

window.App = {
	Models: {},
	Collections: {},
	Views: {},
	Router: {}
};

App.Router = Backbone.Router.extend({
	routes: {
		'': 'index',
		'a': 'test'
	},

	index: function() {
		console.log("Backbone is ready!");
	},

	test: function() {
		console.log("This is test page");
	}
});

new App.Router;
Backbone.history.start();

function AppModel(url) {
	this.url = url;
}

AppModel.prototype.fetch = function(data) {
	data = (data) ? data : null;

	return $.ajax({
		url: this.url,
		type: "GET",
		data: data,
		dataType: "json",
		beforeSend: function(){

		},
		error: function(e){
			
		},
		success: function(fetchData){
			console.log(fetchData);
		}
	})
};

AppModel.prototype.post = function(data) {
	return $.ajax({
		url: this.url,
		type: "POST",
		dataType: "json",
		data: data
	});
}

function UserModel(url) {
	AppModel.call(this, url);
}

UserModel.prototype = Object.create(AppModel.prototype);

// var allUsers = new UserModel("/api/users");
// allUsers.fetch();

var Template = (function($) {
	var HandlebarsTemplates = [],
		baseURL = '/templates/';

	return {
		downloadTemplate: function(templateName) {
			return $.ajax({
				cache: true,
				url: baseURL + templateName + '.html'
			});
		},

		getTemplate: function(templateName) {
			var deferred = $.Deferred();

			if ( typeof HandlebarsTemplates[templateName] !== 'undefined' ) {
				deferred.resolve();
			} else {
				this.downloadTemplate(templateName).done(function(template) {
					HandlebarsTemplates[templateName] = template;
					deferred.resolve();
				});
			}

			return deferred.promise();
		},

		render: function(context, templateName) {
			source = HandlebarsTemplates[templateName];
			template = Handlebars.compile(source);
			return template(context);
		}
	}
})(jQuery);