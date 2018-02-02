// This is the display functions set fro myPM in JS

function taskMasterFilter(task) {
    // This function checks if the task meets the master search criteria
    // its abut if any of the string meets the master search string

    let searchString = $('#masterFilter').val().trim();

    if (searchString) {
        let taskStringify = JSON.stringify(task);
        if (taskStringify.indexOf(searchString) !== -1) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}


function mapToggleText() {
    // this function shows or hide all text in mapView
    let textIn = $('.mapBar-in-text');
    let textOut = $('.mapBar-out-text');
    textIn.toggle();
    textOut.toggle();
    mapViewConf.textVisible = !mapViewConf.textVisible;
}

function mapTextSizeUp(factor) {
    // this functions bump text size in map view
    let textIn = $('.mapBar-in-text');
    let textOut = $('.mapBar-out-text');
    
    let textSize = mapViewConf.fontSize;

    textSize = Math.round(factor * textSize);

    mapViewConf.fontSize = textSize;

    console.log('changing text size');

    textIn.css('font-size', textSize + 'px');
    textOut.css('font-size', textSize + 'px');
    $('.map-gant-grid-col').css('font-size', textSize + 'px');
}

function mapView(fulltext = true, maxfont = 14, widthpercent = 85) {
    //some assumed values
    let padding = 0;

    // out target div to put the map view in it
    let targetDiv = $('#mapGantArea');
    let gridDiv = $('#mapGantGrid');

    // available space in global view
    let spaceX = parseInt(targetDiv.parent().css('width')) - 2 * padding;
    let spaceY = parseInt(targetDiv.parent().css('height')) - 2 * padding;

    //figuring out x scale
    let px_per_ms = spaceX / (maxTime - minTime); // figured out in pixels
    let pp_per_ms = (widthpercent / (maxTime - minTime)); // in % per ms
    let pp_per_week = (widthpercent / ((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7))); // in % per week  

    //figuring out Y scale
    let px_per_task = spaceY / tasks.length; // figured out in pixels
    let pp_per_task = 90 / tasks.length; // figured out in %

    //lets now generate the graph for the tasks.
    let ganthtml = '';
    let t = 0;
    for (let task of tasks) {
        if (taskMasterFilter(task)) {
            let left = Math.round(100 * ((task.start - minTime) / (1000 * 60 * 60 * 24)) * (pp_per_week / 7)) / 100 + "%";
            let height = Math.round(80 * pp_per_task) / 100 + "%";
            let margin = Math.round(10 * pp_per_task) / 100 + "%";
            let box_style = 'mapView-task';

            if (task.follow) {
                box_style += ' mapView-linked';
            }

            let width = (Math.round(100 * Math.floor(task.trwa / (1000 * 60 * 60 * 24 * 7)) * pp_per_week)) / 100 + "%";
            if (task.trwa === 0) {
                width = 0.5 * pp_per_week + "%";
                box_style = 'mapView-milestone';
            }


            // this is to do sizes and pos by pixels - may be usefull in future
            // let left = Math.round((task.start - minTime) * px_per_ms) + "px";
            // let width = Math.round(task.trwa * px_per_ms) + "px";
            // let height = px_per_task + "px";

            // lets work on if to show tasks names here
            // first lets figure out font size

            let fontSize = maxfont;

            let inDivTxt = '';
            let outDivTxt = '';

            if (fontSize > 1) {
                inDivTxt = task.nazwa;
                // console.log(inDivTxt.length, fontSize);

                let pixelWidth = 0.01 * parseFloat(width) * spaceX;
                let maxCharsInName = Math.round(pixelWidth / (0.7 * fontSize));

                if (fulltext === false) {
                    if (inDivTxt.length > maxCharsInName) {
                        inDivTxt = inDivTxt.substr(0, maxCharsInName - 1) + '\u2026';
                    }
                } else {
                    if (inDivTxt.length > maxCharsInName) {
                        outDivTxt = '<span class="mapBar-out-text" style="font-size:' + mapViewConf.fontSize + 'px">' + inDivTxt + '</span>';
                        inDivTxt = '';
                    } else {
                        inDivTxt = '<span  class="mapBar-in-text" style="font-size:' + mapViewConf.fontSize + 'px">' + inDivTxt + '</span>';
                    }
                }
            }

            fontSize += 'px';

            let divId = "map-" + t;

            ganthtml += `<div class="map-gant-row" style="height: ${height}; margin-bottom: ${margin}; "> <div id="${divId}" style="margin-left: ${left}; width: ${width}; height: 100%;" TaskIndex="${t}" class="${box_style}">${inDivTxt}</div><div class="map-after-task">${outDivTxt}</div></div>`;

        } // end of IF for the master search string match
        t++; // here we increase the index (as we use for of loop)

    } // end of looping over tasks

    targetDiv.html(ganthtml); // this puth the tasks to screen

    if (!mapViewConf.textVisible) { // hidding text if that is the setting now 
        mapToggleText();
        mapViewConf.textVisible = false; // need to overwrite the toogle func behaviour
    }


    // ******************** GRID SECTION *********************
    // Now lets work over the FiscalWeek grid system
    // we know from above the size of single week mark
    // let width = Math.round((7 * 24 * 60 * 60 * 1000) * pp_per_ms) + "%";
    let width = (Math.round(100 * pp_per_week)) / 100 + "%";

    // now we figure out how many weeks we need to draw
    // we will draw few more
    let w = 2 + Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7));

    // lets now draw the grid by divs
    ganthtml = '';
    for (let i = 0; i < w; i++) {
        let thegridtime = minTime + i * (7 * 24 * 60 * 60 * 1000);
        let fweek = moment(thegridtime).week();
        let fyear = moment(thegridtime + 24*60*60*1000).year();
        let currentweek = moment().week();
        let currentyear = moment().year();
        
        if (fweek === currentweek && fyear === currentyear) {
            ganthtml += `<div class="map-gant-grid-col map-current-week" style="width: ${width};">
                    FW${fweek}</div>`;

        } else if ((fweek < currentweek && fyear === currentyear) || (fyear < currentyear)) {
            ganthtml += `<div class="map-gant-grid-col map-past-week" style="width: ${width};">
                        FW${fweek}</div>`;

        } else {
            ganthtml += `<div class="map-gant-grid-col" style="width: ${width};">
                    FW${fweek}</div>`;
        }
    }

    gridDiv.html(ganthtml);
    $('.map-gant-grid-col').css('font-size', mapViewConf.fontSize + 'px'); // and set the marks font size


    // lets make the main div visible and page hidden
    $('#mapViewDiv').removeClass('is-hidden');
    $('#mapViewX').removeClass('is-hidden');
    $('.page').addClass('is-hidden');
    $('.console').addClass('is-hidden');

    // lets higlight selected if needed
    if (isEdit) {
      let position = parseInt($('#task-edit-apply').attr('targetId'));
      higlightTaskDiv(position);
    } else {
      clearHiglight();
    } 
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