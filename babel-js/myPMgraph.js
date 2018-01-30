'use strict';

// This is the display functions set fro myPM in JS


function mapToggleText() {
  // this function shows or hide all text in mapView
  var textIn = $('.mapBar-in-text');
  var textOut = $('.mapBar-out-text');
  textIn.toggle();
  textOut.toggle();
}

function mapTextSizeUp(factor) {
  // this functions bump text size in map view
  var textIn = $('.mapBar-in-text');
  var textOut = $('.mapBar-out-text');
  var textSize = Math.max(parseInt(textIn.css('font-size')), parseInt(textOut.css('font-size')));
  var FWmarkSize = parseInt($('.map-gant-grid-col').css('font-size'));

  textSize = Math.round(factor * textSize);
  FWmarkSize = Math.round(factor * FWmarkSize);

  console.log('new text size: ', textSize, 'px');

  textIn.css('font-size', textSize + 'px');
  textOut.css('font-size', textSize + 'px');
  $('.map-gant-grid-col').css('font-size', FWmarkSize + 'px');
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
  // targetDiv = $('#mapViewDiv');
  // available space in global view
  var spaceX = parseInt(targetDiv.parent().css('width')) - 2 * padding;
  var spaceY = parseInt(targetDiv.parent().css('height')) - 2 * padding;

  //figuring out x scale
  var px_per_ms = spaceX / (maxTime - minTime);
  var pp_per_ms = widthpercent / (maxTime - minTime);
  var pp_per_week = widthpercent / ((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7));

  //figuring out Y scale
  var px_per_task = spaceY / tasks.length;
  var pp_per_task = 90 / tasks.length;

  //lets now generate the graph for the tasks.
  var ganthtml = '';
  var t = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var task = _step.value;

      var left = Math.round(100 * ((task.start - minTime) / (1000 * 60 * 60 * 24)) * (pp_per_week / 7)) / 100 + "%";
      var height = Math.round(80 * pp_per_task) / 100 + "%";
      var margin = Math.round(10 * pp_per_task) / 100 + "%";
      var box_style = 'mapView-task';

      if (task.follow) {
        box_style += ' mapView-linked';
      }

      var _width = Math.round(100 * Math.floor(task.trwa / (1000 * 60 * 60 * 24 * 7)) * pp_per_week) / 100 + "%";
      if (task.trwa === 0) {
        _width = 0.5 * pp_per_week + "%";
        box_style = 'mapView-milestone';
      }

      // let left = Math.round((task.start - minTime) * px_per_ms) + "px";
      // let width = Math.round(task.trwa * px_per_ms) + "px";
      // let height = px_per_task + "px";

      // lets work on if to show tasks names here
      // first lets figure out font size

      var fontSize = maxfont;

      var inDivTxt = '';
      var outDivTxt = '';

      if (fontSize > 1) {
        inDivTxt = task.nazwa;
        // console.log(inDivTxt.length, fontSize);

        var pixelWidth = 0.01 * parseFloat(_width) * spaceX;
        var maxCharsInName = Math.round(pixelWidth / (0.7 * fontSize));

        if (fulltext === false) {
          // console.log(maxCharsInName);
          if (inDivTxt.length > maxCharsInName) {
            inDivTxt = inDivTxt.substr(0, maxCharsInName - 1) + '\u2026';
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

      ganthtml += '<div class="map-gant-row" style="height: ' + height + '; margin-bottom: ' + margin + '; "> <div style="margin-left: ' + left + '; width: ' + _width + '; height: 100%;" TaskIndex="' + t + '" class="' + box_style + '">' + inDivTxt + '</div><div class="map-after-task">' + outDivTxt + '</div></div>';

      t++;
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

  targetDiv.html(ganthtml);

  // Now lets work over the FiscalWeek grid system
  // we know from above the size of single week mark
  // let width = Math.round((7 * 24 * 60 * 60 * 1000) * pp_per_ms) + "%";
  var width = Math.round(100 * pp_per_week) / 100 + "%";

  // now we figure out how many weeks we need to draw
  // we will draw few more
  var w = 2 + Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7));

  // lets now draw the grid by divs
  ganthtml = '';
  for (var i = 0; i < w; i++) {
    var thegridtime = minTime + i * (7 * 24 * 60 * 60 * 1000);
    var fweek = moment(thegridtime).week();
    var currentweek = moment().week();
    if (fweek === currentweek) {
      ganthtml += '<div class="map-gant-grid-col map-current-week" style="width: ' + width + ';">\n                    FW' + fweek + '</div>';
    } else if (fweek < currentweek) {
      ganthtml += '<div class="map-gant-grid-col map-past-week" style="width: ' + width + ';">\n                        FW' + fweek + '</div>';
    } else {
      ganthtml += '<div class="map-gant-grid-col" style="width: ' + width + ';">\n                    FW' + fweek + '</div>';
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