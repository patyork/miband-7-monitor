import { convertToInt16Array } from "../tools";

export class BatteryData {
    constructor(rawData) {
        this.rawData = rawData;

        this.currentLevel = 0;
        this.isCharging = false;
        this.lastChargeTime = null;
        //this.lastChargePercent = 0;

        if(rawData != null) {
            this.parseData();
        }
    }

    parseData() {
        if(this.rawData.length == 20) {
            this.currentLevel = this.rawData[1];
            this.isCharging = this.rawData[2] > 0 ? true : false;

            var year = convertToInt16Array([...this.rawData.slice(11, 13)].reverse())[0]
            var month = this.rawData[13] - 1
            var day = this.rawData[14]
            var hour = this.rawData[15]
            var minute = this.rawData[16]
            var second = this.rawData[17]
            //this.lastChargeTime = new Date(Date.UTC(year, month, day, hour, minute, second)) // Battery data is not UTC?
            this.lastChargeTime = new Date(year, month, day, hour, minute, second)
        }
        else if( this.rawData.length == 32 ) // Header included
        {
            var header = raw.slice(0, 11 +1);
            var endpoint = header.slice(9, 10 +1).reverse();
            var command = header[11];
            if( convertToInt16Array(endpoint)[0], CHUNK_ENDPOINTS.BATTERY )
            {
                if(command == CHUNK_RESPONSES.RESULT_OK) {
                    var rawData = raw.slice(12);
                    this.rawData = [...rawData]
                    this.parseData();
                }
            }
        }
    }
}