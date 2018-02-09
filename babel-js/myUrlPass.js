'use strict';

// functions to handle passing data via url :)


function tasksUrl() {
	var getit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


	if (!getit) {
		// this function returns compressed tasks to a url tahat can be sent to someone
		var thisUrl = window.location.href.split('?')[0]; // grabbing the base adress
		var urlData = LZString.compressToEncodedURIComponent(JSON.stringify({ tasks: tasks }));
		return thisUrl + '?tasks=' + urlData;
	} else {
		var _thisUrl = window.location.href; // grabbing the base adress
		var url = new URL(_thisUrl);
		var tasksString = url.searchParams.get("tasks");

		if (tasksString) {

			var localTasks = JSON.parse(LZString.decompressFromEncodedURIComponent(tasksString)).tasks;
			tasks = localTasks;
			redrawAll();
			return true;
		} else {
			return false;
		}
	}
}