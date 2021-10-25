import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { gray } from '@/styles/colors';
import config from '@/lib/config';


const convertChartData = (data) => {
    // todo: 도넛 차트의 경우, accumulated 는 조회기간의 합을, daily, monthly, yearly 는 조회기간의 마지막 일/월/년 값을 보여준다.
    const convertedData = [{
        category: 'seoul',
        value: 501.9,
    }, {
        category: 'tokyo',
        value: 301.9,
    }, {
        category: 'virginia',
        value: 201.1,
    }, {
        category: 'california',
        value: 165.8,
    }, {
        category: 'frankfurt',
        value: 139.9,
    }, {
        category: 'stockholm',
        value: 128.3,
    }];

    return convertedData;
};

const createValueAxis = (chart) => {
    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 20;
    valueAxis.fontSize = 12;
    valueAxis.extraMax = 0.01;
    valueAxis.renderer.grid.template.strokeOpacity = 1;
    valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
    valueAxis.renderer.labels.template.fill = am4core.color(gray[900]);
    valueAxis.tooltip.label.fontSize = 12;

    return valueAxis;
};

const createSeries = (chart) => {
    const series = chart.series.push(new am4charts.PieSeries());
    series.name = chart.label;
    series.dataFields.value = 'value';
    series.dataFields.category = 'category';
    series.slices.template.stroke = am4core.color('white');
    series.slices.template.strokeOpacity = 1;

    series.labels.template.bent = true;
    series.slices.template.togglable = false;
    series.slices.template.clickable = false;
    series.tooltip.disabled = true;

    return series;
};


export const drawPieChart = (data, chartContainer) => {
    const chart = am4core.create(chartContainer, am4charts.PieChart);
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.paddingLeft = -5;
    chart.paddingBottom = -10;
    chart.data = convertChartData(data);
    chart.responsive.enabled = true;
    chart.innerRadius = am4core.percent(57);

    createSeries(chart);

    return chart;
};