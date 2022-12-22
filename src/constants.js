// https://github.com/VladKolerts/miband4/blob/master/constants.js
// https://github.com/vshymanskyy/miband-js/blob/master/src/miband.js

export const SERVICE_UUID_BASE = (x) => `0000${x}-0000-1000-8000-00805f9b34fb`.toLowerCase();
export const CHARACTERISTIC_UUID_BASE = (x) => `0000${x}-0000-3512-2118-0009af100700`


export const SERVICE_UUIDS = {
  MIBAND_SERVICE    : SERVICE_UUID_BASE("FEE0"),
  MIBAND2_SERVICE   : SERVICE_UUID_BASE("FEE1"),
  HEART_RATE        : SERVICE_UUID_BASE("180D"),
  WEIGHT_SERVICE    :               "00001530-0000-3512-2118-0009af100700",
  DEVICE_INFO       : SERVICE_UUID_BASE("180A"),
  NOTIFICATIONS     : SERVICE_UUID_BASE("1811"),


};

export const CHAR_UUIDS = {
    RAW_SENSOR_CONTROL      : '00000001-0000-3512-2118-0009af100700',
    RAW_SENSOR_DATA         : '00000002-0000-3512-2118-0009af100700', 
    FETCH                   : '00000004-0000-3512-2118-0009af100700',
    ACTIVITY_DATA           : '00000005-0000-3512-2118-0009af100700',
    BATTERY                 : '00000006-0000-3512-2118-0009af100700',
    CHUNKED_WRITE           : '00000016-0000-3512-2118-0009af100700',
    CHUNKED_READ            : '00000017-0000-3512-2118-0009af100700',
    CURRENT_TIME            : '00002a2b-0000-1000-8000-00805f9b34fb',

    UNKNOWN_FEDD            : '0000fedd-0000-1000-8000-00805f9b34fb',
    UNKNOWN_FEDE            : '0000fede-0000-1000-8000-00805f9b34fb',
    
    HEARTRATE               : '00002a37-0000-1000-8000-00805f9b34fb',
    
    FIRMWARE                : '00001531-0000-3512-2118-0009af100700',
    FIRMWARE_DATA           : '00001532-0000-3512-2118-0009af100700',

    SYSTEM_ID               : '00002a23-0000-1000-8000-00805f9b34fb',  // ?
    SERIAL                  : '00002a25-0000-1000-8000-00805f9b34fb',  // Blocked UUID in Web Bluetooth: https://goo.gl/4NeimX
    HARDWARE_VERSION        : '00002a27-0000-1000-8000-00805f9b34fb', 
    SOFTWARE_VERSION        : '00002a28-0000-1000-8000-00805f9b34fb',
    PNP_ID                  : '00002a50-0000-1000-8000-00805f9b34fb',  // ?
    
    NOTIFICATIONS           : '00002a46-0000-1000-8000-00805f9b34fb', 



/*
    date: SERVICE_UUID_BASE("FF0A"),
    date2: CHARACTERISTIC_UUID_BASE("FF0A"),




  hz: '00000002-0000-3512-2118-0009af100700',
  sensor: '00000001-0000-3512-2118-0009af100700',
  auth: '00000009-0000-3512-2118-0009af100700',

  alert: '00002a06-0000-1000-8000-00805f9b34fb',
  current_time: '00002a2b-0000-1000-8000-00805f9b34fb',
  unknown1:         '00002a23-0000-1000-8000-00805f9b34fb',
  serial: '00002a25-0000-1000-8000-00805f9b34fb',
  hrdw_revision: '00002a27-0000-1000-8000-00805f9b34fb',
  revision: '00002a28-0000-1000-8000-00805f9b34fb',
  heartrate_measure: '00002a37-0000-1000-8000-00805f9b34fb',
  heartrate_control: '00002a39-0000-1000-8000-00805f9b34fb',
  notifications: '00002a46-0000-1000-8000-00805f9b34fb',
  unknown2:         '00002a50-0000-1000-8000-00805f9b34fb',
  age: '00002a80-0000-1000-8000-00805f9b34fb',
  le_params: '0000ff09-0000-1000-8000-00805f9b34fb',

  configuration: '00000003-0000-3512-2118-0009af100700',
  fetch: '00000004-0000-3512-2118-0009af100700',
  activity_data: '00000005-0000-3512-2118-0009af100700',
  battery: '00000006-0000-3512-2118-0009af100700',
  steps: '00000007-0000-3512-2118-0009af100700',
  user_settings: '00000008-0000-3512-2118-0009af100700',
  music_notification: '00000010-0000-3512-2118-0009af100700',
  deviceevent: '00000010-0000-3512-2118-0009af100700',
  
  chunked_transfer: '00000020-0000-3512-2118-0009af100700',
  chunked_transfer_2021_write: '00000016-0000-3512-2118-0009af100700',
  chunked_transfer_2021_read: '00000017-0000-3512-2118-0009af100700',*/
};

export const CHUNK_ENDPOINTS = {
    CONNECTION      : 0x0015,
    UNKNOWN1        : 0x0028,           // Example [0x0028, 0x0001] consistently returns // 03 03 00 c0 00 11 00 00 00 28 00 02 01 0b 01 19 08 fa 82 20 06 00 85 ee 10 02 08 00
    BATTERY         : 0x0029,           // Example [0x0029, 0x03] returns // 03 03 00 bf 00 15 00 00 00 29 00 04 0f 33 00 3a 08 02 05 16 1c 10 e0 3a 08 02 05 16 1c 10 e0 00
    
    AUTH            : 0x0082,           // Authentication

    UNKNOWN2        : 0x000a            // Seems to take different flags than normal?
}

export const CHUNK_COMMANDS = {
    // GENERIC
    READ                    : 0x01,

    // CONNECTION 0x0015
    //CONNECTION_READ         : 0x01,

    // UNKNOWN1 0x0028
    //UNKNOW1_READ            : 0x01,

    // BATTERY 0x0029
    BATTERY_GET_STATUS      : 0x03,

}
export const CHUNK_RESPONSES = {
    RESULT_OK   : 0x04,
}

export const FETCH_COMMANDS = {
    FROM_DATE               : 0x01,     // Initialize transfer from a target datetime

    BEGIN_TRANSFER          : 0x02,     // Begin transfer; data arrives on the MIBAND_SERVICE.ACTIVITY_DATA characteristic
    ACKNOWLEDGE_AND_DROP    : 0x0301,   // Acknowledge data transfer receipt, and drop data from device
    ACKNOWLEDGE_NO_DROP     : 0x0309,   // Acknowledge data transfer receipt, do not delete data from the device

}
export const FETCH_DATA_TYPES = {
    ACTIVITY_DATA   : 0x01,     // Activity, and Sleep data?

    SP02_DATA       : 0x25,     // sp02 Oxygen reading data

}

export const NOTIFICATION_DESCRIPTOR = 0x2902;

export const NOTIFICATION_TYPES = {
  msg: '\x01\x01',
  call: '\x03\x01',
  missed: '\x04\x01',
  sms: '\x05\x01',
}

export const ADVERTISEMENT_SERVICE = 0xFEE0;

export const ACTIVITIES = {
    INACTIVE : 80,

    CALIBRATING : 112,
    NOT_WORN : 115,
    CHARGING : 118,

    SLEEP : 120,
}

export const ACTIVITY_CATEGORY = {
    DEEP_SLEEP : 0,
    LIGHT_SLEEP : 1,
    REM_SLEEP : 2,
    INACTIVE : 3,
    ACTIVE : 4,
    OFF : null,
}

export const ACTIVITIES_TEXT = {
    64 : '?', //walking?
    INACTIVE : 'Inactive', //?
    88 : '?',
    96 : 'Walking', //walking?
    CALIBRATING : 'Calibrating', // Calibrating? Happens when band first put on
    NOT_WORN : 'Not Worn',
    CHARGING : 'Charging',
    ASLEEP : 'Asleep'
}