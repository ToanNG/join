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