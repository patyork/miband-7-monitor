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

        this.rawActivityData = null;
        this.rawStartDate = null;
        this.Data = new ActivityData();
        
        this.iterationCount = 0;
    }

    async readSince(datetime, iterationCount) {
        // Preprocess
        if(datetime == null)
        {
            datetime = new Date();
            datetime = dateAdd(datetime, 'hour', -1);
        }
        datetime = dateToUTCWatchDateArray(datetime);
        if(iterationCount == null) {iterationCount = 0}
        this.iterationCount = iterationCount; // store in object for reference in the Event handler

        // Hook on zeroth iteration
        if(iterationCount == 0) {
            var self = this
            self.listenerOnFetch = async (e) => this.onFetchRead(e)
            self.listenerOnActivity = async (e) => this.onActivityRead(e)

            console.log("ActivityReader : Hooking")
            await this.Band.GATT.startNotifications(this.Band.Chars.FETCH, self.listenerOnFetch)
            await this.Band.GATT.startNotifications(this.Band.Chars.ACTIVITY_DATA, self.listenerOnActivity)
        }

        // Send Start Command 1: Type and Data Type   failure: 10 01 32, timeout    ready: 10 01 01
        await this.Band.Chars.FETCH.writeValueWithoutResponse(
            new Uint8Array([FETCH_COMMANDS.FROM_DATE, FETCH_DATA_TYPES.ACTIVITY_DATA,   ...datetime,   0x00, 0x00])); // [start, type, ..date]
        await new Promise( (resolve, reject) => {
            this.addEventListener('fetch_start', function(e) {
                resolve(e.detail); // done
        });});

        // Send Start Command 2: Begin Transfer
        await this.Band.Chars.FETCH.writeValueWithoutResponse(Uint8Array.from([FETCH_COMMANDS.BEGIN_TRANSFER]));
        this.status.fetchStarted = true;
        await new Promise( (resolve, reject) => {
            this.addEventListener('transfer_end'+iterationCount, function(e) {
                console.log("event : " + 'transfer_end'+iterationCount)
                resolve(e.detail); // done
        });});

        // Unhook on resoution of the zeroth iteration
        if(iterationCount == 0)
        {
            await this.Band.GATT.stopNotifications(this.Band.Chars.FETCH, self.listenerOnFetch)
            await this.Band.GATT.stopNotifications(this.Band.Chars.ACTIVITY_DATA, self.listenerOnActivity)
            console.log("ActivityReader -> Done")
        }
        return true;
    }

    async onFetchRead(e) {
        //                                               Datetime
        // Fetch 1 Sent     :                01 01   e6 07 0c 08 0f 32 00 01
        // Fetch 1 expected : 10 01 01 01 08 00 00   e6 07 0c 08 0f 32 00 01   00
        //                    10 01 01 b1 2c 00 00 e6 07 0c 03 12 28 1e 01 00
        //                    10 01 01 b1 2c 00 00 e6 07 0c 03 12 28 1e 01 00

        var raw = bufferToUint8Array(e.target.value);
        console.log("activityReader notified : FETCH");
        //console.log(raw);

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

             // Clear buffer
             this.rawActivityData = new Uint8Array();

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
            // Acknowledge Fetch     10 02 01 f3 d3 ba e8 success        10 02 32 00 00 00 00 failure to ack
            await this.Band.Chars.FETCH.writeValueWithoutResponse(Uint8Array.from([0x03, 0x09])) //HuamiService.COMMAND_ACK_ACTIVITY_DATA, ackByte 09 to keep, 01 to delete from device

            // Parse
            console.log("parsing data now..")
            this.Data.parseData(this.rawActivityData, this.rawStartDate);

            // Check for additional data
            var iterationCount = this.iterationCount; // store a copy for use after recursion
            var recordCount = this.rawActivityData.length / 8;
            var nextTimestep = dateAdd(this.rawStartDate, 'minute', recordCount)
            if(nextTimestep < new Date())
            {
                console.log("Additional Data from: " + nextTimestep)
                await this.readSince(nextTimestep, iterationCount+1) // recurse
            }
            else {
                console.log("All data read")
            }
            
            // Dispatch that we are done with this Fetch
            console.log("Sending event : " + 'transfer_end'+iterationCount)
            this.dispatchEvent( new CustomEvent('transfer_end'+iterationCount, {detail: true}));
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