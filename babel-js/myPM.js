'use strict';

// The myPM library for Task Management tool
// by TymancjO - started 24-01-2018

function redrawAll() {
    // this just update all views etc.

    if (tasks.length > 0) {
        updateTasks();
    }

    creategantt();
    if (isMapView) {
        mapView();
    }
}

function download(filename, text) {
    // after https://jsfiddle.net/rce6nn3z/
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function higlightTaskDiv(position) {
    var aClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "selected-div";

    // this function add a highlight class to a div of task
    // lets generate the divs id names

    var mapDiv = "#map-" + position;
    var mainDiv = "#main-" + position;

    $(mapDiv).addClass(aClass);
    $(mainDiv).addClass(aClass);
}

function clearHiglight() {
    var aClass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "selected-div";

    // this function clears up all divs highlights

    $(".mapView-task").removeClass(aClass);
    $(".mapView-milestone").removeClass(aClass);
    $(".gant-bar").removeClass(aClass);
}

function showTaskDetail(taskId) {
    console.log('to be edited: ', taskId);
    // gathering some data for edit window :)
    var task = tasks[taskId];
    clearHiglight();
    higlightTaskDiv(taskId); // higlighting the edited task

    $('input[name="taskName"]').val(task.nazwa);
    $('input[name="taskOwner"]').val(task.kto);
    $('input[name="taskStart"]').val(moment(task.start).format('YYYY-MM-DD'));
    $('input[name="taskDuration"]').val(task.trwa / (1000 * 60 * 60 * 24 * 7));
    $('input[name="taskTimeline"]').val(task.timeline);
    $('input[name="taskDone"]').val(task.complete);

    $('#task-edit-apply').attr('targetId', taskId);
    $('#task-edit-delete').attr('targetId', taskId);

    //and here the moving buttons preaprations
    //btn-wrapper-space
    var preBtn = void 0;
    var t = taskId;
    if (t > 0) {
        preBtn = '<div class="btn-wrapper">\n              <button class="btn-shift" onClick="shiftTask(' + t + ',-1)"><</button>\n              <button class="btn-shift" onClick="shiftTask(' + t + ',1)">></button>\n              <button class="btn-shift" onClick="linkTask(' + t + ')">!</button>\n              <button class="btn-shift" onClick="breakTask(' + t + ')">#</button>\n              <button class="btn-shift" onClick="extendTask(' + t + ',-1)"> - </button>\n              <button class="btn-shift" onClick="extendTask(' + t + ',1)"> + </button>\n              </div>';
    } else {
        preBtn = '<div class="btn-wrapper">\n              <button class="btn-shift" onClick="shiftTask(' + t + ',-1)"> < </button>\n              <button class="btn-shift" onClick="shiftTask(' + t + ',1)"> > </button>\n              <button class="btn-shift" onClick=""></button>\n              <button class="btn-shift" onClick=""></button>\n              <button class="btn-shift" onClick="extendTask(' + t + ',-1)"> - </button>\n              <button class="btn-shift" onClick="extendTask(' + t + ',1)"> + </button>\n              </div>';
    }
    // adding buttons to its place in modal window
    $('#btn-wrapper-space').html(preBtn);

    // and show the dialog modal window
    $('#taskInfo').removeClass('is-hidden');
    isEdit = true;
}

function updateSingleTask(taskId) {
    tasks[taskId].nazwa = $('input[name="taskName"]').val();
    tasks[taskId].kto = $('input[name="taskOwner"]').val();
    tasks[taskId].start = moment($('input[name="taskStart"]').val()).valueOf();
    tasks[taskId].trwa = parseInt($('input[name="taskDuration"]').val()) * (1000 * 60 * 60 * 24 * 7);
    tasks[taskId].timeline = $('input[name="taskTimeline"]').val();
    tasks[taskId].complete = parseFloat($('input[name="taskDone"]').val());

    $('#task-edit-apply').attr('targetId', 'none');

    $('#taskInfo').addClass('is-hidden');
    isEdit = false;

    updateTasks();
    creategantt();
    if (isMapView) {
        mapView();
    }
}

function deleteSingleTask(taskId) {
    tasks.splice(taskId, 1);
    updateTasks();
    creategantt();
    if (isMapView) {
        mapView();
    }
}

function askYesNo(attribs) {
    $('#confirm-yes').attr('functionParams', attribs);
    $('#confirm-box').removeClass('is-hidden');
}

function readCsvDataToTasks() {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }

    var input = $('#files')[0];

    if (!input.files) {
        alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
    } else {
        var file = input.files[0];
        // console.log(file);

        var fr = new FileReader();

        fr.onload = function () {
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

function insertClippoard(position) {
    var srcArr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : clippoard;

    // this function insert tasks form source into given posioton in tasks
    position = parseInt(position);

    if (clippoard.length > 0) {
        tasks.splice.apply(tasks, [position, 0].concat(srcArr));
        return true;
    } else {
        srcArr = [];
        return false;
    }
}

function grabTask(position) {
    var followers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var delSrc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var target = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : clippoard;

    // this function takes the task from tasks and put them into the clippoard target 
    // followers - if true it will take all dependend follow tasks
    // delSrc - if true it will delete the task from main task array after grab

    console.log('index: ', position);

    position = parseInt(position);

    // clippoard = []; // cleaning the clippboard 

    var totalAffected = 1; // the number of tasks we will grab

    var grabbed = Object.assign({}, tasks[position]); // grabbing the first task as clone object
    grabbed.follow = false; // making the task not a fllower - to paste in position.

    target.push(grabbed);

    for (var t = position + 1; t < tasks.length; t++) {
        console.log(t);

        if (followers && tasks[t].follow) {
            console.log('grab 01');
            totalAffected++;
            target.push(Object.assign({}, tasks[t])); // grabbing as object clone 
        } else if (tasks[t].follow) {
            console.log('grab 02');
            tasks[t].follow = false; // making the below task fixed to date 
            break;
        } else {
            console.log('grab 03');
            break;
        } // end of if's
    } // end of loop

    // and now we can delete from source
    if (delSrc) {
        tasks.splice(position, totalAffected);
    }
}

function insertTask(position) {
    var newName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'New Added Task';

    // we will define the time of the task based on mouse position on clicking
    // but rounded to the week - as this is the main time unit here
    var weeksize = skala * (7 * 24);
    var mouseRelativeX = weeksize * Math.round((mouseX - gant.offset().left) / gantzoom / weeksize);
    var newTaskStartTime = minTime + mouseRelativeX * (1000 * 60 * 60) / skala;

    // console.log('insert at: ', position);
    // console.log('mouse time at: ', moment(newTaskStartTime).format('DD-MM-YYYY'));

    // now we can create a new proto task
    var zadanie = {
        nazwa: newName,
        start: newTaskStartTime,
        trwa: 1 * 7 * 24 * 60 * 60 * 1000, // 1 week in ms
        kto: 'none',
        timeline: 0,
        follow: false,
        complete: 0
    };

    tasks.splice(position, 0, zadanie);
    updateTasks();
    creategantt();

    if (isEdit) {
        showTaskDetail(position);
    }
}

function shiftTask(task, shift) {
    // console.log(task, shift);
    tasks[task].start += shift * 7 * 24 * 60 * 60 * 1000;
    updateTasks();
    creategantt();
    if (isMapView) {
        mapView();
    }
    if (isEdit) {
        showTaskDetail(task);
    }
}

function extendTask(task, shift) {
    // console.log(task, shift);
    tasks[task].trwa += shift * 7 * 24 * 60 * 60 * 1000;
    if (tasks[task].trwa < 0) {
        tasks[task].trwa = 0;
    }
    updateTasks();
    creategantt();
    if (isMapView) {
        mapView();
    }
    if (isEdit) {
        showTaskDetail(task);
    }
}

function breakTask(task) {
    if (tasks[task].follow) {
        tasks[task].follow = false;
    }
    updateTasks();
    creategantt();
    if (isMapView) {
        mapView();
    }
    if (isEdit) {
        showTaskDetail(task);
    }
}

function linkTask(task) {
    if (task > 0 && !tasks[task].follow) {
        tasks[task].follow = true;
    }
    updateTasks();
    creategantt();
    if (isMapView) {
        mapView();
    }
    if (isEdit) {
        showTaskDetail(task);
    }
}

function updateTasks() {
    maxTime = 0;
    minTime = tasks[0].start;
    for (var t = 0; t < tasks.length; t++) {
        if (t > 0 && tasks[t].follow) {
            tasks[t].start = tasks[t - 1].start + tasks[t - 1].trwa;
        }
        if (tasks[t].start <= minTime) {
            var currentTaskStart = tasks[t].start;
            var currentTaskDay = moment(currentTaskStart).day();
            // console.log('the day is: ',currentTaskDay);

            minTime = currentTaskStart - (currentTaskDay - 1) * 24 * 60 * 60 * 1000; // to start grids on mondays
        }

        var trwanie = tasks[t].trwa;
        if (trwanie === 0) {
            trwanie = 2 * 24 * 60 * 60 * 1000;
        }

        if (tasks[t].start + trwanie > maxTime) {
            maxTime = tasks[t].start + trwanie;
        }
    }
}

function returnTasks() {
    var outputStr = '';
    for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        var follower = '';
        if (t.follow) {
            follower = 'y';
        }

        outputStr += t.timeline + ' \t ' + t.kto + ' \t ' + t.nazwa + ' \t ' + follower + ' \t ' + moment(t.start).format('YYYY-MM-DD') + ' \t ' + Math.round(t.trwa / (1000 * 60 * 60 * 24 * 7)) + ' \t ' + t.complete + ' \n';
    }

    dataconsole.val('');
    dataconsole.val(outputStr);
}

function tasksToCsv() {

    var outputStr = '';

    for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        var follower = '';
        if (t.follow) {
            follower = 'y';
        }

        outputStr += t.timeline + ', ' + t.kto + ', ' + t.nazwa + ', ' + follower + ', ' + moment(t.start).format('YYYY-MM-DD') + ', ' + Math.round(t.trwa / (1000 * 60 * 60 * 24 * 7)) + ', ' + t.complete + ' \n';
    }

    return outputStr;
}