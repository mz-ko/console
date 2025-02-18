<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="compliance-check-status"
                  @refresh="refreshWidget"
    >
        <div class="compliance-check-status">
            <div class="data-container">
                <div class="summary-wrapper">
                    <!--                    <div class="left-wrapper">-->
                    <!--                        <p class="title">-->
                    <!--                            {{ $t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.CHECKED_SERVICE_ACCOUNT') }}-->
                    <!--                        </p>-->
                    <!--                        <p class="value">-->
                    <!--                            {{ state.accountCount }}-->
                    <!--                        </p>-->
                    <!--                    </div>-->
                    <!--                    <p-divider :vertical="true" />-->
                    <div class="right-wrapper">
                        <p class="title">
                            {{ $t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.TOTAL_COMPLIANCE_NUMBER') }}
                        </p>
                        <p class="value">
                            {{ state.complianceCount === undefined ? '--' : commaFormatter(state.complianceCount) }}
                        </p>
                        <div v-if="state.complianceCountComparingMessage"
                             class="diff-wrapper"
                        >
                            <p-i :name="state.prevComplianceCount < state.complianceCount ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                                 :color="state.prevComplianceCount < state.complianceCount ? red[500] : green[500]"
                            />
                            <span class="diff-value">{{ Math.abs(state.complianceCount - state.prevComplianceCount) }}</span>
                            <span class="diff-text">{{ state.complianceCountComparingMessage }}</span>
                        </div>
                    </div>
                </div>
                <div class="chart-wrapper">
                    <p-data-loader class="chart-loader"
                                   :loading="state.loading"
                                   loader-type="skeleton"
                                   disable-empty-case
                                   :loader-backdrop-opacity="1"
                                   show-data-from-scratch
                    >
                        <div ref="chartContext"
                             class="chart"
                        />
                    </p-data-loader>
                    <div class="legend-wrapper">
                        <div v-for="status in COMPLIANCE_STATUS_MAP_VALUES"
                             :key="`legend-item-${status.name}`"
                             class="legend-item"
                        >
                            <div class="title">
                                <div class="square-mark"
                                     :style="{ backgroundColor: status.color }"
                                />
                                <span class="text">{{ status.label }}</span>
                            </div>
                            <p class="value">
                                {{ state.checkCount === undefined ? '--' : commaFormatter(state.checkCount[status.name]) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { color, percent } from '@amcharts/amcharts5';
import type { Color } from '@amcharts/amcharts5/.internal/core/util/Color';
import { PDataLoader, PI } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { sum } from 'lodash';

import { commaFormatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import type { createPieChart } from '@/common/composables/amcharts5/pie-chart-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { red, green } from '@/styles/colors';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { CloudServiceStatsModel, Severity } from '@/services/dashboards/widgets/_configs/asset-config';
import {
    COMPLIANCE_STATUS_MAP, SEVERITY_STATUS_MAP,
} from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';


interface Data extends CloudServiceStatsModel {
    value: number;
    severity: Severity;
}
interface OuterChartData {
    status: string;
    value: number;
    pieSettings?: {
        fill?: Color;
        stroke?: Color;
    }
}
interface InnerChartData {
    severity: string;
    value: number;
    pieSettings?: {
        fill?: Color;
        stroke?: Color;
    }
}

const COMPLIANCE_STATUS_MAP_VALUES = Object.values(COMPLIANCE_STATUS_MAP);
const SEVERITY_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP);
const DATE_FORMAT = 'YYYY-MM';

const props = defineProps<WidgetProps>();
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    chart: null as null|ReturnType<typeof createPieChart>,
    dateRange: computed<DateRange>(() => ({
        end: dayjs.utc(state.settings?.date_range?.start).format(DATE_FORMAT),
    })),
    outerChartData: computed<OuterChartData[]>(() => COMPLIANCE_STATUS_MAP_VALUES.map((status) => ({
        status: status.label,
        value: state.checkCount?.[status.name],
        pieSettings: {
            fill: color(status.color),
            stroke: color(status.color),
        },
    }))),
    innerChartData: computed<InnerChartData[]>(() => {
        const failCheckDataList = state.data?.filter((d) => d.date === state.dateRange.end && d.key === 'fail_check_count') ?? [];
        const innerChartData: InnerChartData[] = [];
        SEVERITY_STATUS_MAP_VALUES.forEach((severity) => {
            const targetSeverityData = failCheckDataList.find((d) => d.severity === severity.name);
            if (!targetSeverityData) return;
            innerChartData.push({
                severity: severity.label,
                value: targetSeverityData.value,
                pieSettings: {
                    fill: color(severity.color),
                    stroke: color(severity.color),
                },
            });
        });
        return innerChartData;
    }),
    innerChartTooltipText: computed<string>(() => {
        if (!state.innerChartData?.length) return '';
        let text = '';
        const totalFailCheckCount = sum(state.innerChartData.map((d) => d.value));
        state.innerChartData.forEach((d, idx) => {
            const failRate = Math.round((d.value / totalFailCheckCount) * 100);
            if (idx !== 0) text += '\n';
            text += `[${d.pieSettings?.fill.toString()}; fontSize: 14px]●[/] Fail (${d.severity}): ${failRate}%`;
        });
        return text;
    }),
    prevComplianceCount: computed<number|undefined>(() => {
        if (!state.data) return undefined;
        const prevMonth = dayjs.utc(state.settings?.date_range?.start).subtract(1, 'month').format(DATE_FORMAT);
        const targetDataList = state.data.filter((d) => d.date === prevMonth && d.key === 'compliance_count');
        return sum(targetDataList.map((d) => d.value));
    }),
    complianceCount: computed<number|undefined>(() => {
        if (!state.data) return undefined;
        const targetDataList = state.data.filter((d) => d.date === state.dateRange.end && d.key === 'compliance_count');
        return sum(targetDataList.map((d) => d.value));
    }),
    complianceCountComparingMessage: computed<TranslateResult|undefined>(() => {
        if (state.complianceCount === undefined
            || state.prevComplianceCount === undefined
            || state.complianceCount === state.prevComplianceCount
        ) return undefined;
        if (state.prevComplianceCount < state.complianceCount) {
            return i18n.t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.MORE_THAN_PREV_MONTH');
        }
        return i18n.t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.LESS_THAN_PREV_MONTH');
    }),
    checkCount: computed(() => {
        if (!state.data) return undefined;
        const targetDataList = state.data.filter((d) => d.date === state.dateRange.end);
        const passCheckCount = sum(targetDataList.filter((d) => d.key === 'pass_check_count').map((d) => d.value));
        const failCheckCount = sum(targetDataList.filter((d) => d.key === 'fail_check_count').map((d) => d.value));
        return {
            [COMPLIANCE_STATUS_MAP.PASS.name]: passCheckCount,
            [COMPLIANCE_STATUS_MAP.FAIL.name]: failCheckCount,
        };
    }),
    score: computed<number|undefined>(() => {
        if (!state.data) return undefined;
        const targetDataList = state.data.filter((d) => d.date === state.dateRange.end);
        const passScore = sum(targetDataList.filter((d) => d.key === 'pass_score').map((d) => d.value)) ?? 0;
        const failScore = sum(targetDataList.filter((d) => d.key === 'fail_score').map((d) => d.value)) ?? 0;
        const totalScore = passScore + failScore;
        if (totalScore === 0) return 0;
        return Math.round((passScore / totalScore) * 100);
    }),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchCloudServiceStatsAnalyze = getCancellableFetcher<{results: Data[]}>(SpaceConnector.clientV2.inventory.cloudServiceStats.analyze);
const fetchData = async (): Promise<Data[]> => {
    try {
        apiQueryHelper
            .setFilters(state.cloudServiceStatsConsoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' })
            .addFilter({
                k: 'key',
                v: [
                    'compliance_count',
                    'pass_check_count',
                    'fail_check_count',
                    'pass_score',
                    'fail_score',
                ],
                o: '',
            });
        const prevMonth = dayjs.utc(state.settings?.date_range?.start).subtract(1, 'month').format(DATE_FORMAT);
        const { status, response } = await fetchCloudServiceStatsAnalyze({
            query: {
                granularity: 'MONTHLY',
                start: prevMonth,
                end: state.dateRange.end,
                group_by: ['key', 'unit', 'additional_info.severity'],
                fields: {
                    value: {
                        key: 'value',
                        operator: 'sum',
                    },
                },
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response.results;
    } catch (e: any) {
        ErrorHandler.handleError(e);
    }
    return [];
};

/* Util */
const drawChart = (outerChartData: OuterChartData[], innerChartData: InnerChartData[]) => {
    const chart = chartHelper.createDonutChart({
        radius: percent(100),
        innerRadius: percent(80),
        paddingTop: 30,
    });

    // outer
    const outerSeriesSettings = {
        categoryField: 'status',
        valueField: 'value',
        startAngle: 160,
        endAngle: 380,
        radius: percent(250),
        innerRadius: percent(150),
    };
    const outerSeries = chartHelper.createPieSeries(outerSeriesSettings);
    outerSeries.labels.template.set('forceHidden', true);
    outerSeries.ticks.template.set('forceHidden', true);
    chart.series.push(outerSeries);
    outerSeries.slices.template.setAll({
        templateField: 'pieSettings',
        strokeOpacity: 0,
    });
    const outerTooltip = chartHelper.createTooltip();
    chartHelper.setPieTooltipText(outerSeries, outerTooltip);
    outerSeries.slices.template.set('tooltip', outerTooltip);
    outerSeries.data.setAll(outerChartData);

    // inner
    const innerSeriesSettings = {
        categoryField: 'severity',
        valueField: 'value',
        startAngle: 160,
        endAngle: 380,
        radius: percent(100),
        innerRadius: percent(70),
    };
    const innerSeries = chartHelper.createPieSeries(innerSeriesSettings);
    chart.series.push(innerSeries);
    innerSeries.labels.template.set('forceHidden', true);
    innerSeries.ticks.template.set('visible', false);
    innerSeries.slices.template.setAll({
        templateField: 'pieSettings',
        strokeOpacity: 0,
    });
    const innerTooltip = chartHelper.createTooltip({
        labelText: state.innerChartTooltipText,
    });
    innerSeries.slices.template.set('tooltip', innerTooltip);
    innerSeries.data.setAll(innerChartData);

    chartHelper.setPieLabelText(chart, { text: `[fontSize:16px]${i18n.t('DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.COMPLIANCE_SCORE')}[/]:\n[fontSize:32px]${state.score}[/]` });
};

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) {
        chartHelper.clearChildrenOfRoot();
        drawChart(state.outerChartData, state.innerChartData);
    }
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data[]> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) {
        chartHelper.clearChildrenOfRoot();
        drawChart(state.outerChartData, state.innerChartData);
    }
    state.loading = false;
    return state.data;
};

const redrawChart = () => {
    if (chartHelper.root.value) {
        chartHelper.clearChildrenOfRoot();
        drawChart(state.outerChartData, state.innerChartData);
    }
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
    redrawChart,
    redrawOnLanguageChange: true,
});

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

</script>
<style lang="postcss" scoped>
.compliance-check-status {
    .data-container {
        .summary-wrapper {
            display: flex;
            justify-content: space-between;
            margin: 0;
            padding-bottom: 2rem;
            .left-wrapper, .right-wrapper {
                flex: 1 1 auto;
                position: relative;
                padding: 0.375rem 1.5rem;
                .title {
                    padding-bottom: 0.25rem;
                }
                .value {
                    @apply text-display-md;
                }
                .diff-wrapper {
                    @apply text-gray-700;
                    display: flex;
                    align-items: center;
                    .diff-value {
                        @apply text-label-lg;
                        padding-right: 0.25rem;
                    }
                    .diff-text {
                        @apply text-label-sm;
                    }
                }
            }
            .left-wrapper {
                padding-right: 2rem;
            }
            .right-wrapper {
                padding-left: 2rem;
            }
        }
        .chart-wrapper {
            @apply relative grid-cols-12;
            display: grid;
            gap: 1.5rem;
            height: 15rem;
            padding-bottom: 1rem;
            .chart-loader {
                @apply col-span-8;
                .chart {
                    height: 100%;
                }
            }
            .legend-wrapper {
                @apply col-span-4;
                .legend-item {
                    &:first-child {
                        padding-bottom: 1.5rem;
                    }
                    .title {
                        @apply text-label-lg;
                        display: flex;
                        align-items: center;
                        gap: 0.25rem;
                        .square-mark {
                            width: 0.75rem;
                            height: 0.75rem;
                            padding-right: 0.25rem;
                        }
                    }
                    .value {
                        @apply text-display-md;
                    }
                }
            }
        }
    }
}
</style>
