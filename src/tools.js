// From https://bitcoin.stackexchange.com/questions/52727/byte-array-to-hexadecimal-and-back-again-in-javascript
export function toHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join(' ');
}
export function toByteArray(hexString) {
    hexString = hexString.replace(' ', '');
    var result = [];
    for (var i = 0; i < hexString.length; i += 2) {
        result.push(parseInt(hexString.substr(i, 2), 16));
    }
    return result;
}

export function convertToInt32Array(bytes) {
    var result = [];
    for (var i = 0; i < bytes.length; i += 4) {
      result.push(
        (bytes[i] << 24) |
        (bytes[i + 1] << 16) |
        (bytes[i + 2] << 8) |
        bytes[i + 3]
      );
    }
    return result;
  }
export  function convertToInt16Array(bytes) {
    var result = [];
    for (var i = 0; i < bytes.length; i += 2) {
      result.push(
        (bytes[i] << 8) |
        bytes[i + 1]
      );
    }
    return result;
  }



// https://stackoverflow.com/questions/1197928/how-to-add-30-minutes-to-a-javascript-date-object
/**
* Adds time to a date. Modelled after MySQL DATE_ADD function.
* Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
* https://stackoverflow.com/a/1214753/18511
* 
* @param date  Date to start with
* @param interval  One of: year, quarter, month, week, day, hour, minute, second
* @param units  Number of units of the given interval to add.
*/
export function dateAdd(date, interval, units) {
    if (!(date instanceof Date))
        return undefined;
    var ret = new Date(date); //don't change original date
    var checkRollover = function () { if (ret.getDate() != date.getDate()) ret.setDate(0); };
    switch (String(interval).toLowerCase()) {
        case 'year': ret.setFullYear(ret.getFullYear() + units); checkRollover(); break;
        case 'quarter': ret.setMonth(ret.getMonth() + 3 * units); checkRollover(); break;
        case 'month': ret.setMonth(ret.getMonth() + units); checkRollover(); break;
        case 'week': ret.setDate(ret.getDate() + 7 * units); break;
        case 'day': ret.setDate(ret.getDate() + units); break;
        case 'hour': ret.setTime(ret.getTime() + units * 3600000); break;
        case 'minute': ret.setTime(ret.getTime() + units * 60000); break;
        case 'second': ret.setTime(ret.getTime() + units * 1000); break;
        default: ret = undefined; break;
    }
    return ret;
}


// https://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
export function yearAsArray(year) {
    var byteArray = new Uint8Array([0, 0]);
    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = year & 0xff;
        byteArray [ index ] = byte;
        year = (year - byte) / 256 ;
    }
    return byteArray;
};

export function dateToUTCWatchDateArray(date) {
    // components in UTC and correct values
    var year = date.getUTCFullYear()
    var month = date.getUTCMonth() + 1
    var day = date.getUTCDate()
    var hour = date.getUTCHours()
    var minute = date.getUTCMinutes()
    var seconds = date.getUTCSeconds()

    // Values to byte array
    year2 = yearAsArray(year);
    return new Uint8Array([...year2, month, day, hour, minute, seconds]);
}


// Simple Date to relative
// https://stackoverflow.com/questions/7641791/javascript-library-for-human-friendly-relative-date-formatting
// Make a fuzzy time
export function relativeDatetime(date) {
    var delta = Math.round((+new Date - date) / 1000);

    var minute = 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;

    var fuzzy;

    if (delta < 30) {
        fuzzy = 'just now';
    } else if (delta < minute) {
        fuzzy = delta + ' seconds ago';
    } else if (delta < 2 * minute) {
        fuzzy = 'a minute ago'
    } else if (delta < hour) {
        fuzzy = Math.floor(delta / minute) + ' minutes ago.';
    } else if (Math.floor(delta / hour) == 1) {
        fuzzy = '1 hour ago.'
    } else if (delta < day) {
        fuzzy = Math.floor(delta / hour) + ' hours ago.';
    } else if (delta < day * 2) {
        fuzzy = 'yesterday';
    }
    else if (delta < day * 5) {
        fuzzy = 'a few days ago';
    }
    else if (delta < day * 10) {
        fuzzy = 'last week';
    }
    else {fuzzy = 'a long time ago'}
    return fuzzy;
}

export function bufferToUint8Array(data)
{
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT)
}

//https://stackoverflow.com/a/49129872
export function concatUint8Arrays(array1, array2) {
    var mergedArray = new Uint8Array(array1.length + array2.length);
    // Deep copy
    mergedArray.set([...array1]);
    mergedArray.set([...array2], array1.length);
    return mergedArray;
}

export const invertDictionary = (data) => Object.fromEntries(
    Object
      .entries(data)
      .map(([key, value]) => [value, key])
    );

export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
export function uniqBy(a, key) {
    var seen = {};
    return a.filter(function (item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}