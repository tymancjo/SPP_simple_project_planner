// The main JS functions for PSS


var dataconsole = $('#console-text');
var gant = $('#gantarea');
var tasks = [];
var skala = 1;
var gantzoom = 1;
var mouseX = 0;
var mouseY = 0;
var hooveredtask;
var hooveredtaskId;
var currentConfirm;
var isMapView = false;
var isEdit = false;
var minTime = Number(moment(moment().format('YYYY-MM-DD')) - (moment().day() - 1) * 24 * 60 * 60 * 1000);
var maxTime = minTime;
var dragItem = null;
var isDragged = false;
var dX;
var dY;

// object to keep the mapView config
var mapViewConf = {
    fontSize: 14,
    textVisible: true,
    pixelHeight: false,
    minpx_per_task: 25,
    maxpx_per_task: 100,

};

// clippoard array for all copu/paste functionality
var clippoard = [];

// the array of market FW for grid markings (Maciek FR) 
var markedFW = [];


$(document).ready(() => {

    // binding mousemove actions
    $(document).mousemove(function(evt) {
        if ($(evt.target).attr('TaskIndex')) {
            hooveredtaskId = $(evt.target).attr('TaskIndex');
            hooveredtask = tasks[$(evt.target).attr('TaskIndex')];
        } else if ($(evt.target).parent().attr('TaskIndex')) {
            hooveredtaskId = $(evt.target).parent().attr('TaskIndex');
            hooveredtask = tasks[$(evt.target).parent().attr('TaskIndex')];
        } else {
            hooveredtaskId = false;
            hooveredtask = false;
        }
        mouseX = evt.pageX;
        mouseY = evt.pageY;
        updateModal(mouseX + 20, mouseY + 20, hooveredtask, hooveredtaskId);

        if (dragItem) {
            if (!isDragged) {
                dX = mouseX - parseInt($(dragItem).css('left'));
                dY = mouseY - parseInt($(dragItem).css('top'));
            }

            isDragged = true;
            $(dragItem).css('left', mouseX - dX + 'px');
            $(dragItem).css('top', mouseY - dY + 'px');
        }

    });

    $('#info-box-bar').mousedown(() => {
        dragItem = "#taskInfo";
    });

    $(document).mouseup(() => {
        dragItem = null;
        isDragged = false;
    });


    // Binding to change actions
    $('#files').change(() => {
        resetData();
        readCsvDataToTasks();
        $('.console').toggleClass('is-closed');
    });

    $('#masterFilter').on('keyup change input', mapView);

    // Binding to jquery-ui draggable

    // $('#taskInfo').draggable({
    //     handle: "h3"
    // });



    // Button bindings to actions
    gant.click(() => {
        if (hooveredtask) {
            showTaskDetail(hooveredtaskId);
        }

        if (!tasks.length && mouseX > gant.offset().left) {
            insertTask(0);
        }
    });

    $('#mapGantArea').click(() => {
        if (hooveredtask) {
            showTaskDetail(hooveredtaskId);
        }
    });



    $('.console-button').click(() => {
        $('.console').toggleClass('is-closed');
        // $('.console-button').toggleClass('rotated');
    });

    $('#consolebar').click(() => {
        $('.console').toggleClass('is-closed');
        // $('.console-button').toggleClass('rotated');
    });


    $('#analyzedata').click(() => {
        analyzedata();
        if (tasks.length) {
            updateTasks();
            creategantt();
        }

        $('.console').addClass('is-closed');
        $('.console-button').removeClass('rotated');
    });



    $('#retrivedata').click(() => {
        returnTasks();
        // creategantt();
        // $('.console').addClass('is-closed');
        // $('.console-button').removeClass('rotated');
    });

    $('#resetdata').click(() => {
        resetData();
        $('.console').toggleClass('is-closed');
    });

    $('#savedata').click(() => {
        download("SPP-data.csv", tasksToCsv());
        $('.console').toggleClass('is-closed');
    });

    $('#creategantt').click(creategantt);

    $('#zoomout').click(zoomout);
    $('#zoomin').click(zoomin);

    $('#scaleup').click(() => {
        skala *= 1.2;
        creategantt();
    });

    $('#scaledown').click(() => {
        skala /= 1.2;
        if (skala < 0.25) {
            skala = 0.25;
        }
        creategantt();
    });

    $('#mapview').click(() => {
        mapView();
    });

    $('#mapview_small_txt').click(() => {
        mapView(false, 1);
    });

    $('#closemap').click(normalView);

    $('#task-edit-cancel').click(() => {
        $('#taskInfo').addClass('is-hidden');
        isEdit = false;
        clearHiglight();
    });
    $('#task-edit-cancel2').click(() => {
        $('#taskInfo').addClass('is-hidden');
        isEdit = false;
        clearHiglight();
    });

    $('#task-edit-apply').click(() => {
        let taskId = $('#task-edit-apply').attr('targetId');
        updateSingleTask(taskId);
    });

    $('#task-edit-delete').click(() => {
        let taskId = $('#task-edit-delete').attr('targetId');
        askYesNo(taskId);

        // deleteSingleTask(taskId);
        $('#taskInfo').addClass('is-hidden');
        isEdit = false;
    });

    $('#confirm-yes').click(() => {
        let execAttr = $('#confirm-yes').attr('functionParams');
        deleteSingleTask(execAttr);
        $('#confirm-box').addClass('is-hidden');

    });

    $('#confirm-no').click(() => {
        $('#confirm-box').addClass('is-hidden');
    });

    // binding task copy/paste buttons
    $('#task-edit-copy-one').click(() => {
        let position = $('#task-edit-apply').attr('targetId');
        clippoard = [];
        grabTask(position, false, false);
        redrawAll();
    });

    $('#task-edit-copy-all').click(() => {
        let position = $('#task-edit-apply').attr('targetId');
        clippoard = [];
        grabTask(position, true, false);
        redrawAll();
    });

    $('#task-edit-cut-one').click(() => {
        let position = $('#task-edit-apply').attr('targetId');
        clippoard = [];
        grabTask(position, false, true);
        redrawAll();
    });

    $('#task-edit-cut-all').click(() => {
        let position = $('#task-edit-apply').attr('targetId');
        clippoard = [];
        grabTask(position, true, true);
        redrawAll();
    });

    $('#task-edit-paste-above').click(() => {
        let position = $('#task-edit-apply').attr('targetId');
        insertClippoard(position);
        clippoard = [];
        redrawAll();
    });

    $('#task-edit-paste-below').click(() => {
        let position = parseInt($('#task-edit-apply').attr('targetId'));
        insertClippoard(position + 1);
        clippoard = [];
        redrawAll();
    });


});

function resetData() {
    console.log('RESET');
    tasks = [];
    markedFW = [];
    minTime = Number(moment(moment().format('YYYY-MM-DD')) - (moment().day() - 1) * 24 * 60 * 60 * 1000);
    maxTime = minTime;
    gant.html('');

    creategantt();
}

function updateModal(x, y, task = null, taskId = null) {
    // lest instert the text
    if (task) {
        // console.log('having task');
        $('#mouseModal').css('padding', '10px');

        $('#modal-name').html('<h2>'+taskId+': ' + task.nazwa + '</h2>');
        $('#modal-owner').html('<h2>' + task.kto + '</h2>');
        $('#modal-start').text('From: ' + moment(task.start).format('DD-MM-YYYY'));
        $('#modal-end').text('To: ' + moment(task.start + task.trwa).format('DD-MM-YYYY'));
        $('#modal-duration').text('Duration: ' + (moment(task.trwa).weeks() - 1) + 'wk');
    } else {
        // console.log('no task');
        $('#modal-name').text('');
        $('#modal-owner').html('');
        $('#modal-start').text('');
        $('#modal-end').text('');
        $('#modal-duration').text('');
        $('#mouseModal').css('padding', '0');
    }

    // now lets check the modal size
    let modalW = parseInt($('#mouseModal').css('width'));
    let modalH = parseInt($('#mouseModal').css('height'));

    let docW = parseInt($(document).width());
    let docH = parseInt($(document).height());

    // taking care to not go out of page in x
    if (x + modalW > docW) {
        x = x - modalW - 10;
    }
    // taking care to not go out of page in y
    if (y + modalH > docH) {
        y = y - modalH - 10;
    }

    // console.log('mxy: ', x, y);

    $('#mouseModal').css('left', x + 'px');
    $('#mouseModal').css('top', y + 'px');


}

function zoomout() {
    gantzoom *= 0.8;
    if (gantzoom < 0.1) { gantzoom = 0.1; }
    // console.log(gantzoom);

    gant.css('transform', 'scale(' + gantzoom + ')');
}

function zoomin() {
    gantzoom = 1;
    if (gantzoom > 2) { gantzoom = 2; }
    // console.log(gantzoom);

    gant.css('transform', 'scale(' + gantzoom + ')');

}

function creategantt() {

    let htmlis = '<div class="gant-grid"></div><div class="gant-all-bars">';

    for (let t = 0; t < tasks.length; t++) {
        // task = tasks[t];
        let currrentstyle = '';

        let preBtn;

        if (t === 0) {
            htmlis += `<div class="gant-bar-tools">
                <button class="add-task-btn"
                onClick="insertTask(${t})">
                ...</button></div>`;
        } else {
            // htmlis += `<div class="gant-bar-tools">`;
        }


        if (!tasks[t].start) {
            tasks[t].start = tasks[t - 1].start + tasks[t - 1].trwa;
        }

        currrentstyle += 'margin-left: ' + skala * (tasks[t].start - minTime) / (1000 * 60 * 60) + 'px; ';
        let fontsize = 12;

        if (tasks[t].trwa) {
            let szerokosc = skala * (tasks[t].trwa) / (1000 * 60 * 60);
            fontsize = szerokosc / 10;
            currrentstyle += 'width: ' + szerokosc + 'px; ';
        } else {
            currrentstyle += 'width: ' + skala * 100 + 'px; background-color: red; ';
            fontsize = skala * 10;
        }
        // console.log('tasksize: ', skala * (tasks[t].trwa) / (1000 * 60 * 60));

        fontsize = Math.max(5, Math.min(fontsize, 16));

        if (tasks[t].follow) {
            preBtn = `<div class="btn-wrapper">
                    <button class="btn-shift" onClick="breakTask(${t})">#
                    </button></div>`;
        } else if (t > 0) {
            preBtn = `<div class="btn-wrapper"><button class="btn-shift"
                    onClick="shiftTask(${t},-1)"> < </button>
                    <button class="btn-shift" onClick="shiftTask(${t},1)"> > </button><button class="btn-shift" onClick="linkTask(${t})">!
                    </button></div>`;
        } else {
            preBtn = `<div class="btn-wrapper">
                    <button class="btn-shift" onClick="shiftTask(${t},-1)"> < </button>
                    <button class="btn-shift" onClick="shiftTask(${t},1)"> > </button></div>`;
        }


        let divId = "main-" + t;

        htmlis += `<div id="${divId}" class="gant-bar" style="${currrentstyle}" TaskIndex="${t}">${preBtn}
              <h3 style="font-size: ${fontsize}px;">${tasks[t].nazwa}</h3>
              <div class="btn-wrapper">
              <button class="btn-shift" onClick="extendTask(${t},-1)"> - </button>
              <button class="btn-shift" onClick="extendTask(${t},1)"> + </button>
              </div>
              </div>
              `;

        htmlis += `<div class="gant-bar-tools">
              <button class="add-task-btn"
              onClick="insertTask(${t+1})">
              ...</button></div>`;
    }


    htmlis += '</div>';
    gant.html('');
    gant.html(htmlis);


    let gantwidth = parseInt($('.gant-all-bars').css('width'));
    let weeksize = skala * (7 * 24); // week in hours
    // // console.log('weeksize: ', weeksize);
    let gridcols = Math.round(gantwidth / weeksize);
    // // console.log(gridcols);

    let gridcolumn = '';
    let thisWeek = Number(moment() - (moment().day() - 1) * 24 * 60 * 60 * 1000);

    for (let w = 0; w <= gridcols; w++) {
        let thegridtime = minTime + w * (7 * 24 * 60 * 60 * 1000);
        let extraStyle = '';
        if (thegridtime <= thisWeek) {
            extraStyle = 'current-week';
        }

        let thedate = moment(thegridtime).format('DD-MM-YYYY');
        let datetext = '<span class="griddate">' + thedate + "</span>";

        let fweek = moment(thegridtime).week();

        datetext += '  FW' + fweek;

        gridcolumn += `<div class="grid-column ${extraStyle}" style="width: ${weeksize}px;">${datetext}</div>`;
    }

    $('#gantarea').css('height', 1.25 * parseInt($('.gant-all-bars').css('height')));
    // $('.gant-grid').css('height', 1.25 * parseInt($('.gant-all-bars').css('height')));
    $('.gant-grid').html(gridcolumn);
    // // console.log(gridcolumn);

    // lets higlight selected if needed
    if (isEdit) {
        let position = parseInt($('#task-edit-apply').attr('targetId'));
        higlightTaskDiv(position);
    } else {
        clearHiglight();
    }



}

function analyzedata(separator = '\t') {
    let inputData = dataconsole.val().split('\n');

    for (let line of inputData) {
        let task = line.split(separator);

        // console.log(task);

        if (task.length === 1) {
            task = line.split(',');
            // console.log('trying ,');
            // console.log(task);
        }

        if (task.length === 1) {
            task = line.split(';');
            // console.log('trying ;');
            // console.log(task);
        }

        // console.log((task.length));

        if (task.length > 1 && task[2]) {
            if (task[2] !== '_fwx_') {
                // let startDate = Number(Date.parse(task[4]));

                let startDate = moment(task[4], ["DD-MM-YYYY", "YYYY-MM-DD"]).valueOf();

                console.log('data: ', startDate);

                let trwanie = Number(task[5] * 7 * 24 * 60 * 60 * 1000);
                let follow;

                if ($.trim(task[3]) === 'y') {
                    follow = true;
                } else {
                    follow = false;
                }





                let zadanie = {
                    nazwa: $.trim(task[2]),
                    start: startDate,
                    trwa: trwanie,
                    kto: $.trim(task[1]),
                    timeline: task[0] + '', // as string
                    follow: follow,
                    complete: parseFloat(task[6]),
                };

                if (trwanie === 0) {
                    trwanie = (2 * 24 * 60 * 60 * 1000);
                }

                if ((zadanie.start && zadanie.start < minTime) || minTime === 0) { minTime = zadanie.start; }
                if (zadanie.start && zadanie.start + trwanie > maxTime) { maxTime = zadanie.start + trwanie; }

                tasks.push(zadanie);
                // console.log(zadanie.nazwa);
            } else { // fwx takinc care
                markedFW = task[3].split('#');
            }
        }
    }
    //updateTasks();
}