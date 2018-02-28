// This is the display functions set fro myPM in JS

function taskMasterFilter(task) {
    // This function checks if the task meets the master search criteria
    // its abut if any of the string meets the master search string

    let inputIsArray = false;
    let searchString = $('#masterFilter').val().trim();

    // checking if searchstring is a list of strings
    // separated by comma ,

    if (searchString.indexOf(',') !== -1) {
        console.log('search is set of questions');
        inputIsArray = true;
        searchString = searchString.split(',');
    }


    if (searchString) {
        let taskStringify = JSON.stringify(task);

        if (!inputIsArray && taskStringify.indexOf(searchString) !== -1) {
            return true;

        } else if (inputIsArray) {

            for (let question of searchString) {
                if (question.trim() !== '' && taskStringify.indexOf(question.trim()) !== -1) {
                    return true;
                }
            }
            return false; // if non of the question fits
        }
    } else {
        return true; // if the search string is empty 
    }
}


function toogleFW(argument) {
    // This function is about adding/removing clicked week from the markedFW array
    if (markedFW.indexOf(argument) === -1) {
        markedFW.push(argument);

    } else {
        markedFW.splice(markedFW.indexOf(argument), 1);
    }

    if (isMapView) {
        mapView();
    } else {
        normalView();
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
    $('.FWbutton').css('font-size', textSize + 'px');
}

function mapView(fulltext = true, maxfont = 14, widthpercent = 85) {
    if(tasks.length === 0){ // mapView is called with no tasks
        
        // we check min time if zero we set for now
        if(minTime === 0) {
            minTime = moment().startOf('day').valueOf();
        }
        // we add new blank taks to start with
        let zadanie = {
                    nazwa: 'New Task',
                    start: minTime,
                    trwa: (7 * 24 * 60 * 60 * 1000 ), // one week 
                    kto: 'none',
                    timeline: '', // as string
                    follow: false,
                    complete: 0,
                };

        tasks.push(zadanie);
        updateTasks();
        showTaskDetail(0); 
    } // end of adding first task and bring up edit if was empty


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
    let pp_per_week = Math.round(100 * widthpercent / (moment(maxTime).diff(moment(minTime), 'weeks'))) / 100; // in % per week  

    // now we figure out how many weeks we need to draw
    // we will draw few more
    let w = 2 + Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7));

    // as we want to have some space to breath
    // we need to limit the max size of one week to 1/5 of the whole
    pp_per_week = Math.min(pp_per_week, Math.round(100*100 / w) / 100);
    
    //figuring out Y scale
    //taking under consideration the taks that will be displayed only
    let tasksToBeDisplayed = 0;

    // handling the array to be ready to make new project from displayed tasks
    displayedtasks = []; // cleaniing up the array of displayed tasks
    notdisplayedtasks = []; // cleaning the list of not displayed tasks

    for (let task of tasks) {
        if (taskMasterFilter(task)) {
            tasksToBeDisplayed++;
            displayedtasks.push(task);
        } else {
            notdisplayedtasks.push(task);
        }
    }

    let px_per_task = spaceY / tasksToBeDisplayed; // figured out in pixels
    // checking if the px size is more than the required min and les than the max
    // jus some clipping to the value
    px_per_task = Math.min(Math.max(px_per_task, mapViewConf.minpx_per_task), mapViewConf.maxpx_per_task);



    let pp_per_task = 90 / tasksToBeDisplayed; // figured out in %
    // previous solution
    // let px_per_task = spaceY / tasks.length; // figured out in pixels
    // let pp_per_task = 90 / tasks.length; // figured out in %

    //lets now generate the graph for the tasks.
    let ganthtml = '';
    let t = 0;



    for (let task of tasks) {
        if (taskMasterFilter(task)) {
            let left = (moment(task.start).diff(moment(minTime), 'days') / 7) * pp_per_week + "%";


            let height = Math.round(80 * pp_per_task) / 100 + "%";
            let margin = Math.round(10 * pp_per_task) / 100 + "%";

            // we override the above height and margin if the config is to use px
            if (mapViewConf.pixelHeight) {
                height = Math.round(100 * px_per_task) / 100 + "px";
                margin = Math.round(20 * px_per_task) / 100 + "px";
            }


            let box_style = 'mapView-task';

            if (task.follow) {
                box_style += ' mapView-linked';
            }

            let width = (moment(task.trwa).weeks() - 1) * pp_per_week + "%";

            if (task.trwa <= (60 * 60 * 1000)) {
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
                inDivTxt = `<span style="font-size: 75%;">${t}:</span> ${task.nazwa}`;
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

    // here we add extra row if working in pixel mode to get breath at the bottom
    if (mapViewConf.pixelHeight) {
        ganthtml += `<div id="bottom-close-row" class="map-gant-row" style="height: ${mapViewConf.maxpx_per_task}px"></div>`;
    }


    targetDiv.html(ganthtml); // this puth the tasks to screen

    if (!mapViewConf.textVisible) { // hidding text if that is the setting now 
        mapToggleText();
        mapViewConf.textVisible = false; // need to overwrite the toogle func behaviour
    }


    // ******************** GRID SECTION *********************
    // Now lets work over the FiscalWeek grid system
    // we know from above the size of single week mark
    // let width = Math.round((7 * 24 * 60 * 60 * 1000) * pp_per_ms) + "%";
    let width = pp_per_week + "%";

    

    // lets now draw the grid by divs
    ganthtml = '';

    let thegridtime = moment(minTime);
    let oldgridtime = moment(minTime).subtract(7, 'days');

    for (let i = 0; i < w; i++) {


        // some quick hacky fix for not being at the monday

        // if(moment(thegridtime).day() == 0){
        //     // adding one day
        //     thegridtime += 1 * 24 * 60 * 60 * 1000;
        // } else if(moment(thegridtime).day() > 1){
        //     thegridtime -= (moment(thegridtime).day() - 1) * 24 * 60 * 60 * 1000;
        // }

        let weekWidthTime = thegridtime - oldgridtime;
        console.log('week delta: ', moment(weekWidthTime).days());

        // width = Math.round( 100 * ( weekWidthTime * pp_per_ms )) / 100; 
        // width += '%';

        // console.log(width);



        let fweek = moment(thegridtime).week();
        let fyear = moment(thegridtime + 24 * 60 * 60 * 1000).year();
        let currentweek = moment().week();
        let currentyear = moment().year();

        // lets check if this week is in marked weeks array 
        let checkString = 'FW:' + fweek + 'Y:' + fyear;


        if (markedFW.indexOf(checkString) !== -1) {
            ganthtml += `<div class="map-gant-grid-col map-col-marked" style="width: ${width};">`;

        } else if (fweek === currentweek && fyear === currentyear) {
            ganthtml += `<div class="map-gant-grid-col map-current-week" style="width: ${width};">`;

        } else if ((fweek < currentweek && fyear === currentyear) || (fyear < currentyear)) {
            ganthtml += `<div class="map-gant-grid-col map-past-week" style="width: ${width};">`;

        } else {
            ganthtml += `<div class="map-gant-grid-col" style="width: ${width};">`;
        }

        ganthtml += `<button class="fw-btn FWbutton" style="font-size: ${mapViewConf.fontSize + 'px'}" title="starts: ${moment(thegridtime).format('DD-MM-YYYY')}" onclick="toogleFW('${checkString}')">FW${fweek}</button></div>`;

        // increasing time stamp

        oldgridtime = moment(thegridtime);
        thegridtime.add(7, 'days');
        // thegridtime +=  (7 * 24 * 60 * 60 * 1000);
    } // end of looping over the grid weeks

    gridDiv.html(ganthtml);
    $('.map-gant-grid-col').css('font-size', mapViewConf.fontSize + 'px'); // and set the marks font size


    // lets make the main div visible and page hidden
    $('#mapViewDiv').removeClass('is-hidden');
    $('#mapViewX').removeClass('is-hidden');
    $('.page').addClass('is-hidden');
    $('.console').addClass('is-transparent');

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
    $('.console').removeClass('is-transparent');
    $('.console').addClass('is-closed');
    isMapView = false;
    creategantt();
}