import { dateAdd, uniqBy } from "../tools";
import { ACTIVITY_CATEGORY, ACTIVITIES } from "../constants";

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
        this.Since = this.postProcess(this.Since);
        this.Since = uniqBy(this.Since, JSON.stringify)
        this.Since.sort((a, b) => (a.date > b.date) ? 1 : -1)

        
        this.History = this.postProcess(this.History);
        this.History = uniqBy(this.History, JSON.stringify)
        this.History.sort((a, b) => (a.date > b.date) ? 1 : -1)
        if(this.History.length > 0) this.NewestDate = this.History[this.History.length-1].date;
    }

    postProcess(data) {
        // Moving Average

        return [...data] // copy and return
    }

    parseMeasurement(date, measurement) {
        var rawKind = measurement[0];
        var rawIntensity = measurement[1];
        var rawSteps = measurement[2];
        var hr = measurement[3] == 255 ? null : measurement[3];
        var unknown1 = measurement[4];
        var sleep = measurement[5];
        var deepSleep = measurement[6];
        var remSleep = measurement[7];

        var category = ACTIVITY_CATEGORY.OFF;
        var steps = null;

        // Post Process
        //temp.deepSleep = temp.deepSleep - 128;  // UINT8 128, should probably be an INT 0
        //temp.remSleep = temp.remSleep - 128;  // UINT8 127 or 128??, should probably be an INT 0.
        //if(temp.remSleep == -128) temp.remSleep = 0; // Seems to be offset??
        if(rawKind == ACTIVITIES.NOT_WORN ||
            rawKind == ACTIVITIES.CHARGING)
        {
            category = ACTIVITY_CATEGORY.OFF
        }
        else if(rawKind == ACTIVITIES.SLEEP)
        {
            steps = null; // No sleepwalking!
            category = ACTIVITY_CATEGORY.LIGHT_SLEEP; // Assume Light Sleep

            if(remSleep > deepSleep)
            {
                category = ACTIVITY_CATEGORY.REM_SLEEP;
            }
            else if(remSleep == deepSleep)
            {
                category = ACTIVITY_CATEGORY.DEEP_SLEEP;
            }
        }
        else if(rawKind == ACTIVITIES.INACTIVE ||
            rawKind == ACTIVITIES.CALIBRATING)
        {
            category = ACTIVITY_CATEGORY.INACTIVE;
            steps = rawSteps;
        }
        else
        {
            category = ACTIVITY_CATEGORY.ACTIVE;
            steps = rawSteps;
        }

        var temp = [
            {
                date : date,
                rawKind : rawKind,
                rawIntensity : rawIntensity,
                rawSteps : rawSteps,
                heartRate : hr,
                unknown1 : unknown1,
                sleep : sleep,
                deepSleep : deepSleep,
                remSleep : remSleep,

                category : category,
                categoryRaw : category,
                steps : steps,
            }];
        console.log(temp)


        this.History = this.History.concat(temp)
        this.Since = this.Since.concat(temp)
        
        //var message = samples[0] + ", " + samples[1] + ", " + samples[2]
        //console.log(date + " : " + message)
    }
}