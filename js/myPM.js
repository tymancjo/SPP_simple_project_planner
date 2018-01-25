// The myPM library for Task Management tool
// by TymancjO - started 24-01-2018

// after https://jsfiddle.net/rce6nn3z/
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


function readCsvDataToTasks(){
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('The File APIs are not fully supported in this browser.');
      return;
    }

  let input = $('#files')[0];

  if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");
    }
    else {
      file = input.files[0];
      // console.log(file);

      fr = new FileReader();

        fr.onload = function() {
            // console.log(fr.result);
            dataconsole.val('');
            dataconsole.val(fr.result);
            analyzedata(',');
            updateTasks();
            creategantt();

      };

      fr.readAsText(file);
    }

}


function shiftTask(task, shift){
  // console.log(task, shift);
  tasks[task].start += shift * 7 * 24 *60 *60 *1000;
  updateTasks();
  creategantt();
}

function extendTask(task, shift){
  // console.log(task, shift);
  tasks[task].trwa += shift * 7 * 24 *60 *60 *1000;
  if (tasks[task].trwa < 0 ) {
    tasks[task].trwa = 0;
  }
  updateTasks();
  creategantt();
}

function breakTask(task){
  if (tasks[task].follow){
    tasks[task]. follow = false;
  }
  updateTasks();
  creategantt();
}

function linkTask(task){
  if (task > 0 && !tasks[task].follow){
    tasks[task].follow = true;
  }
  updateTasks();
  creategantt();
}

function updateTasks(){
  minTime = tasks[0].start;
  for(let t=0; t < tasks.length; t++){
    if(t > 0 && tasks[t].follow){
      tasks[t].start = tasks[t-1].start + tasks[t-1].trwa
    }
    if(tasks[t].start < minTime) {
      let currentTaskStart = tasks[t].start;
      let currentTaskDay = moment(currentTaskStart).day();
      // console.log('the day is: ',currentTaskDay);

      minTime = currentTaskStart - (currentTaskDay - 1) * 24 *60 *60 *1000; // to start grids on mondays
    }
  }
}



function returnTasks(){
  let outputStr = '';
  for(let i=0; i < tasks.length; i++){
    t = tasks[i];
    let follower = '';
    if(t.follow){
      follower = 'y';
    }

    outputStr += `${t.timeline} \t ${t.kto} \t ${t.nazwa} \t ${follower} \t ${moment(t.start).format('YYYY-MM-DD')} \t ${Math.round(t.trwa/(1000*60*60*24*7))} \t ${t.complete} \n`;
  }

  dataconsole.val('');
  dataconsole.val(outputStr);
}

function tasksToCsv(){

  let outputStr = '';

  for(let i=0; i < tasks.length; i++){
    t = tasks[i];
    let follower = '';
    if(t.follow){
      follower = 'y';
    }

    outputStr += `${t.timeline}, ${t.kto}, ${t.nazwa}, ${follower}, ${moment(t.start).format('YYYY-MM-DD')}, ${Math.round(t.trwa/(1000*60*60*24*7))}, ${t.complete} \n`;
  }

  return outputStr;
}
