'use strict';

// This is the display functions set fro myPM in JS

function taskMasterFilter(task) {
    // This function checks if the task meets the master search criteria
    // its abut if any of the string meets the master search string

    var inputIsArray = false;
    var searchString = $('#masterFilter').val().trim();

    // checking if searchstring is a list of strings
    // separated by comma ,

    if (searchString.indexOf(',') !== -1) {
        console.log('search is set of questions');
        inputIsArray = true;
        searchString = searchString.split(',');
    }

    if (searchString) {
        var taskStringify = JSON.stringify(task);

        if (!inputIsArray && taskStringify.indexOf(searchString) !== -1) {
            return true;
        } else if (inputIsArray) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {

                for (var _iterator = searchString[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var question = _step.value;

                    if (question.trim() !== '' && taskStringify.indexOf(question.trim()) !== -1) {
                        return true;
                    }
                }
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
    var textIn = $('.mapBar-in-text');
    var textOut = $('.mapBar-out-text');
    textIn.toggle();
    textOut.toggle();
    mapViewConf.textVisible = !mapViewConf.textVisible;
}

function mapTextSizeUp(factor) {
    // this functions bump text size in map view
    var textIn = $('.mapBar-in-text');
    var textOut = $('.mapBar-out-text');

    var textSize = mapViewConf.fontSize;

    textSize = Math.round(factor * textSize);

    mapViewConf.fontSize = textSize;

    console.log('changing text size');

    textIn.css('font-size', textSize + 'px');
    textOut.css('font-size', textSize + 'px');
    $('.FWbutton').css('font-size', textSize + 'px');
}

function mapView() {
    var fulltext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var maxfont = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 14;
    var widthpercent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 85;

    //some assumed values
    var padding = 0;

    // out target div to put the map view in it
    var targetDiv = $('#mapGantArea');
    var gridDiv = $('#mapGantGrid');

    // available space in global view
    var spaceX = parseInt(targetDiv.parent().css('width')) - 2 * padding;
    var spaceY = parseInt(targetDiv.parent().css('height')) - 2 * padding;

    //figuring out x scale
    var px_per_ms = spaceX / (maxTime - minTime); // figured out in pixels
    var pp_per_ms = widthpercent / (maxTime - minTime); // in % per ms
    // let pp_per_week = (widthpercent / ((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7))); // in % per week  
    var pp_per_week = Math.round(100 * widthpercent / moment(maxTime).diff(moment(minTime), 'weeks')) / 100; // in % per week  

    //figuring out Y scale
    //taking under consideration the taks that will be displayed only
    var tasksToBeDisplayed = 0;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = tasks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var task = _step2.value;

            if (taskMasterFilter(task)) {
                tasksToBeDisplayed++;
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    var px_per_task = spaceY / tasksToBeDisplayed; // figured out in pixels
    // checking if the px size is more than the required min and les than the max
    // jus some clipping to the value
    px_per_task = Math.min(Math.max(px_per_task, mapViewConf.minpx_per_task), mapViewConf.maxpx_per_task);

    var pp_per_task = 90 / tasksToBeDisplayed; // figured out in %
    // previous solution
    // let px_per_task = spaceY / tasks.length; // figured out in pixels
    // let pp_per_task = 90 / tasks.length; // figured out in %

    //lets now generate the graph for the tasks.
    var ganthtml = '';
    var t = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = tasks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _task = _step3.value;

            if (taskMasterFilter(_task)) {
                // let left = Math.round(100 * ((task.start - minTime) / (1000 * 60 * 60 * 24)) * (pp_per_week / 7)) / 100 + "%";
                // let left = Math.round(100 * ((task.start - minTime)) * pp_per_ms) / 100 + "%";

                // let left = Math.round(100 * ( moment(task.start).diff(moment(minTime), 'weeks'))* pp_per_week) / 100 + "%";
                var left = moment(_task.start).diff(moment(minTime), 'days') / 7 * pp_per_week + "%";

                var height = Math.round(80 * pp_per_task) / 100 + "%";
                var margin = Math.round(10 * pp_per_task) / 100 + "%";

                // we override the above height and margin if the config is to use px
                if (mapViewConf.pixelHeight) {
                    height = Math.round(100 * px_per_task) / 100 + "px";
                    margin = Math.round(20 * px_per_task) / 100 + "px";
                }

                var box_style = 'mapView-task';

                if (_task.follow) {
                    box_style += ' mapView-linked';
                }

                // let width = (Math.round(100 * Math.floor(task.trwa / (1000 * 60 * 60 * 24 * 7)) * pp_per_week)) / 100 + "%";
                var _width = (moment(_task.trwa).weeks() - 1) * pp_per_week + "%";

                if (_task.trwa <= 60 * 60 * 1000) {
                    _width = 0.5 * pp_per_week + "%";
                    box_style = 'mapView-milestone';
                }

                // this is to do sizes and pos by pixels - may be usefull in future
                // let left = Math.round((task.start - minTime) * px_per_ms) + "px";
                // let width = Math.round(task.trwa * px_per_ms) + "px";
                // let height = px_per_task + "px";

                // lets work on if to show tasks names here
                // first lets figure out font size

                var fontSize = maxfont;

                var inDivTxt = '';
                var outDivTxt = '';

                if (fontSize > 1) {
                    inDivTxt = '<span style="font-size: 75%;">' + t + ':</span> ' + _task.nazwa;
                    // console.log(inDivTxt.length, fontSize);

                    var pixelWidth = 0.01 * parseFloat(_width) * spaceX;
                    var maxCharsInName = Math.round(pixelWidth / (0.7 * fontSize));

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

                var divId = "map-" + t;

                ganthtml += '<div class="map-gant-row" style="height: ' + height + '; margin-bottom: ' + margin + '; "> <div id="' + divId + '" style="margin-left: ' + left + '; width: ' + _width + '; height: 100%;" TaskIndex="' + t + '" class="' + box_style + '">' + inDivTxt + '</div><div class="map-after-task">' + outDivTxt + '</div></div>';
            } // end of IF for the master search string match
            t++; // here we increase the index (as we use for of loop)
        } // end of looping over tasks

        // here we add extra row if working in pixel mode to get breath at the bottom
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    if (mapViewConf.pixelHeight) {
        ganthtml += '<div id="bottom-close-row" class="map-gant-row" style="height: ' + mapViewConf.maxpx_per_task + 'px"></div>';
    }

    targetDiv.html(ganthtml); // this puth the tasks to screen

    if (!mapViewConf.textVisible) {
        // hidding text if that is the setting now 
        mapToggleText();
        mapViewConf.textVisible = false; // need to overwrite the toogle func behaviour
    }

    // ******************** GRID SECTION *********************
    // Now lets work over the FiscalWeek grid system
    // we know from above the size of single week mark
    // let width = Math.round((7 * 24 * 60 * 60 * 1000) * pp_per_ms) + "%";
    var width = pp_per_week + "%";

    // now we figure out how many weeks we need to draw
    // we will draw few more
    var w = 2 + Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7));

    // lets now draw the grid by divs
    ganthtml = '';

    var thegridtime = moment(minTime);
    var oldgridtime = moment(minTime).subtract(7, 'days');

    for (var i = 0; i < w; i++) {

        // some quick hacky fix for not being at the monday

        // if(moment(thegridtime).day() == 0){
        //     // adding one day
        //     thegridtime += 1 * 24 * 60 * 60 * 1000;
        // } else if(moment(thegridtime).day() > 1){
        //     thegridtime -= (moment(thegridtime).day() - 1) * 24 * 60 * 60 * 1000;
        // }

        var weekWidthTime = thegridtime - oldgridtime;
        console.log('week delta: ', moment(weekWidthTime).days());

        // width = Math.round( 100 * ( weekWidthTime * pp_per_ms )) / 100; 
        // width += '%';

        console.log(width);

        var fweek = moment(thegridtime).week();
        var fyear = moment(thegridtime + 24 * 60 * 60 * 1000).year();
        var currentweek = moment().week();
        var currentyear = moment().year();

        // lets check if this week is in marked weeks array 
        var checkString = 'FW:' + fweek + 'Y:' + fyear;

        if (markedFW.indexOf(checkString) !== -1) {
            ganthtml += '<div class="map-gant-grid-col map-col-marked" style="width: ' + width + ';">';
        } else if (fweek === currentweek && fyear === currentyear) {
            ganthtml += '<div class="map-gant-grid-col map-current-week" style="width: ' + width + ';">';
        } else if (fweek < currentweek && fyear === currentyear || fyear < currentyear) {
            ganthtml += '<div class="map-gant-grid-col map-past-week" style="width: ' + width + ';">';
        } else {
            ganthtml += '<div class="map-gant-grid-col" style="width: ' + width + ';">';
        }

        ganthtml += '<button class="fw-btn FWbutton" style="font-size: ' + (mapViewConf.fontSize + 'px') + '" title="starts: ' + moment(thegridtime).format('DD-MM-YYYY') + '" onclick="toogleFW(\'' + checkString + '\')">FW' + fweek + '</button></div>';

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
    $('.console').addClass('is-hidden');

    // lets higlight selected if needed
    if (isEdit) {
        var position = parseInt($('#task-edit-apply').attr('targetId'));
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