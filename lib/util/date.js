"use strict";

var tz = require('zoneinfo').TZDate
  , stamps = {
        'second': 'Seconds'
      , 'seconds': 'Seconds'
      , 'minute': 'Minutes'
      , 'minutes': 'Minutes'
      , 'hour': 'Hours'
      , 'hours': 'Hours'
      , 'day': 'Date'
      , 'days': 'Date'
      , 'month': 'Month'
      , 'months': 'Month'
      , 'year': 'FullYear'
      , 'years': 'FullYear'
    };


/**
 * Transforms `tzn` in its minutes equivalent, see http://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *
 * @example
 *  util.tzToMinutes('Asia/Tokyo');
 *  // -540
 *
 * @param tzn
 * @returns {number}
 */

exports.tzToMinutes = function tzToMinutes(tzn) {
  var d = new tz(null, tzn).format('O')
    , sign = d[0]
    , hours = parseInt(d.slice(1, 3), 10)
    , minutes = parseInt(d.slice(3), 10);

  return (hours * 60 + minutes) * (sign == '+' ? -1 : 1);
};

/**
 * Applies `interval` to `date` or to Date.now()
 *
 * ### example
 *     util.stampify('3 hours', new Date(2013, 2, 3, 4, 40, 3));
 *     // Sun Mar 03 2013 07:40:03 GMT+0100 (CET)
 *
 * @param interval
 * @param date
 * @returns Date
 */

exports.stampify = function stampify(interval, date) {
  var match
    , parts
    , value
    , unit
    , method
    , actual;

  date = date || (new Date);

  parts = interval.split(',');
  parts.forEach(function (part) {
    match = part.trim().match(/(\d{1,2})\s*(\w+)/);
    value = parseInt(match[1], 10);
    unit = match[2];
    method = stamps[unit];
    actual = date['get' + method]();
    date['set' + method](actual + value);
  });

  return date;
};
