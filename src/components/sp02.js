import { ADVERTISEMENT_SERVICE, CHAR_UUIDS, SERVICE_UUIDS, CHUNK_ENDPOINTS, CHUNK_COMMANDS, FETCH_COMMANDS, FETCH_DATA_TYPES } from "../constants.js";

export class sp02Reader extends EventTarget {
    constructor(band) {
        super()
        this.Band = band;
    }

    async readSince(datetime) {
        // Hook
        await this.Band.GATT.startNotifications(this.Band.Chars.FETCH, async (e) => this.onFetchRead(e))
        await this.Band.GATT.startNotifications(this.Band.Chars.ACTIVITY_DATA, async (e) => this.onActivityRead(e))

        // Send Start Commands   failure: 10 01 32
    }

    async onFetchRead(e) {
        
    }
}