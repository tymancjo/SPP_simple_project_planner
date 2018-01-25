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

var minTime = Number(moment() - (moment().day()-1)* 24 *60 *60 *1000);


$(document).ready(()=>{

// binding mousemove actions
$('body').mousemove(function(evt){
    if ($(evt.target).attr('TaskIndex')) {
      hooveredtaskId = $(evt.target).attr('TaskIndex');
      hooveredtask = tasks[$(evt.target).attr('TaskIndex')];
    } else if ($(evt.target).parent().attr('TaskIndex') ){
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
  $('#files').change(()=>{
    resetData();
    readCsvDataToTasks();
    $('.console').toggleClass('is-closed');
  });

// Button bindings to actions
  $(document).click(()=>{
    if (hooveredtask) {
        showTaskDetail(hooveredtaskId);
    }

    if (!tasks.length){
      insertTask(0);
    }
  });


  $('.console-button').click(()=>{
    $('.console').toggleClass('is-closed');
    // $('.console-button').toggleClass('rotated');
  });

  $('#consolebar').click(()=>{
    $('.console').toggleClass('is-closed');
    // $('.console-button').toggleClass('rotated');
  });

  // $('.btn-shift').on('click', (e)=>{
  //   event.stopPropagation();
  //   event.stopImmediatePropagation();
  //   // console.log(e);
  //   // console.log('ojeju');
  // });

  $('#analyzedata').click(()=>{
    analyzedata();
    if(tasks.length){
      creategantt();
    }

    $('.console').addClass('is-closed');
    $('.console-button').removeClass('rotated');
  });



  $('#retrivedata').click(()=>{
    returnTasks();
    // creategantt();
    // $('.console').addClass('is-closed');
    // $('.console-button').removeClass('rotated');
  });

  $('#resetdata').click(()=>{
    resetData();
    $('.console').toggleClass('is-closed');
  });

  $('#savedata').click(()=>{
    download("SPP-data.csv", tasksToCsv());
    $('.console').toggleClass('is-closed');
  });

  $('#creategantt').click(creategantt);

  $('#zoomout').click(zoomout);
  $('#zoomin').click(zoomin);

  $('#scaleup').click(()=>{
    skala *= 1.2;
    creategantt();
  });

  $('#scaledown').click(()=>{
    skala /= 1.2;
    if (skala < 0.25) {
      skala = 0.25;
    }
    creategantt();
  });

 $('#task-edit-cancel').click(()=>{
   $('#taskInfo').addClass('is-hidden');
 });

 $('#task-edit-apply').click(()=>{
    let taskId = $('#task-edit-apply').attr('targetId');
    updateSingleTask(taskId);
 });

 $('#task-edit-delete').click(()=>{
    let taskId = $('#task-edit-delete').attr('targetId');
    askYesNo(taskId);

    // deleteSingleTask(taskId);
    $('#taskInfo').addClass('is-hidden');
 });

 $('#confirm-yes').click(()=>{
   let execAttr = $('#confirm-yes').attr('functionParams');
   deleteSingleTask(execAttr);
   $('#confirm-box').addClass('is-hidden');
 });

 $('#confirm-no').click(()=>{
   $('#confirm-box').addClass('is-hidden');
 });



});

function resetData(){
  console.log('RESET');
  tasks = [];
  minTime = Number(moment() - (moment().day()-1)* 24 *60 *60 *1000);
  gant.html('');
  creategantt();
}

function updateModal(x,y, task = null){
  // lest instert the text
  if(task){
    // console.log('having task');
    $('#modal-name').html('<h2>'+task.nazwa+'</h2>');
    $('#modal-owner').html('<h2>'+task.kto+'</h2>');
    $('#modal-start').text('From: ' + moment(task.start).format('DD-MM-YYYY'));
    $('#modal-end').text('To: ' + moment(task.start+task.trwa).format('DD-MM-YYYY'));
    $('#modal-duration').text('Duration: ' + (moment(task.trwa).weeks() - 1) + 'wk');
  } else {
    // console.log('no task');
    $('#modal-name').text('');
    $('#modal-owner').html('');
    $('#modal-start').text('');
    $('#modal-end').text('');
    $('#modal-duration').text('');
  }

  // now lets check the modal size
  modalW = parseInt($('#mouseModal').css('width'));
  modalH = parseInt($('#mouseModal').css('height'));

  docW = parseInt($(document).width());
  docH = parseInt($(document).height());

  // taking care to not go out of page in x
  if (x + modalW > docW ) {
    x = x - modalW - 10;
  }
  // taking care to not go out of page in y
  if (y + modalH > docH ) {
    y = y - modalH - 10;
  }

  $('#mouseModal').css('left', x + 'px');
  $('#mouseModal').css('top', y + 'px');


}

function zoomout(){
  gantzoom *= 0.8;
  if (gantzoom < 0.1) {gantzoom = 0.1;}
  // console.log(gantzoom);

  gant.css('transform', 'scale('+gantzoom+')');
}

function zoomin(){
  gantzoom = 1;
  if (gantzoom > 2) {gantzoom = 2;}
  // console.log(gantzoom);

  gant.css('transform', 'scale('+gantzoom+')');

}

function creategantt() {

  let htmlis = '<div class="gant-grid"></div><div class="gant-all-bars">';

  for (let t=0; t < tasks.length; t++){
    // task = tasks[t];
    let currrentstyle = '';

    let preBtn;

    if( t === 0){
      htmlis += `<div class="gant-bar-tools">
                <button class="add-task-btn"
                onClick="insertTask(${t})">
                ...</button></div>`;
    } else {
      // htmlis += `<div class="gant-bar-tools">`;
    }


    if (!tasks[t].start){
      tasks[t].start = tasks[t-1].start + tasks[t-1].trwa;
    }

    currrentstyle += 'margin-left: ' + skala * (tasks[t].start - minTime) / (1000 * 60 * 60) + 'px; ';
    let fontsize = 12;

    if(tasks[t].trwa){
      let szerokosc = skala * (tasks[t].trwa) / (1000 * 60 * 60);
      fontsize = szerokosc / 10;
      currrentstyle += 'width: ' + szerokosc + 'px; ';
    } else {
      currrentstyle += 'width: ' + skala * 100 +'px; background-color: red; ';
      fontsize = skala * 10
    }
    // console.log('tasksize: ', skala * (tasks[t].trwa) / (1000 * 60 * 60));

    fontsize = Math.max(5, Math.min(fontsize, 16));

      if (tasks[t].follow){
          preBtn = `<div class="btn-wrapper">
                    <button class="btn-shift"        onClick="breakTask(${t})">#
                    </button></div>`;
      } else if (t > 0) {
        preBtn = `<div class="btn-wrapper"><button class="btn-shift"
        onClick="shiftTask(${t},-1)"> < </button>
        <button class="btn-shift" onClick="shiftTask(${t},1)"> > </button><button class="btn-shift"        onClick="linkTask(${t})">!
        </button></div>`
      } else {
        preBtn = `<div class="btn-wrapper"><button class="btn-shift"
        onClick="shiftTask(${t},-1)"> < </button>
        <button class="btn-shift" onClick="shiftTask(${t},1)"> > </button></div>`
      }




    htmlis += `<div class="gant-bar" style="${currrentstyle}" TaskIndex="${t}">${preBtn}
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
  let thisWeek =  Number(moment() - (moment().day()-1)* 24 *60 *60 *1000);

    for(let w=0; w <= gridcols; w++) {
      thegridtime = minTime + w * (7*24*60*60*1000);
      let extraStyle = '';
      if (thegridtime <= thisWeek){
        extraStyle = 'current-week';
      }

      thedate = new Date(thegridtime);
      datetext = '<span class="griddate">' + thedate.getDate().toString().padStart(2, "0") + '-' + (thedate.getMonth()+1).toString().padStart(2, "0") + '-' + thedate.getFullYear() + "</span>";

      let fweek = moment(thedate).week();

      datetext += '  FW' + fweek;

      gridcolumn += `<div class="grid-column ${extraStyle}" style="width: ${weeksize}px;">${datetext}</div>`;
    }

  $('#gantarea').css('height', 1.25 * parseInt($('.gant-all-bars').css('height')));
  // $('.gant-grid').css('height', 1.25 * parseInt($('.gant-all-bars').css('height')));
  $('.gant-grid').html(gridcolumn);
  // // console.log(gridcolumn);



}

function analyzedata(separator = '\t') {
  let inputData = dataconsole.val().split('\n');

  for (line of inputData){
    let task = line.split(separator);

    console.log(task);

    if (task.length === 1){
      task = line.split(',');
      console.log('trying ,');
      console.log(task);
    }

    if (task.length === 1){
      task = line.split(';');
      console.log('trying ;');
      console.log(task);
    }

    console.log((task.length));

    if (task.length > 1 && task[2]) {
      // let startDate = Number(Date.parse(task[4]));
      let startDate = Number(moment(task[4]));
      let trwanie = Number(task[5] * 7 * 24 * 60 * 60 * 1000);

      if ($.trim(task[3]) === 'y'){
        follow = true;
      } else {
        follow = false;
      }


      let zadanie = {
        nazwa: $.trim(task[2]),
        start: startDate,
        trwa: trwanie,
        kto: $.trim(task[1]),
        timeline: parseInt(task[0]),
        follow: follow,
        complete: parseFloat(task[6]),
      };

      if ((zadanie.start && zadanie.start < minTime) || minTime === 0) {minTime = zadanie.start}

      tasks.push(zadanie);
      // console.log(zadanie.nazwa);
    }
  }
  //updateTasks();
}
