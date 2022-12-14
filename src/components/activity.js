import { ADVERTISEMENT_SERVICE, CHAR_UUIDS, SERVICE_UUIDS, CHUNK_ENDPOINTS, CHUNK_COMMANDS, FETCH_COMMANDS, FETCH_DATA_TYPES } from "../constants.js";
import { toHexString, bufferToUint8Array, arraysEqual, concatUint8Arrays, convertToInt16Array, dateAdd, dateToUTCWatchDateArray } from "../tools.js";
import { ActivityData } from "../models/activity.js";

export class activityReader extends EventTarget {
    constructor(band) {
        super()
        this.Band = band;

        this.status = {
            fetchStarted: false,
            fetchError: false,
            fetchfinished: false,

            activityStarted: false,
            activityError: false,
            activityFinished: false,

            currentBatch: 0,
        }

        this.rawActivityData = new Uint8Array();
        this.rawStartDate = null;
        this.ActivityData = new ActivityData();
        
        
    }

    async readSince(datetime) {
        // Preprocess
        if(datetime == null)
        {
            datetime = new Date();
            datetime = dateAdd(datetime, 'hour', -1);
        }
        datetime = dateToUTCWatchDateArray(datetime);

        var self = this
        self.listenerOnFetch = async (e) => this.onFetchRead(e)
        self.listenerOnActivity = async (e) => this.onActivityRead(e)

        // Hook
        await this.Band.GATT.startNotifications(this.Band.Chars.FETCH, self.listenerOnFetch)
        await this.Band.GATT.startNotifications(this.Band.Chars.ACTIVITY_DATA, self.listenerOnActivity)

        // Send Start Command 1: Type and Data Type   failure: 10 01 32, timeout    ready: 10 01 01
        await this.Band.Chars.FETCH.writeValueWithoutResponse(
            new Uint8Array([FETCH_COMMANDS.FROM_DATE, FETCH_DATA_TYPES.ACTIVITY_DATA,   ...datetime,   0x00, 0x00])); // [start, type, ..date]
        await new Promise( (resolve, reject) => {
            this.addEventListener('fetch_start', function(e) {
                resolve(e.detail); // done
        });});

        // Send Start Command 2: Begin Transfer
        await x.Chars.FETCH.writeValueWithoutResponse(Uint8Array.from([FETCH_COMMANDS.BEGIN_TRANSFER]));
        this.status.fetchStarted = true;
        await new Promise( (resolve, reject) => {
            this.addEventListener('transfer_end', function(e) {
                resolve(e.detail); // done
        });});

        // Acknowledge Fetch     10 02 01 f3 d3 ba e8 success        10 02 32 00 00 00 00 failure to ack
        console.log("Done")

        // Unhook
        await this.Band.GATT.stopNotifications(this.Band.Chars.FETCH, self.listenerOnFetch)
        await this.Band.GATT.stopNotifications(this.Band.Chars.ACTIVITY_DATA, self.listenerOnActivity)
    }

    async onFetchRead(e) {
        //                                               Datetime
        // Fetch 1 Sent     :                01 01   e6 07 0c 08 0f 32 00 01
        // Fetch 1 expected : 10 01 01 01 08 00 00   e6 07 0c 08 0f 32 00 01   00
        //                    10 01 01 b1 2c 00 00 e6 07 0c 03 12 28 1e 01 00
        //                    10 01 01 b1 2c 00 00 e6 07 0c 03 12 28 1e 01 00

        console.log("activityReader notified : FETCH");

        var raw = bufferToUint8Array(e.target.value);
        /*if(arraysEqual( raw, new Uint8Array([0x10, 0x01, 0x32] )))
        {
            console.error("Timeout in Fetch");
            this.dispatchEvent( new CustomEvent('fetch_start', {detail: false}))
            return false;
        }
        // Ready for Send command
        else */if(arraysEqual( raw.slice(0,3), new Uint8Array([0x10, 0x01, 0x01]))) // Ready
        {
            console.warn("Fetch Ready");

            // Save the actual start datetime for the about-to-be-received data
            var year = convertToInt16Array([...raw.slice(7, 7+2)].reverse())[0]
            var month = raw[9] - 1
            var day = raw[10]
            var hour = raw[11]
            if(raw[14] > 0) {console.warn("Date Offset!")}
            var minute = raw[12] - (raw[14] * 15) // trailing digit(s?) are an offset of 15 or 16 minutes. This offset was being provided by my manual test call
            var second = raw[13]
            this.rawStartDate = new Date(Date.UTC(year, month, day, hour, minute, second)) // Watch tracks in UTC

            this.dispatchEvent( new CustomEvent('fetch_start', {detail: true}))
            return true;
        }
        // Done, Success
        else if(arraysEqual( raw.slice(0,3), new Uint8Array([0x10, 0x02, 0x01])))
        {
            await this.Band.Chars.FETCH.writeValueWithoutResponse(Uint8Array.from([0x03, 0x09])) //HuamiService.COMMAND_ACK_ACTIVITY_DATA, ackByte 09 to keep, 01 to delete from device

            // Parse
            console.log("parsing data now..")
            this.ActivityData.parseData(this.rawActivityData, this.rawStartDate);

            this.dispatchEvent( new CustomEvent('transfer_end', {detail: true}));
            
            // Unhook
            //await this.Band.GATT.stopNotifications(this.Band.Chars.FETCH, this.onFetchRead)
            //await this.Band.GATT.stopNotifications(this.Band.Chars.ACTIVITY_DATA, this.onActivityRead)
            
        }

    }

    async onActivityRead(e) {
        console.log("activityReader notified : ACTIVITY");

        var raw = bufferToUint8Array(e.target.value);

        this.status.currentBatch = raw[0]
        var data = raw.slice(1) // remove batch counter; TODO: ensure that it is the next expected packet

        var stride = 8;  // 8 for activity
        
        if(data.length % stride != 0) {
            console.error("Incorrect data size returned from device.")
        }
        else {
            this.rawActivityData = concatUint8Arrays(this.rawActivityData, data);
        }
    }
}