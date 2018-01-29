
// This is the display functions set fro myPM in JS


function mapToggleText() {
  // this function shows or hide all text in mapView
  let textIn = $('.mapBar-in-text');
  let textOut = $('.mapBar-out-text');
    textIn.toggle();
    textOut.toggle();
}

function mapTextSizeUp(factor) {
  // this functions bump text size in map view
  let textIn = $('.mapBar-in-text');
  let textOut = $('.mapBar-out-text');
  let textSize = Math.max(parseInt(textIn.css('font-size')), parseInt(textOut.css('font-size')));
  let FWmarkSize = parseInt($('.map-gant-grid-col').css('font-size'));

      textSize = Math.round(factor * textSize);
      FWmarkSize = Math.round(factor * FWmarkSize);
      
      console.log('new text size: ', textSize, 'px');  

      textIn.css('font-size', textSize + 'px');
      textOut.css('font-size', textSize + 'px');
      $('.map-gant-grid-col').css('font-size', FWmarkSize +'px');
}

function mapView(fulltext=true, maxfont=14) {
  //some assumed values
  let padding = 0;
  // out target div to put the map view in it
  let targetDiv = $('#mapGantArea');
  let gridDiv = $('#mapGantGrid');
  // targetDiv = $('#mapViewDiv');
  // available space in global view
  let spaceX = parseInt(targetDiv.parent().css('width')) - 2 * padding;
  let spaceY = parseInt(targetDiv.parent().css('height')) - 2 * padding;

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
  for (let task of tasks) {
    let left = Math.round((task.start - minTime) / (1000*60*60*24)) * (pp_per_week / 7) + "%";
    let height = Math.round(80 * pp_per_task)/100 + "%";
    let margin = Math.round(10 * pp_per_task)/100 + "%";
    let box_style = 'mapView-task';

    if(task.follow) {
      box_style += ' mapView-linked';
    }

    let width = Math.round(Math.floor(task.trwa / (1000*60*60*24*7)) * pp_per_week) + "%";
    if (task.trwa === 0) {
      width = 0.5 * pp_per_week + "%";
      box_style = 'mapView-milestone';
    }



    // let left = Math.round((task.start - minTime) * px_per_ms) + "px";
    // let width = Math.round(task.trwa * px_per_ms) + "px";
    // let height = px_per_task + "px";

    // lets work on if to show tasks names here
    // first lets figure out font size
    
    let fontSize = maxfont;
    
    let inDivTxt = '';
    let outDivTxt='';

    if (fontSize > 1) {
      inDivTxt = task.nazwa;
      // console.log(inDivTxt.length, fontSize);
      
      let pixelWidth = 0.01*parseFloat(width)*spaceX;
      let maxCharsInName = Math.round(pixelWidth / (0.7 * fontSize));
      
      if (fulltext === false){
        // console.log(maxCharsInName);
        if (inDivTxt.length > maxCharsInName) {
          inDivTxt = inDivTxt.substr(0,maxCharsInName-1) + '\u2026';
        } 
      } else {
        if (inDivTxt.length > maxCharsInName) {
          // let inDivTxtIn = inDivTxt.substr(0,maxCharsInName-1);
          // let inDivTxtOut = inDivTxt.substr(maxCharsInName - 1,inDivTxt.length);
          outDivTxt = '<span class="mapBar-out-text">' + inDivTxt + '</span>';
          inDivTxt = '';
        } else {
          inDivTxt = '<span  class="mapBar-in-text">' + inDivTxt + '</span>';
        }
      }
    }

    fontSize += 'px';

        ganthtml += `<div class="map-gant-row" style="height: ${height}; margin-bottom: ${margin}; "> <div style="margin-left: ${left}; width: ${width}; height: 100%;" TaskIndex="${t}" class="${box_style}">${inDivTxt}</div><div class="map-after-task">${outDivTxt}</div></div>`;
    
    t++;
  }

  targetDiv.html(ganthtml);

  // Now lets work over the FiscalWeek grid system
  // we know from above the size of single week mark
  let width = Math.round((7 * 24 * 60 * 60 * 1000) * pp_per_ms) + "%";
  // now we figure out how many weeks we need to draw
  let w = Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7));

  // lets now draw the grid by divs
  ganthtml = '';
  for (let i = 0; i < w; i++) {
      let thegridtime = minTime + i * (7*24*60*60*1000);
      let fweek = moment(thegridtime).week();
      let currentweek = moment().week();
      if (fweek === currentweek) {
        ganthtml += `<div class="map-gant-grid-col map-current-week" style="width: ${width};">
                    FW${fweek}</div>`;

      } else if (fweek < currentweek) {
        ganthtml += `<div class="map-gant-grid-col map-past-week" style="width: ${width};">
                        FW${fweek}</div>`;
    
      } else {
        ganthtml += `<div class="map-gant-grid-col" style="width: ${width};">
                    FW${fweek}</div>`;
    }
  }

  gridDiv.html(ganthtml);


  // lets make the main div visible and page hidden
  $('#mapViewDiv').removeClass('is-hidden');
  $('#mapViewX').removeClass('is-hidden');
  $('.page').addClass('is-hidden');
  $('.console').addClass('is-hidden');
  isMapView = true;
}

function normalView() {
  $('#mapViewX').addClass('is-hidden');
  $('#mapViewDiv').addClass('is-hidden');
  $('.page').removeClass('is-hidden');
  $('.console').removeClass('is-hidden');
  $('.console').addClass('is-closed');
  isMapView = false;
  creategantt();
}
