// functions to handle passing data via url :)


function tasksUrl(getit=false) {
	
	if (!getit){
		// this function returns compressed tasks to a url tahat can be sent to someone
			let thisUrl = window.location.href.split('?')[0];  // grabbing the base adress
			let urlData = LZString.compressToEncodedURIComponent(JSON.stringify({tasks: tasks}));
		return thisUrl + '?tasks=' + urlData;
	} else {
			let thisUrl = window.location.href;  // grabbing the base adress
			let url = new URL(thisUrl);
			let tasksString = url.searchParams.get("tasks");
			
			if (tasksString){
			
				let localTasks = JSON.parse(LZString.decompressFromEncodedURIComponent(tasksString)).tasks;
				tasks = localTasks;
				redrawAll();
				return true;
			
			} else {
				return false;
			}


	}
}