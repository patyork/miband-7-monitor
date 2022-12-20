import { convertToInt32Array, uniqBy } from "../tools";
export class Sp02Data {
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

    parseData(rawData) {
        var stride = 65;  //65 for sp02

        if(rawData.length % stride != 0) {
                    console.error("Incorrect size returned from device.")
        }

        var newData = [];
        for(let i=1; i<rawData.length-1;  i+=stride) // start at 1 to skip the version placeholder
        {
            //console.log("striding")
            var measurement = rawData.slice(i, i+stride);

            var temp = this.parseMeasurement(measurement);
            var date = temp[0];
            var samples = temp[1];
            var nonzero_samples = samples.filter(val => val != 0)
            newData = newData.concat([
                {
                    date : date,
                    samples : samples,
                    average : nonzero_samples.reduce((a, b) => a + b) / nonzero_samples.length, // average, excl. zeros
                }]
            )
        }
        
        if(newData.length == 0) {
            this.Since = [];
            return;
        }
        
        // Dedeuplicate, sort, and store
        this.Since = uniqBy(newData, JSON.stringify)
        this.Since.sort((a, b) => (a.date > b.date) ? 1 : -1)

        var temp = uniqBy(this.History, JSON.stringify)
        this.History = [...temp]
        this.History.sort((a, b) => (a.date > b.date) ? 1 : -1)
        if(this.History.length > 0) this.NewestDate = this.History[this.History.length-1].date;
    }

    parseMeasurement(measurement) {
        var timestamp = convertToInt32Array(measurement.slice(0, 0+4).reverse())[0]
        var date = new Date(timestamp * 1000);
        var samples = measurement.slice(4, 4+3);
        var unused = measurement.slice(7);
        this.addMeasurementToHistory(date, samples);

        // data consists of a Date and 3 samples; all the rest are zeros practice. Warn if something changes.
        if(unused.reduce((a, b) => a + b, 0) > 0) {
            console.error("Unknown data in sp02 samples!");
            console.warn(measurement);
        }

        //var message = samples[0] + ", " + samples[1] + ", " + samples[2]
        //console.log(date + " : " + message)
        return [date, samples]
    }

    addMeasurementToHistory(date, samples) {
        // One Measurement contains 3? samples, last one can be zero if the measurement wasn't perfect (movement, etc)
        var nonzero_samples = samples.filter(val => val != 0)
        this.History = this.History.concat([
            {
                date : date,
                samples : samples,
                average : nonzero_samples.reduce((a, b) => a + b) / nonzero_samples.length, // average, excl. zeros
            }]
        )
    }
}