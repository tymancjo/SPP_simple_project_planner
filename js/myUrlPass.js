// functions to handle passing data via url :)

function getUID() {
// generating unique id code
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}


function tasksUrl(getit=false) {
	
	if (!getit){
			if(tasks.length){
			// this function prepare coded server repo to share data
				let urlData = JSON.stringify({tasks: tasks, markedFW: markedFW});
				let serveradress = 'https://tymancjo.pl/spp/api/';
				dataToServer(serveradress, urlData, getUID());
			}		
			
	} else {
			// let thisUrl = window.location.href;  // grabbing the base adress
			// let url = new URL(thisUrl);
			let thisUrl = window.location.search;  // grabbing the base adress
			let tasksString ='';

			if (thisUrl.indexOf('&') != -1) {
					tasksString = thisUrl.substring(thisUrl.indexOf('spp=')+'spp='.length, thisUrl.indexOf('&'));
			} else {
					tasksString = thisUrl.substring(thisUrl.indexOf('spp=')+'spp='.length);
			}

			if (tasksString){
				// if the spp is set in the adress proceed with data from server repo
				dataFromServer('https://tymancjo.pl/spp/api/', tasksString);

				// clean up the url adress 
				let cleanUrl = window.location.pathname;
				window.history.pushState("object or string", "Title", cleanUrl);	
				return true;
			
			} else {
				return false;
			}


	}
}

function copy(data, message=true) {
	// this function copy the console to system clippboard
			dataconsole.val(data);
			dataconsole.select();
			 try {
	   				var successful = document.execCommand('copy');
				    var msg = successful ? 'successful' : 'unsuccessful';
				    console.log('Copying text command was ' + msg);
				    if (successful){
				    	if (message) {
				    		alert('Link is copied to clippboard');
							}
						dataconsole.val('');
						return true;
				    } 
				 } catch (err) {
				    console.log('Oops, unable to copy');
					return false;
				 }
}

function codeData(data, key) {
	// this functions encode the data with given key
	return CryptoJS.AES.encrypt(data, key).toString();
}

function decodeData(data, key) {
	// this function decode the datastring back with given key
	return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
}

function dataToServer(server, dataSrc, uid) {
	// This function is about code the data and sent it to server.
    
	let key = prompt('Please enter data coding key.\nYou MUST remember this key!\nWithout it you cannot get the data back!', 'secretkey');


	if (key){
		dataSrc = codeData(dataSrc, key);

	    let data = new FormData();
	    let xhr = new XMLHttpRequest();

	    data.append("data", dataSrc);
	    data.append("uid", uid);
	    
	    xhr.open('post', server, true);
	    xhr.send(data);

	    // prepare the message with the sharing data
	    let link = window.location.href + '?spp=' + uid;
	    let message = 'You can share the project:\n link: '+link+'\n key: '+ key; 

	    copy(message, false);

	    xhr.onreadystatechange = function() {
  		
  		console.log('xhr.readyState= ', xhr.readyState);
  		console.log('xhr.status= ', xhr.status);

  		if (xhr.readyState === 4 && xhr.status === 200) {
    		
    				console.log('successful');
         			
				    alert(message);
				    
      		}
      		
      			
  		if (xhr.readyState === 4 && xhr.status === 0) {
	       			console.log('failed');
				    alert('Warning!\nCreating share repository was not possible!');
			}

		};

	    } else {
		alert('You need to provide a key vaule!');
	}

  }


function dataFromServer(target, uid) {

 	target = target + '?uid=' + uid;

    $.get(target, (data) => {
    	// processing the data delivered by API via GET
      	if (data != 'false') {
      		// if we recived anything
      		console.log('Will work on the data');

      		// asking for decoding key
      		let key = prompt('Please enter data coding key for this link.', 'secretkey');
      		let decoded = false; // here we asuume it fail

      		try {
	      		decoded  = decodeData(data, key);

      		} catch (err) {
      			console.log('Error decoding data');
      		}

      		if(decoded){ // if we doecoded ok
      			// getting back the data as object
      			decoded = JSON.parse(decoded); 
	      		
	      		if(decoded.tasks){
	      			tasks = decoded.tasks; // getting back tasks

	      			if(decoded.markedFW){
	      			markedFW = decoded.markedFW; // getting back marked weeks
		      		}
		      		
		      		mapView();
		      		redrawAll();

	      		} else {
	      			console.log('no propper data!');
	      		}



      		} else {
      			console.log('Decoding error, may be wrong key!');
      			alert('Decoding error, \n may be wrong key!');
      		}

      	} else {
      		alert('No data available under this link');
      		console.log('No data available');
      	}
    });
 }


function echoApi(api) {
	// this function is about to just call api and console log the response
	$.get(api, (data) => {
		console.log(data);
    });
}
