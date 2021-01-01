let data_files = [ 'nitro5.json', 'x86.json', 'arm.json' ];
let iterable = data_files.map(f => fetch(f).then(r => r.json()).then(data => data));

function build_compare_data (raw) {
  //console.log(raw);
  return {
    name: raw.metadata.platform,
    data: raw.benchmarks.map(lab => {
      let num = 0;
      let sum = 0;

      lab.runs.forEach(run => {
        if (run.values) {
          num += run.values.length;
          sum += run.values.reduce((a, v) => a + v, 0);
        }
      });
      let value = sum / num;

      return {
        name: lab.metadata.name,
        desc: lab.metadata.description,
        value: (value * 1000).toFixed(6), // ms
      }
    }),
  };
}

function render_graph (compare_data) {
  let series = compare_data.map(r => {
    return {
      name: r.name,
      data: r.data.map(r => r.value),
    };
  });
  let cats = compare_data[0].data.map(r => r.name);
  let options = {
      series: series,
      chart: {
      height: Math.max(350, 0.7*window.innerHeight),
      type: 'area'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: { categories: cats, },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + "ms";
        }
      },
    },
  };
  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}

// show time
Promise.all(iterable).then(resp => {
  let compare_data = resp.map(raw => build_compare_data(raw));
  render_graph(compare_data);
});
