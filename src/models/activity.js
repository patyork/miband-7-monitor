import { dateAdd, uniqBy } from "../tools";

export class ActivityData {
    // Construct with Parsed Data
    constructor(parsedData) {

        if(parsedData != null) {
            this.History = [...parsedData];
        }
        else {
            this.History = [];
        }
    }

    parseData(rawData, rawStartDate) {
        this.rawStartDate = rawStartDate
        var stride = 8;  // 8 for activity

        if(rawData.length % stride != 0) {
                    console.error("Incorrect data size returned from device.")
        }

        var date = rawStartDate;
        for(let i=0; i<rawData.length-1;  i+=stride)
        {
            var measurement = rawData.slice(i, i+stride);

            this.parseMeasurement(date, measurement);
            date = dateAdd(date, 'minute', 1)
        }

        // Dedeuplicate and sort
        var temp = uniqBy(this.History, JSON.stringify)
        this.History = [...temp]
        this.History.sort((a, b) => (a.date > b.date) ? 1 : -1)
    }

        /*
        huamiExtendedActivitySample.setRawKind(value[i] & 0xff);
        huamiExtendedActivitySample.setRawIntensity(value[i + 1] & 0xff);
        huamiExtendedActivitySample.setSteps(value[i + 2] & 0xff);
        huamiExtendedActivitySample.setHeartRate(value[i + 3] & 0xff);
        huamiExtendedActivitySample.setUnknown1(value[i + 4] & 0xff);
        huamiExtendedActivitySample.setSleep(value[i + 5] & 0xff);
        huamiExtendedActivitySample.setDeepSleep(value[i + 6] & 0xff);
        huamiExtendedActivitySample.setRemSleep(value[i + 7] & 0xff);
    */

    parseMeasurement(date, measurement) {
        this.History = this.History.concat([
            {
                date : date,
                rawKind : measurement[0],
                rawIntensity : measurement[1],
                steps : measurement[2],
                heartRate : measurement[3],
                unknown1 : measurement[4],
                sleep : measurement[5],
                deepSleep : measurement[6] - 128,  // UINT8 128, should probably be an INT 0
                remSleep : measurement[7],
            }]
        )
        

        //var message = samples[0] + ", " + samples[1] + ", " + samples[2]
        //console.log(date + " : " + message)
    }
}