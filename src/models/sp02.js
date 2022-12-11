export class Sp02Data {
    // Construct with Parsed Data
    constructor(parsedData) {

        if(parsedData != null) {
            this.sp02History = [...parsedData];
        }
        else {
            this.sp02History = [];
        }
    }

    parseData(rawData) {
        var stride = 65;  //65 for sp02

        if(rawData.length % stride != 0) {
                    console.error("Incorrect size returned from device.")
        }

        for(let i=1; i<rawData.length-1;  i+=stride) // start at 1 to skip the version placeholder
            {
                //console.log("striding")
                var measurement = rawData.slice(i, i+stride);

                this.parseMeasurement(measurement);
            }
    }

    parseMeasurement(measurement) {
        var timestamp = convertToInt32(measurement.slice(0, 0+4).reverse())[0]
        var date = new Date(timestamp * 1000);
        var samples = measurement.slice(4, 4+3);
        var unused = measurement.slice(7);
        this.addMeasurementToHistory(date, samples);

        // data consists of a Date and 3 samples; all the rest are zeros practice. Warn if something changes.
        if(unused.reduce((a, b) => a + b, 0) > 0) {
            console.error("Unknown data in sp02 samples!")
        }

        //var message = samples[0] + ", " + samples[1] + ", " + samples[2]
        //console.log(date + " : " + message)
    }

    addMeasurementToHistory(date, samples) {
        // One Measurement contains 3? samples, last one can be zero if the measurement wasn't perfect (movement, etc)
        var nonzero_samples = samples.filter(val => val != 0)
        this.sp02History = this.sp02History.concat([
            {
                date : date,
                samples : samples,
                average : nonzero_samples.reduce((a, b) => a + b) / nonzero_samples.length, // average, excl. zeros
            }]
        )
    }
}