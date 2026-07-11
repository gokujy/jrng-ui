import { ChartTypeDoc, DocsApiRow, DocsEventRow } from './docs-types';

export const chartTypeDocs: readonly ChartTypeDoc[] = [
  {
    type: 'bar',
    title: 'Bar chart',
    status: 'Stable',
    description:
      'Compares values across categories, such as revenue by quarter or tickets by status.',
    whenToUse: [
      'Use when labels are categories.',
      'Works well when users need to compare exact relative size.',
    ],
    code: `<j-chart type="bar" [data]="barData" ariaLabel="Revenue by quarter"></j-chart>`,
  },
  {
    type: 'line',
    title: 'Line chart',
    status: 'Stable',
    description: 'Shows a trend over ordered points, usually time.',
    whenToUse: [
      'Use for time-series trends.',
      'Use multiple lines when comparing a small number of related series.',
    ],
    code: `<j-chart type="line" [data]="lineData" ariaLabel="Weekly signups"></j-chart>`,
  },
  {
    type: 'pie',
    title: 'Pie chart',
    status: 'Stable',
    description: 'Shows part-to-whole distribution for a small number of categories.',
    whenToUse: ['Use only when there are a few slices and the total is meaningful.'],
    avoid: [
      'Avoid pie charts for many categories.',
      'Avoid when users need precise comparison between similar values.',
    ],
    code: `<j-chart type="pie" [data]="segmentData" ariaLabel="Plan share"></j-chart>`,
  },
  {
    type: 'doughnut',
    title: 'Donut chart',
    status: 'Stable',
    description: 'A pie-style part-to-whole chart with a center opening for compact dashboards.',
    whenToUse: [
      'Use for compact summary cards.',
      'Use when the exact category labels are visible in the legend.',
    ],
    avoid: ['Avoid for trend data or more than five slices.'],
    code: `<j-chart type="doughnut" [data]="segmentData" ariaLabel="Plan share"></j-chart>`,
  },
  {
    type: 'area',
    title: 'Area chart',
    status: 'Stable',
    description: 'A line chart with filled area, useful for showing volume over time.',
    whenToUse: ['Use when cumulative volume matters more than exact point comparison.'],
    code: `<j-chart type="line" [data]="areaData" [options]="areaOptions" ariaLabel="Usage volume"></j-chart>`,
  },
  {
    type: 'scatter',
    title: 'Scatter chart',
    status: 'Stable',
    description: 'Plots x/y points to reveal correlation, clusters, and outliers.',
    whenToUse: ['Use for numeric relationships such as price vs. conversion rate.'],
    code: `<j-chart type="scatter" [data]="scatterData" ariaLabel="Cost and conversion scatter"></j-chart>`,
  },
  {
    type: 'radar',
    title: 'Radar chart',
    status: 'Stable',
    description: 'Compares several measurements across the same set of dimensions.',
    whenToUse: ['Use for a small number of comparable profiles and clearly labelled dimensions.'],
    code: `<j-chart type="radar" [data]="radarData" ariaLabel="Product capability comparison"></j-chart>`,
  },
  {
    type: 'polarArea',
    title: 'Polar area chart',
    status: 'Stable',
    description: 'Compares category magnitude using equal-angle radial segments.',
    whenToUse: ['Use for a compact category comparison where radial presentation is meaningful.'],
    code: `<j-chart type="polarArea" [data]="categoryData" ariaLabel="Orders by channel"></j-chart>`,
  },
  {
    type: 'bubble',
    title: 'Bubble chart',
    status: 'Stable',
    description: 'Plots x/y relationships with a third numeric value represented by radius.',
    whenToUse: ['Use when all three numeric dimensions are important and units are explained.'],
    code: `<j-chart type="bubble" [data]="bubbleData" ariaLabel="Cost, conversion, and volume"></j-chart>`,
  },
  {
    type: 'mixed',
    title: 'Mixed chart',
    status: 'Stable',
    description: 'Combines dataset-level Chart.js types in one coordinated chart.',
    whenToUse: ['Use sparingly when series share a meaningful axis and need different marks.'],
    code: `<j-chart type="mixed" [data]="mixedData" ariaLabel="Orders and revenue trend"></j-chart>`,
  },
];

export const chartInputs: readonly DocsApiRow[] = [
  {
    name: 'type',
    type: 'JChartType',
    defaultValue: "'bar'",
    description:
      'Chart.js chart type. JRNG supports bar, line, pie, doughnut, radar, polarArea, scatter, bubble, and mixed.',
  },
  {
    name: 'data',
    type: 'unknown',
    defaultValue: 'null',
    description: 'Chart.js data object with labels and datasets.',
  },
  {
    name: 'options',
    type: 'Record<string, unknown> | null',
    defaultValue: 'null',
    description: 'Chart.js options object. JRNG merges responsive defaults and events.',
  },
  {
    name: 'plugins',
    type: 'readonly unknown[]',
    defaultValue: '[]',
    description: 'Optional Chart.js plugins.',
  },
  {
    name: 'width / height',
    type: 'number',
    defaultValue: '0',
    description: 'Canvas dimensions. Leave at 0 for responsive sizing.',
  },
  {
    name: 'responsive',
    type: 'boolean',
    defaultValue: 'true',
    description: 'Enables responsive Chart.js behavior.',
  },
  {
    name: 'loading',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Shows the built-in loading state instead of rendering the canvas.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    defaultValue: "'No chart data available.'",
    description: 'Message shown when data has no datasets or labels.',
  },
  {
    name: 'ariaLabel',
    type: 'string',
    defaultValue: "'Chart'",
    description: 'Accessible description for the canvas.',
  },
  {
    name: 'styleClass',
    type: 'string',
    defaultValue: "''",
    description: 'Custom class on the chart host.',
  },
];

export const chartEvents: readonly DocsEventRow[] = [
  {
    event: 'chartClick',
    payload: 'JChartInteractionEvent',
    description: 'Emits Chart.js click event, active elements, and chart instance.',
  },
  {
    event: 'chartHover',
    payload: 'JChartInteractionEvent',
    description: 'Emits Chart.js hover event, active elements, and chart instance.',
  },
];

export const chartInstallCode = `npm install chart.js`;

export const chartDataCode = `barData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { label: 'Revenue', data: [42, 58, 64, 73] }
  ]
};

segmentData = {
  labels: ['Starter', 'Pro', 'Enterprise'],
  datasets: [
    { label: 'Customers', data: [48, 36, 16] }
  ]
};`;

export const chartOptionsCode = `lineOptions = {
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (context) => '$' + context.parsed.y.toLocaleString()
      }
    }
  },
  scales: {
    x: { ticks: { maxRotation: 0, autoSkip: true } },
    y: { beginAtZero: true }
  }
};`;
