module.exports = {
	"gruntfile": {
		"files": ["Gruntfile.js","grunt/*.js"],
		"tasks": ["jshint:gruntfile"],
		"interrupt": true
	},
	"js": {
		"files": "src/scripts/**/*",
		"tasks": ["jshint:js", "browserify:dev"],
		"interrupt": true
	},
	"copy": {
		"files": ["src/**/*", "!src/scripts/*"],
		"tasks": "copy:static",
		"interrupt": true
	},
	"version": {
		"files": ["package.json"],
		"tasks": "version",
		"interrupt": true
	}
};
