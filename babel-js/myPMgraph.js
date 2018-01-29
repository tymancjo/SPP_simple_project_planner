'use strict';

// This is the display functions set fro myPM in JS


function mapView() {
  var fulltext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var maxfont = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 15;

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
  var pp_per_ms = 95 / (maxTime - minTime);
  var pp_per_week = Math.round(95 / ((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7)));

  //figuring out Y scale
  var px_per_task = spaceY / tasks.length;
  var pp_per_task = 100 / tasks.length;

  //lets now generate the graph for the tasks.
  var ganthtml = '';
  var t = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var task = _step.value;

      var left = Math.round((task.start - minTime) / (1000 * 60 * 60 * 24)) * (pp_per_week / 7) + "%";
      var height = 0.8 * pp_per_task + "%";
      var margin = 0.05 * pp_per_task + "%";
      var box_style = 'mapView-task';

      if (task.follow) {
        box_style += ' mapView-linked';
      }

      var _width = Math.round(Math.floor(task.trwa / (1000 * 60 * 60 * 24 * 7)) * pp_per_week) + "%";
      if (task.trwa === 0) {
        _width = 0.5 * pp_per_week + "%";
        box_style = 'mapView-milestone';
      }

      // let left = Math.round((task.start - minTime) * px_per_ms) + "px";
      // let width = Math.round(task.trwa * px_per_ms) + "px";
      // let height = px_per_task + "px";

      // lets work on if to show tasks names here
      // first lets figure out font size
      var fontSize = 0.8 * px_per_task;
      if (fontSize > maxfont) {
        fontSize = maxfont;
      }

      var inDivTxt = '';
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
            inDivTxt = '<span style ="margin-left: ' + pixelWidth + 'px;" class="mapBar-out-text">' + inDivTxt + '</span>';
          }
        }
      }

      fontSize += 'px';

      ganthtml += '<div style="left: ' + left + '; width: ' + _width + '; height: ' + height + '; margin-bottom: ' + margin + '; font-size: ' + fontSize + ';" TaskIndex="' + t + '" class="' + box_style + '">' + inDivTxt + '</div>';
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
  var width = Math.round(7 * 24 * 60 * 60 * 1000 * pp_per_ms) + "%";
  // now we figure out how many weeks we need to draw
  var w = Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24 * 7));

  // lets now draw the grid by divs
  ganthtml = '';
  for (var i = 0; i < w; i++) {
    var thegridtime = minTime + i * (7 * 24 * 60 * 60 * 1000);
    var fweek = moment(thegridtime).week();
    ganthtml += '<div class="map-gant-grid-col" style="width: ' + width + ';">\n                  FW' + fweek + '</div>';
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