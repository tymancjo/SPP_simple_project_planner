// This is the display functions set fro myPM in JS

function mapView() {
  //some assumed values
  let padding = 10;
  // out target div to put the map view in it
  let targetDiv = $('#mapGantArea');
  let gridDiv = $('#mapGantGrid');
  // targetDiv = $('#mapViewDiv');
  // available space in global view
  let spaceX = parseInt(targetDiv.css('width')) - 2 * padding;
  let spaceY = parseInt(targetDiv.css('height')) - 2 * padding;

  //figuring out x scale
  let px_per_ms = spaceX / (maxTime - minTime);
  let pp_per_ms = (95 / (maxTime - minTime));
  let pp_per_week = Math.round(95 / ((maxTime - minTime)/(1000 * 60*60*24*7)));

  //figuring out Y scale
  let px_per_task = spaceY / tasks.length;
  let pp_per_task = 100 / tasks.length;

  //lets now generate the graph for the tasks.
  let ganthtml = '';
  let t = 0;
  for (task of tasks) {
    let left = Math.round((task.start - minTime) / (1000*60*60*24)) * (pp_per_week / 7) + "%";
    let height = (0.8 * pp_per_task) + "%";
    let margin = (0.05 * pp_per_task) + "%";
    let box_style = 'mapView-task';

    let width = Math.round(Math.floor(task.trwa / (1000*60*60*24*7)) * pp_per_week) + "%";
    if (task.trwa === 0) {
      width = (1.7 * 24 * 60 * 60 * 1000) * pp_per_ms + "%";
      box_style = 'mapView-milestone';

    }

    // let left = Math.round((task.start - minTime) * px_per_ms) + "px";
    // let width = Math.round(task.trwa * px_per_ms) + "px";
    // let height = px_per_task + "px";

    ganthtml += `<div style="left: ${left}; width: ${width}; height: ${height}; margin-bottom: ${margin};" TaskIndex="${t}" class="${box_style}"></div>`
    t++;
  }
  targetDiv.html(ganthtml);

  // Now lets work over the FiscalWeek grid system
  // we know from above the size of single week mark
  width = Math.round((7 * 24 * 60 * 60 * 1000) * pp_per_ms) + "%";
  // now we figure out how many weeks we need to draw
  let w = Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7));

  // lets now draw the grid by divs
  ganthtml = '';
  for (let i = 0; i < w; i++) {
      let thegridtime = minTime + i * (7*24*60*60*1000);
      let fweek = moment(thegridtime).week();
      ganthtml += `<div class="map-gant-grid-col" style="width: ${width};">
                  FW${fweek}</div>`;
  }

  gridDiv.html(ganthtml);


  // lets make the main div visible and page hidden
  $('#mapViewDiv').removeClass('is-hidden');
  $('#mapViewX').removeClass('is-hidden');
  $('.page').addClass('is-hidden');
  $('.console').addClass('is-hidden');
}

function normalView() {
  $('#mapViewX').addClass('is-hidden');
  $('#mapViewDiv').addClass('is-hidden');
  $('.page').removeClass('is-hidden');
  $('.console').removeClass('is-hidden');
  $('.console').addClass('is-closed');
}
