// functions to handle passing data via url :)


function tasksUrl(getit=false) {
	
	if (!getit){
			if(tasks.length){
			// this function returns compressed tasks to a url tahat can be sent to someone
			let thisUrl = window.location.href.split('?')[0];  // grabbing the base adress
			let urlData = LZString.compressToEncodedURIComponent(JSON.stringify({tasks: tasks}));
					
			// cearing console
			dataconsole.val(thisUrl + '?tasks=' + urlData);
			dataconsole.select();
			 try {
	   				var successful = document.execCommand('copy');
				    var msg = successful ? 'successful' : 'unsuccessful';
				    console.log('Copying text command was ' + msg);
				    if (successful){
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
			let thisUrl = window.location.href;  // grabbing the base adress
			let url = new URL(thisUrl);
			let tasksString = url.searchParams.get("tasks");
			
			if (tasksString){
			
				let localTasks = JSON.parse(LZString.decompressFromEncodedURIComponent(tasksString)).tasks;
				tasks = localTasks;
				redrawAll();
				let cleanUrl = window.location.pathname;
				window.history.pushState("object or string", "Title", cleanUrl);	
				return true;
			
			} else {
				return false;
			}


	}
}