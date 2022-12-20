import { ADVERTISEMENT_SERVICE, CHAR_UUIDS, SERVICE_UUIDS, CHUNK_ENDPOINTS, CHUNK_COMMANDS, FETCH_COMMANDS, FETCH_DATA_TYPES } from "../constants.js";
import { toHexString, bufferToUint8Array, arraysEqual, concatUint8Arrays } from "../tools.js";
import { BatteryData } from "../models/battery.js";

export class batteryReader extends EventTarget {
    constructor(band) {
        super()
        this.Band = band;

        this.rawBatteryData = null;
        this.Data = null;
    }

    async Read() {
        var self = this
        self.listenerOnChunked = async (e) => this.onChunkedRead(e)

        // Hook
        await this.Band.GATT.startNotifications(this.Band.Chars.CHUNKED_READ, self.listenerOnChunked)

        // await x.writeChunk(0x0029, [0x03]);
        // 03 03 00 56 00 15 00 00 00 29 00 04 0f 21 00 3a 08 02 05 16 1c 10 e0 3a 08 02 05 16 1c 10 e0 00
        // 03 03 00 9c 00 15 00 00 00 29 00 04 0f 63 00 e6 07 0c 0a 0f 1b 34 e0 e6 07 0c 0a 0f 1b 34 e0 64
        await this.Band.writeChunk(CHUNK_ENDPOINTS.BATTERY, [CHUNK_COMMANDS.BATTERY_GET_STATUS]);

        await new Promise( (resolve, reject) => {
            this.addEventListener('battery_end', function(e) {
                resolve(e.detail); // done
        });});

        // Unhook
        await this.Band.GATT.stopNotifications(this.Band.Chars.CHUNKED_READ, self.listenerOnChunked)
    }

    async onChunkedRead(e) {
        console.log("Battery notified");

        var raw = bufferToUint8Array(e.target.value);
        
        if(raw.length == 32) {
            this.parseRaw(raw)

            this.dispatchEvent( new CustomEvent('battery_end', {detail: true}));
        }
    }

    parseRaw(raw) {
        console.log("Parsing Raw Battery Data...")
        
        if(raw.length == 32) {
            var header = raw.slice(0, 12); // TODO: Parse header to ensure this is a BATTERY,RESULT_OK
            var rawData = raw.slice(12);

            this.rawBatteryData = [...rawData];
            this.Data = new BatteryData(this.rawBatteryData);
            console.log(this.Data);
        }
    }
}