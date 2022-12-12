import { ADVERTISEMENT_SERVICE, CHAR_UUIDS, SERVICE_UUIDS, CHUNK_ENDPOINTS, CHUNK_COMMANDS, FETCH_COMMANDS, FETCH_DATA_TYPES, CHUNK_RESPONSES } from "./constants.js";
import { toHexString, bufferToUint8Array, invertDictionary, arraysEqual, convertToInt16Array } from "./tools.js";

import { Authenticator } from "./components/authenticate.js";
import { sp02Reader } from "./components/sp02.js";
import { batteryReader } from "./components/battery.js";
import { activityReader } from "./components/activity.js";

export class Band7 {
    /**
     * @param {String} authKey
     *   Hex representation of the auth key (https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Huami-Server-Pairing)
     *   Example: '94359d5b8b092e1286a43cfb62ee7923'
     */
    constructor(authKey) {
        if (!authKey.match(/^[a-zA-Z0-9]{32}$/)) {
            throw new Error(
                "Invalid auth key, must be 32 hex characters such as '94359d5b8b092e1286a43cfb62ee7923'"
            );
        }
        this.Device = null;
        this.GATT = null;
        this.authKey = authKey;
        this.Services = {};
        this.Chars = {};
        this.handle = 0;

        this.Auth, this.sp02Reader, this.batteryReader = null; // Readers

        
        this.inverted_services = invertDictionary(SERVICE_UUIDS);
        this.inverted_chars = invertDictionary(CHAR_UUIDS);
        this.last_generic_event = null;
    }

    getNextHandle() {
        //console.log("handle: " + this.handle)
        return this.handle++;
    }

    async init() {

        const device = await navigator.bluetooth.requestDevice({
            filters: [{services: [ADVERTISEMENT_SERVICE],},],
        });

        this.Device = device
        this.Auth = new Authenticator(this);
        this.GATT = await this.Auth.connect();

        // Helper function to start/stop the BLE notify workflow on a Characteristic
        this.GATT.startNotifications = async (char, cb) => {
            await char.startNotifications();
            char.addEventListener("characteristicvaluechanged", cb);
        }
        this.GATT.stopNotifications = async (char, cb) => {
            //await char.stopNotifications();
            char.removeEventListener("characteristicvaluechanged", cb);
        }


        console.log("Initializing Services and Characteristics");
        var service_keys = Object.keys(SERVICE_UUIDS);
        var service_uuids = Object.values(SERVICE_UUIDS);
        var char_keys = Object.keys(CHAR_UUIDS);
        var char_uuids = Object.values(CHAR_UUIDS);
        
        // Programatically discover services and characteristics
        await Promise.all(service_keys.map(async (key) => {
            try {
                var s = await this.GATT.getPrimaryService(SERVICE_UUIDS[key]);

                try {
                    const cs = await s.getCharacteristics();
                    s.characteristics = cs;

                    cs.map(async (char) => {
                        var name = this.inverted_chars[char.uuid]
                        this.Chars[name] = char
                    });
                }
                catch (error) {
                    console.log("Service " + key + " has no characteristics")
                }
                this.Services[key] = s;
                return s
            }
            catch (error) {
                console.log("Debug : No Service " + key + " " + SERVICE_UUIDS[key]);
            }
        }));
        console.log("Services and CharacteristicsInitialized");


        console.log("Initializing Logging Events (Bluetooth 'notifications')");
        await Object.keys(this.Chars).map(async (char_name) => {
            if (this.Chars[char_name].properties.notify)
            {
                await this.GATT.startNotifications(this.Chars[char_name], this.Generic_Event);
            }
        });
        console.log("Logging Events (Bluetooth 'notifications') Initializing");

        this.isAuthenticated = await this.Auth.authenticate();


        if(this.isAuthenticated) {
            console.log("Auth'd");

            this.sp02Reader = new sp02Reader(this);
            this.batteryReader = new batteryReader(this);
            this.activityReader = new activityReader(this);

            // Read sp02 Data
            //await this.sp02Reader.readSince(new Date());

            // Read Battery Data
            //await this.batteryReader.Read();

            // Read Activity Data
            await this.activityReader.readSince(new Date());

            // Hook async READ events (Battery, Connection, etc.)
            await this.GATT.startNotifications(this.Chars.CHUNKED_READ, async (e) => this.onChunkedRead(e))

        }
        else { // TODO
            console.log('Error')
        }
        

    }

    async Generic_Event(e) {
        //console.log(e);
        var target_char_name = invertDictionary(CHAR_UUIDS)[e.target.uuid]
        var target_service_name = invertDictionary(SERVICE_UUIDS)[e.target.service.uuid]
        var data = bufferToUint8Array(e.target.value);
        console.log("=====" + target_service_name + " -> " + target_char_name + " -> Received Generic Data (as Uint8) : =====");
        console.log(toHexString(data));
        console.log(data);

        if(target_char_name == "ACTIVITY_DATA")
        {
            console.log(data);
            console.log(data.toString());
            var sequenceNumber = data[0]
            /*data = data.slice(1) // remove batch counter
            var stride = 65;  //8 for activity 0x01, 65 for sp02
            for(let i=0; i<data.length-1;  i+=stride)
            {
                var message = "";
                if(data[i] != 0) { console.log('Version or Data Type?: ' + data[i])}

                console.log(data.slice(i+1, i+5).reverse());

                var timestamp = convertToInt32(data.slice(i+1, i+5).reverse())[0]
                var date = new Date(timestamp * 1000);

                for(let j=0; j<stride; j+=1)
                {
                    message += data[i+j] + ", "
                }
                console.log(date + " : " + message)
                //console.log(data[i]+", "+data[i+1]+", "+data[i+2]+", "+data[i+3]+", "+data[i+4]+", "+data[i+5]+", "+data[i+6]+", "+data[i+7])
            }
            */
        }
        
        console.log("==========")
    }
    async onChunkedRead(e) {
        console.log(" Main : CHUNK_READ")
        var raw = bufferToUint8Array(e.target.value);

        if(raw.length >= 12) {
            var header = raw.slice(0, 11+1);
            var endpoint = header.slice(9, 10+1).reverse();
            var command = header[11];

            // Battery
            if( convertToInt16Array(endpoint)[0], CHUNK_ENDPOINTS.BATTERY )
            {
                if(command == CHUNK_RESPONSES.RESULT_OK) {
                    this.batteryReader.parseRaw(raw);
                }
            }
        }
    }


    async writeChunkedValue(char, type, handle, data) {
        await this.writeChunkedValueFlags(char, type, handle, data, 0)
    }
    async writeChunkedValueFlags(char, type, handle, data, base_flags) {
        //console.log("writing " + handle)
        //console.log(data)
        console.log(base_flags)

        let remaining = data.length;
        let count = 0;
        let header_size = 11;
        const mMTU = 23;

        while (remaining > 0) {
            const MAX_CHUNKLENGTH = mMTU - 3 - header_size;
            const copybytes = Math.min(remaining, MAX_CHUNKLENGTH);
            const chunk = new Uint8Array(copybytes + header_size);

            let flags = base_flags;
            console.log("loop: " + flags)

            if (count == 0) {
                let i = 5;
                // Endpoint 0x0a seems to take different flag, and that affects length?
                chunk[5] = (data.length - flags) & 0xff;
                chunk[6] = ((data.length - flags) >> 8) & 0xff;
                chunk[7] = ((data.length - flags) >> 16) & 0xff;
                chunk[8] = ((data.length - flags) >> 24) & 0xff;
                chunk[9] = type & 0xff;
                chunk[10] = (type >> 8) & 0xff;
                flags |= 0x01;
                //# [0, 0, 0, 0, 0, 1, 0, 0, 0, 40, 0, 0]
            }
            if (remaining <= MAX_CHUNKLENGTH) {
                flags |= 0x06; // last chunk?
                //# 0x07
            }
            chunk[0] = 0x03;
            chunk[1] = flags;
            chunk[2] = 0;
            chunk[3] = handle;
            chunk[4] = count;
            //#     [3, 7, 0, 8, 0, 1, 0, 0, 0, 40, 0, 0]

            chunk.set(
                data.slice(
                    data.length - remaining,
                    data.length - remaining + copybytes
                ),
                header_size
            );
            //#     [3, 7, 0, 8, 0, 1, 0, 0, 0, 40, 0, 1
            //console.log(chunk)
            console.log("Sending: " + toHexString(chunk));
            await char.writeValue(chunk);
            remaining -= copybytes;
            header_size = 5;
            count++;
        }
    }
    async writeChunkFlags(type, command, flags) {
        console.log(flags);
        await this.writeChunkedValueFlags(
            this.Chars.CHUNKED_WRITE,
            type,
            this.getNextHandle(),
            command,
            flags
        );

    }
    async writeChunk(type, command) {

        await this.writeChunkedValue(
            this.Chars.CHUNKED_WRITE,
            type,
            this.getNextHandle(),
            command
        );

    }


    async onAuthenticated() {
        console.log("Authentication successful");
        window.dispatchEvent(new CustomEvent("authenticated"));
        //await this.measureHr();

        /*
        // Do 1: Get current time
        var current_time = bufferToUint8Array( await this.chars.CURRENT_TIME.readValue() );
        console.log(current_time);
        console.log(toHexString(current_time));
        */

        /*
        // Do 2: Set current time
        await this.chars.CURRENT_TIME.writeValue(new Uint8Array([230, 7, 12,  7,  16, 27,  3,  3,  0, 0, 224]))

        // Do 3: Get current time
        current_time = bufferToUint8Array( await this.chars.CURRENT_TIME.readValue() );
        console.log(current_time);
        console.log(toHexString(current_time));
        */

        /*
        // Do 4: Read current battery
        await this.writeChunk(CHUNK_ENDPOINTS.BATTERY, [CHUNK_COMMANDS.BATTERY_GET_STATUS]);
        */

        // Connection - Responds on CHUNK_READ
        //await this.writeChunk(CHUNK_ENDPOINTS.CONNECTION, [CHUNK_COMMANDS.READ]);
        


        /*
        await this.chars.FETCH.writeValueWithoutResponse(new Uint8Array([0x01, 0x01, 0xe6, 0x07, 0x0c, 0x08, 0x01, 0x01, 0x01, 0x01])); // [start, start, ..date]
        await this.chars.FETCH.writeValueWithoutResponse(Uint8Array.from([0x02])) // COMMAND_FETCH_DATA
        await this.chars.FETCH.writeValueWithoutResponse(Uint8Array.from([0x03, 0x09])) //HuamiService.COMMAND_ACK_ACTIVITY_DATA, ackByte 09 to keep, 01 to delete from device
        */

         //COMMAND_ACTIVITY_DATA_START_DATE

        //await this.writeChunk(0x001d, [0x04, 0x01])

        // COMMAND_ACTIVITY_DATA_TYPE_ACTIVTY 0x01
        // COMMAND_ACTIVITY_DATA_START_DATE 0x01
        // support.getTimeBytes(sinceWhen, support.getFetchOperationsTimeUnit()))
        // fetchBytes = [COMMAND_ACTIVITY_DATA_START_DATE, COMMAND_ACTIVITY_DATA_TYPE_ACTIVTY, 8 bytes of time data] // should only be 2 bytes of time? how? year,year,month,dayofmonth,hour,minute
        // [0x01, 0x01, 0xe6, 0x07, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01]
        // to characteristic fetch?
        // x.chars.FETCH.writeValueWithoutResponse(new Uint8Array([0x01, 0x01, 0xe6, 0x07, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01])); 
        // 10 01 01 a6 01 00 00 e6 07 0c 03 12 0c 00 01 00
        // 10 01 32
        // x.chars.FETCH.writeValueWithoutResponse(new Uint8Array([0x02]));
        // x.chars.FETCH.writeValueWithoutResponse(new Uint8Array([0x03, 0x09]));  // ack but don't delete data


    }

    
}

window.Band7 = Band7;
