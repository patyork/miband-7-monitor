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
        this.Since = []; // Holds the most recent set of data parsed
        this.NewestDate = null; // Date of the newest record
    }

    parseData(rawData, rawStartDate) {
        this.rawStartDate = rawStartDate
        var stride = 8;  // 8 for activity

        if(rawData.length % stride != 0) {
                    console.error("Incorrect data size returned from device.")
        }

        var date = rawStartDate;
        this.Since = [];
        for(let i=0; i<rawData.length-1;  i+=stride)
        {
            var measurement = rawData.slice(i, i+stride);

            this.parseMeasurement(date, measurement);
            date = dateAdd(date, 'minute', 1)
        }

        // Dedeuplicate and sort
        this.Since = uniqBy(this.Since, JSON.stringify)
        this.Since.sort((a, b) => (a.date > b.date) ? 1 : -1)

        var temp = uniqBy(this.History, JSON.stringify)
        this.History = [...temp]
        this.History.sort((a, b) => (a.date > b.date) ? 1 : -1)
        if(this.History.length > 0) this.NewestDate = this.History[this.History.length-1].date;
    }

    parseMeasurement(date, measurement) {
        var hr = measurement[3] == 255 ? null : measurement[3];
        
        var temp = [
            {
                date : date,
                rawKind : measurement[0],
                rawIntensity : measurement[1],
                steps : measurement[2],
                heartRate : hr,
                unknown1 : measurement[4],
                sleep : measurement[5],
                deepSleep : measurement[6] - 128,  // UINT8 128, should probably be an INT 0
                remSleep : measurement[7],
            }];
        this.History = this.History.concat(temp)
        this.Since = this.Since.concat(temp)
        
        //var message = samples[0] + ", " + samples[1] + ", " + samples[2]
        //console.log(date + " : " + message)
    }
}