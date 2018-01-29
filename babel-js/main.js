'use strict';

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

$(document).ready(function () {

    // binding mousemove actions
    $(document).mousemove(function (evt) {
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
        updateModal(mouseX + 20, mouseY + 20, hooveredtask);
    });

    // Binding to change actions
    $('#files').change(function () {
        resetData();
        readCsvDataToTasks();
        $('.console').toggleClass('is-closed');
    });

    // Button bindings to actions
    gant.click(function () {
        if (hooveredtask) {
            showTaskDetail(hooveredtaskId);
        }

        if (!tasks.length && mouseX > gant.offset().left) {
            insertTask(0);
        }
    });

    $('#mapGantArea').click(function () {
        if (hooveredtask) {
            showTaskDetail(hooveredtaskId);
        }
    });

    $('.console-button').click(function () {
        $('.console').toggleClass('is-closed');
        // $('.console-button').toggleClass('rotated');
    });

    $('#consolebar').click(function () {
        $('.console').toggleClass('is-closed');
        // $('.console-button').toggleClass('rotated');
    });

    $('#analyzedata').click(function () {
        analyzedata();
        if (tasks.length) {
            updateTasks();
            creategantt();
        }

        $('.console').addClass('is-closed');
        $('.console-button').removeClass('rotated');
    });

    $('#retrivedata').click(function () {
        returnTasks();
        // creategantt();
        // $('.console').addClass('is-closed');
        // $('.console-button').removeClass('rotated');
    });

    $('#resetdata').click(function () {
        resetData();
        $('.console').toggleClass('is-closed');
    });

    $('#savedata').click(function () {
        download("SPP-data.csv", tasksToCsv());
        $('.console').toggleClass('is-closed');
    });

    $('#creategantt').click(creategantt);

    $('#zoomout').click(zoomout);
    $('#zoomin').click(zoomin);

    $('#scaleup').click(function () {
        skala *= 1.2;
        creategantt();
    });

    $('#scaledown').click(function () {
        skala /= 1.2;
        if (skala < 0.25) {
            skala = 0.25;
        }
        creategantt();
    });

    $('#mapview').click(function () {
        mapView();
    });

    $('#mapview_small_txt').click(function () {
        mapView(false, 1);
    });

    $('#closemap').click(normalView);

    $('#task-edit-cancel').click(function () {
        $('#taskInfo').addClass('is-hidden');
        isEdit = false;
    });
    $('#task-edit-cancel2').click(function () {
        $('#taskInfo').addClass('is-hidden');
        isEdit = false;
    });

    $('#task-edit-apply').click(function () {
        var taskId = $('#task-edit-apply').attr('targetId');
        updateSingleTask(taskId);
    });

    $('#task-edit-delete').click(function () {
        var taskId = $('#task-edit-delete').attr('targetId');
        askYesNo(taskId);

        // deleteSingleTask(taskId);
        $('#taskInfo').addClass('is-hidden');
        isEdit = false;
    });

    $('#confirm-yes').click(function () {
        var execAttr = $('#confirm-yes').attr('functionParams');
        deleteSingleTask(execAttr);
        $('#confirm-box').addClass('is-hidden');
    });

    $('#confirm-no').click(function () {
        $('#confirm-box').addClass('is-hidden');
    });
});

function resetData() {
    console.log('RESET');
    tasks = [];
    minTime = Number(moment(moment().format('YYYY-MM-DD')) - (moment().day() - 1) * 24 * 60 * 60 * 1000);
    maxTime = minTime;
    gant.html('');
    creategantt();
}

function updateModal(x, y) {
    var task = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    // lest instert the text
    if (task) {
        // console.log('having task');
        $('#mouseModal').css('padding', '10px');

        $('#modal-name').html('<h2>' + task.nazwa + '</h2>');
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
    var modalW = parseInt($('#mouseModal').css('width'));
    var modalH = parseInt($('#mouseModal').css('height'));

    var docW = parseInt($(document).width());
    var docH = parseInt($(document).height());

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
    if (gantzoom < 0.1) {
        gantzoom = 0.1;
    }
    // console.log(gantzoom);

    gant.css('transform', 'scale(' + gantzoom + ')');
}

function zoomin() {
    gantzoom = 1;
    if (gantzoom > 2) {
        gantzoom = 2;
    }
    // console.log(gantzoom);

    gant.css('transform', 'scale(' + gantzoom + ')');
}

function creategantt() {

    var htmlis = '<div class="gant-grid"></div><div class="gant-all-bars">';

    for (var t = 0; t < tasks.length; t++) {
        // task = tasks[t];
        var currrentstyle = '';

        var preBtn = void 0;

        if (t === 0) {
            htmlis += '<div class="gant-bar-tools">\n                <button class="add-task-btn"\n                onClick="insertTask(' + t + ')">\n                ...</button></div>';
        } else {
            // htmlis += `<div class="gant-bar-tools">`;
        }

        if (!tasks[t].start) {
            tasks[t].start = tasks[t - 1].start + tasks[t - 1].trwa;
        }

        currrentstyle += 'margin-left: ' + skala * (tasks[t].start - minTime) / (1000 * 60 * 60) + 'px; ';
        var fontsize = 12;

        if (tasks[t].trwa) {
            var szerokosc = skala * tasks[t].trwa / (1000 * 60 * 60);
            fontsize = szerokosc / 10;
            currrentstyle += 'width: ' + szerokosc + 'px; ';
        } else {
            currrentstyle += 'width: ' + skala * 100 + 'px; background-color: red; ';
            fontsize = skala * 10;
        }
        // console.log('tasksize: ', skala * (tasks[t].trwa) / (1000 * 60 * 60));

        fontsize = Math.max(5, Math.min(fontsize, 16));

        if (tasks[t].follow) {
            preBtn = '<div class="btn-wrapper">\n                    <button class="btn-shift"        onClick="breakTask(' + t + ')">#\n                    </button></div>';
        } else if (t > 0) {
            preBtn = '<div class="btn-wrapper"><button class="btn-shift"\n        onClick="shiftTask(' + t + ',-1)"> < </button>\n        <button class="btn-shift" onClick="shiftTask(' + t + ',1)"> > </button><button class="btn-shift"        onClick="linkTask(' + t + ')">!\n        </button></div>';
        } else {
            preBtn = '<div class="btn-wrapper"><button class="btn-shift"\n        onClick="shiftTask(' + t + ',-1)"> < </button>\n        <button class="btn-shift" onClick="shiftTask(' + t + ',1)"> > </button></div>';
        }

        htmlis += '<div class="gant-bar" style="' + currrentstyle + '" TaskIndex="' + t + '">' + preBtn + '\n              <h3 style="font-size: ' + fontsize + 'px;">' + tasks[t].nazwa + '</h3>\n              <div class="btn-wrapper">\n              <button class="btn-shift" onClick="extendTask(' + t + ',-1)"> - </button>\n              <button class="btn-shift" onClick="extendTask(' + t + ',1)"> + </button>\n              </div>\n              </div>\n              ';

        htmlis += '<div class="gant-bar-tools">\n              <button class="add-task-btn"\n              onClick="insertTask(' + (t + 1) + ')">\n              ...</button></div>';
    }

    htmlis += '</div>';
    gant.html('');
    gant.html(htmlis);

    var gantwidth = parseInt($('.gant-all-bars').css('width'));
    var weeksize = skala * (7 * 24); // week in hours
    // // console.log('weeksize: ', weeksize);
    var gridcols = Math.round(gantwidth / weeksize);
    // // console.log(gridcols);

    var gridcolumn = '';
    var thisWeek = Number(moment() - (moment().day() - 1) * 24 * 60 * 60 * 1000);

    for (var w = 0; w <= gridcols; w++) {
        var thegridtime = minTime + w * (7 * 24 * 60 * 60 * 1000);
        var extraStyle = '';
        if (thegridtime <= thisWeek) {
            extraStyle = 'current-week';
        }

        var thedate = moment(thegridtime).format('DD-MM-YYYY');
        var datetext = '<span class="griddate">' + thedate + "</span>";

        var fweek = moment(thegridtime).week();

        datetext += '  FW' + fweek;

        gridcolumn += '<div class="grid-column ' + extraStyle + '" style="width: ' + weeksize + 'px;">' + datetext + '</div>';
    }

    $('#gantarea').css('height', 1.25 * parseInt($('.gant-all-bars').css('height')));
    // $('.gant-grid').css('height', 1.25 * parseInt($('.gant-all-bars').css('height')));
    $('.gant-grid').html(gridcolumn);
    // // console.log(gridcolumn);

}

function analyzedata() {
    var separator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '\t';

    var inputData = dataconsole.val().split('\n');

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = inputData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var line = _step.value;

            var task = line.split(separator);

            console.log(task);

            if (task.length === 1) {
                task = line.split(',');
                console.log('trying ,');
                console.log(task);
            }

            if (task.length === 1) {
                task = line.split(';');
                console.log('trying ;');
                console.log(task);
            }

            console.log(task.length);

            if (task.length > 1 && task[2]) {
                // let startDate = Number(Date.parse(task[4]));
                var startDate = moment(moment(task[4]).format('YYYY-MM-DD')).valueOf();
                var trwanie = Number(task[5] * 7 * 24 * 60 * 60 * 1000);
                var follow = void 0;

                if ($.trim(task[3]) === 'y') {
                    follow = true;
                } else {
                    follow = false;
                }

                var zadanie = {
                    nazwa: $.trim(task[2]),
                    start: startDate,
                    trwa: trwanie,
                    kto: $.trim(task[1]),
                    timeline: parseInt(task[0]),
                    follow: follow,
                    complete: parseFloat(task[6])
                };

                if (trwanie === 0) {
                    trwanie = 2 * 24 * 60 * 60 * 1000;
                }

                if (zadanie.start && zadanie.start < minTime || minTime === 0) {
                    minTime = zadanie.start;
                }
                if (zadanie.start && zadanie.start + trwanie > maxTime) {
                    maxTime = zadanie.start + trwanie;
                }

                tasks.push(zadanie);
                // console.log(zadanie.nazwa);
            }
        }
        //updateTasks();
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}