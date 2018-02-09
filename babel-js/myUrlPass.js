'use strict';

// functions to handle passing data via url :)


function tasksUrl() {
	var getit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


	if (!getit) {
		if (tasks.length) {
			// this function returns compressed tasks to a url tahat can be sent to someone
			var thisUrl = window.location.href.split('?')[0]; // grabbing the base adress
			var urlData = LZString.compressToEncodedURIComponent(JSON.stringify({ tasks: tasks }));

			// cearing console
			dataconsole.val(thisUrl + '?tasks=' + urlData);
			dataconsole.select();
			try {
				var successful = document.execCommand('copy');
				var msg = successful ? 'successful' : 'unsuccessful';
				console.log('Copying text command was ' + msg);
				if (successful) {
					alert('Link is copied to clippboard');
					dataconsole.val('');
				}
				return true;
			} catch (err) {
				console.log('Oops, unable to copy');
				return false;
			}
		} else {
			return false;
		}
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