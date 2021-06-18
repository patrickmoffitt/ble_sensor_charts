'use strict';

var epoch = []
var temperature_c = []
var temp_adjust = -1.3
var humidity_rh = []
var pressure_kpa = []
var gas_ohms = []
var battery_volts = []
var data_rev = 0
var e_gauge = {}
var t_gauge = {
      "axis": {
        "range": [10, 40],
        "dtick": 5
      },
      "steps": [{
        "range": [0, 20],
        "color": "rgba(0, 0, 255, 0.3)"
      }, {
        "range": [20, 24],
        "color": "rgba(0, 255, 0, 0.3)"
      },{
        "range": [24, 40],
        "color": "rgba(255, 0, 0, 0.5)"
      }],
      "threshold": {
        "line": {
          "color": "rgba(245, 229, 27, 1)",
          "width": 3
        },
        "thickness": 2,
        "value": 22
      }
    }

var h_gauge = {
      "axis": {
        "range": [0, 100],
        "dtick": 25
      },
      "steps": [{
        "range": [0, 40],
        "color": "rgba(0, 0, 255, 0.3)"
      }, {
        "range": [40, 60],
        "color": "rgba(0, 255, 0, 0.3)"
      },{
        "range": [60, 100],
        "color": "rgba(255, 0, 0, 0.5)"
      }],
      "threshold": {
        "line": {
          "color": "rgba(245, 229, 27, 1)",
          "width": 3
        },
        "thickness": 2,
        "value": 50
      }
    }

var p_gauge = {
      "axis": {
        "range": [80, 120],
        "dtick": 10 
      },
      "steps": [{
        "range": [80, 95],
        "color": "rgba(0, 0, 255, 0.3)"
      }, {
        "range": [95, 105],
        "color": "rgba(0, 255, 0, 0.3)"
      },{
        "range": [105, 120],
        "color": "rgba(255, 0, 0, 0.5)"
      }],
      "threshold": {
        "line": {
          "color": "rgba(245, 229, 27, 1)",
          "width": 3
        },
        "thickness": 2,
        "value": 100.034
      }
    }

var b_gauge = {
      "axis": {
        "range": [0, 5],
        "dtick": 1
      },
      "steps": [{
        "range": [0, 3],
        "color": "rgba(0, 0, 255, 0.3)"
      }, {
        "range": [3, 4.3],
        "color": "rgba(0, 255, 0, 0.3)"
      },{
        "range": [4.3, 5],
        "color": "rgba(255, 0, 0, 0.5)"
      }],
      "threshold": {
        "line": {
          "color": "rgba(245, 229, 27, 1)",
          "width": 3
        },
        "thickness": 2,
        "value": 4.2
      }
    }

function plot_gauge(dom_gauge, dom_chart, title, value, reference, gauge){
  var data = [{
    domain: { x: [0, 1], y: [0, 1] },
    value: value,
    title: { text: title },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: {reference: reference},
    gauge: gauge
  }];
  var layout = {
    width: 300,
    height: 250,
    margin: { t: 0, b: 0 },
    datarevision: data_rev
  }
  var config = {responsive: true}
  Plotly.react(dom_gauge, data, layout, config)
  document.getElementById(dom_gauge).addEventListener("click",
    function(){
    document.getElementById(dom_chart).style.display = "block"
    window.dispatchEvent(new Event('resize'))
    setTimeout(update_plots, 250)
    document.getElementById(dom_gauge).style.display = "none"
  });
}

function plot_chart(dom_target, title, y_axis){
  var data = [{
    x: epoch,
    y: y_axis,
    mode: 'lines',
    type: 'scatter'
  }]
  var layout = {
    title: { text: title, x: 0},
    height: 300,
    margin: { t: 80, b: 60 },
    xaxis: { tickformat: '%m/%d %I:%M %p' },
    datarevision: data_rev,
    uirevision: 1
  }
  var config = {responsive: true}
  Plotly.react(dom_target, data, layout, config)
}


function reqListener(responseText) {
   if (responseText !== 'undefined') {
     var obj = JSON.parse(responseText)
     epoch = []
     temperature_c = []
     humidity_rh = []
     pressure_kpa = []
     gas_ohms = []
     battery_volts = []
     // console.log(obj.sensor_data)
    for (var idx in obj.sensor_data){
      epoch.push(obj.sensor_data[idx][0])
      temperature_c.push(obj.sensor_data[idx][1] + temp_adjust)
      humidity_rh.push(obj.sensor_data[idx][2])
      pressure_kpa.push(obj.sensor_data[idx][3])
      gas_ohms.push(obj.sensor_data[idx][4])
      battery_volts.push(obj.sensor_data[idx][5])
    }
  }

  // Time notation
  // Regex turns three-word timezone name into abbreviation.
  var tz_abbv = /\(([A-Z])\w*\s([A-Z])\w*\s([A-Z])\w*\)/gm;
  var date_str = new Date().toString()
  var m = tz_abbv.exec(date_str)  
  var tz = ""
  if (m !== null) {
    tz = m[1] + m[2] + m[3]
  }
  var title_date = new Date(epoch[epoch.length-1].replace(" ","T")).toLocaleString("en-US")
  document.getElementById("time").innerHTML = title_date + " " + tz

  // Temperature Gauge
  plot_gauge("temperature_c_gauge", 
             "temperature_c", 
             "Temperature °C", 
             temperature_c[temperature_c.length-1], 
             temperature_c[temperature_c.length-2],
             t_gauge
  )

  // Temperature Chart
  plot_chart('temperature_c', 'Temperature °C', temperature_c)

  // Humidity Gauge
  plot_gauge("humidity_rh_gauge",
             "humidity_rh",
             "Relative Humidity",
             humidity_rh[humidity_rh.length-1],
             humidity_rh[humidity_rh.length-2],
             h_gauge
  )

  // Humidity Chart
  plot_chart("humidity_rh", "Relative Humidity", humidity_rh)

  // Pressure Gauge
  plot_gauge("pressure_kpa_gauge",
             "pressure_kpa",
             "Pressure kPa",
             pressure_kpa[pressure_kpa.length-1],
             pressure_kpa[pressure_kpa.length-2],
             p_gauge
  )

  // Pressure Chart
  plot_chart("pressure_kpa", "Pressure kPa", pressure_kpa)

  // Gas Gauge
  plot_gauge("gas_ohms_gauge",
             "gas_ohms",
             "Gas Ohms",
             gas_ohms[gas_ohms.length-1],
             gas_ohms[gas_ohms.length-2],
             e_gauge
  )

  // Gas Chart
  plot_chart("gas_ohms", "Gas Ohms", gas_ohms)

  // Battery Gauge
  plot_gauge("battery_volts_gauge",
             "battery_volts",
             "Battery Volts",
             battery_volts[battery_volts.length-1],
             battery_volts[battery_volts.length-2],
             b_gauge
  )

  // Battery Chart
  plot_chart("battery_volts", "Battery Volts", battery_volts)
}

var oReq = new XMLHttpRequest()
oReq.onload = function(){ reqListener(oReq.responseText) }
var now = new Date() / 1000;
oReq.open("GET", "/cgi-bin/ble_sensor_cgi?epoch1="+Math.round(now)+"&epoch2=0", true)
oReq.send()

function update_plots() {
  var xhr = new XMLHttpRequest()
  xhr.onload = function() {
    if (xhr.status !== 200) {
      console.log('Error ${xhr.status}: ${xhr.statusText}')
    } else {
      data_rev++
      reqListener(xhr.responseText)
    }
  }
  var now = new Date() / 1000;
  xhr.open("GET", "/cgi-bin/ble_sensor_cgi?epoch1="+Math.round(now)+"&epoch2=0", true)
  xhr.send()
}
window.addEventListener("focus", update_plots);
window.addEventListener("resize", function(){setTimeout(update_plots, 500)});
window.addEventListener("orientationchange", 
  function(){
    setTimeout(update_plots, 250)
  })

setInterval(update_plots, 900000);
