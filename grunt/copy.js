module.exports = {
	"static": {
		"files": [{
			"expand": true,
			"cwd": "src/",
			"src": ["**/*", "!scripts/**"],
			"dest": "build/"
		}]
	}
};
