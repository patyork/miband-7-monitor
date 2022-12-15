import ApexCharts from "apexcharts";

const DATAPOINTS = 30;

export class VitalsChart {
    constructor(selector) {
        this.hr = [];
        this.o2 = [];
        const options = {
            chart: {
                type: "line",
                height: "47%",
                animations: {
                    enabled: false,
                },
                sparkline: {
                    enabled: false,
                },


                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true | '<img src="/static/icons/reset.png" width="20">',
                        customIcons: []
                    },
                }

            },
            dataLabels: {
                enabled: false
            },
            colors: ["#14ff3d", "#ff143d"],
            markers: {
                size: 0,
            },
            stroke: {
                curve: "smooth",
                width : 4,
            },
            tooltip: {
                enabled: true,
                x : {
                    format : "M/d h:mmtt",
                },
                shared : true,
            },
            xaxis: {
                type: "datetime",
                labels: {
                    format : "M/d h:mmtt",
                    datetimeUTC: false,
                },
            },
            yaxis: [
                {
                    opposite : true,
                    min: 60,
                    max: 100,
                    labels: {
                        "formatter": function (val) {
                            return val.toFixed(1)
                        }
                    }
                },
                {
                    min: 40,
                    //max: 180,
                    labels: {
                        "formatter": function (val) {
                            return val.toFixed(0)
                        }
                    }
                },
            ],
            series: [
                {
                    name : "Oxygen %",
                    type : 'line',
                    data: this.o2.slice(),
                },
                {
                    name : "Heart Rate",
                    type : 'line',
                    data: this.hr.slice(),
                },
            ],
        };
        /** @type ApexCharts */
        this.chart = new ApexCharts(document.querySelector(selector), options);
        this.chart.render();
    }

    updatehr(date, hr) {
        this.hr.push({
            x: date,
            y: hr,
        });
        this.chart.updateSeries([
            {
                data: this.o2,
            },
            {
                data: this.hr,
            },
        ]);
    }
    updateo2(date, o2) {
        this.o2.push({
            x: date,
            y: o2,
        });
        this.chart.updateSeries([
            {
                data: this.o2,
            },
            {
                data: this.hr,
            },
        ]);
    }
    sethr(data) {
        this.hr = data.slice()
        this.chart.updateSeries([
            {
                data: this.o2,
            },
            {
                data: this.hr,
            },
        ]);
    }
    seto2(data) {
        this.o2 = data.slice()
        this.chart.updateSeries([
            {
                data: this.o2,
            },
            {
                data: this.hr,
            },
        ]);
    }
}

export class SleepChart {
    constructor(selector) {
        this.kind = [];
        this.sleep = [];
        this.deep = [];
        this.rem = [];
        this.intensity = [];
        this.steps = [];
        this.unk = [];
        const options = {
            chart: {
                type: "line",
                height: "47%",
                animations: {
                    enabled: false,
                },
                sparkline: {
                    enabled: false,
                },


                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true | '<img src="/static/icons/reset.png" width="20">',
                        customIcons: []
                    },
                }

            },
            dataLabels: {
                enabled: false
            },
            colors: ["#14ff3d", "#ff143d", "#cccfff", "#fffccc", "#141414", "#414141"],
            markers: {
                size: 0,
            },
            stroke: {
                curve: "smooth",
                width : 2,
            },
            tooltip: {
                enabled: true,
                x : {
                    format : "M/d h:mmtt",
                },
                shared : true,
            },
            xaxis: {
                type: "datetime",
                labels: {
                    format : "M/d h:mmtt",
                    datetimeUTC: false,
                },
            },
            /*yaxis: [
                {
                    opposite : true,
                    min: 60,
                    max: 100,
                    labels: {
                        "formatter": function (val) {
                            return val.toFixed(0)
                        }
                    }
                },
                {
                    min: 40,
                    //max: 180,
                    labels: {
                        "formatter": function (val) {
                            return val.toFixed(0)
                        }
                    }
                },
            ],*/
            series: [
                {
                    name : "Kind",
                    type : 'line',
                    data: this.kind.slice(),
                },
                {
                    name : "Sleep",
                    type : 'line',
                    data: this.sleep.slice(),
                },
                {
                    name : "Deep",
                    type : 'line',
                    data: this.deep.slice(),
                },
                {
                    name : "REM",
                    type : 'line',
                    data: this.rem.slice(),
                },
                {
                    name : "Intensity",
                    type : 'line',
                    data: this.intensity.slice(),
                },
                {
                    name : "Steps",
                    type : 'line',
                    data: this.steps.slice(),
                },
                {
                    name : "Unknown 5",
                    type : 'line',
                    data: this.unk.slice(),
                },
            ],
        };
        /** @type ApexCharts */
        this.chart = new ApexCharts(document.querySelector(selector), options);
        this.chart.render();
    }

    
    set(data1, data2, data3, data4, data5, data6, data7) {
        this.kind = data1.slice()
        this.sleep = data2.slice()
        this.deep = data3.slice()
        this.rem = data4.slice()
        this.intensity = data5.slice()
        this.steps = data6.slice()
        this.unk = data7.slice()
        this.chart.updateSeries([
            {
                data: this.kind,
            },
            {
                data: this.sleep,
            },
            {
                data: this.deep,
            },
            {
                data: this.rem,
            },
            {
                data: this.intensity,
            },
            {
                data: this.steps,
            },
            {
                data: this.unk,
            },
        ]);
    }
}

window.VitalsChart = VitalsChart;
window.SleepChart = SleepChart;
