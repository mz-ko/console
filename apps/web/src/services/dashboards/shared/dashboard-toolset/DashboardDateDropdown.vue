<template>
    <div class="dashboard-date-dropdown">
        <p-select-dropdown
            style-type="transparent"
            :items="monthMenuItems"
            :selected="selectedMonthMenuIndex"
            index-mode
            menu-position="right"
            @select="handleSelectMonthMenuItem"
        >
            <div>
                <span>{{ selectedMonthLabel }}</span>
                <p-badge
                    v-if="selectedMonthBadge"
                    style-type="indigo100"
                    badge-type="subtle"
                    class="ml-1"
                >
                    {{ selectedMonthBadge }}
                </p-badge>
            </div>
            <template #menu-item--format="{ item }">
                <div>
                    <span>{{ item.label }}</span>
                    <p-badge
                        v-if="item.badge"
                        style-type="indigo100"
                        badge-type="subtle"
                        class="ml-1"
                    >
                        {{ item.badge }}
                    </p-badge>
                </div>
            </template>
        </p-select-dropdown>
        <custom-date-range-modal :visible.sync="customRangeModalVisible"
                                 granularity="MONTHLY"
                                 :selected-date-range="dateRange"
                                 @confirm="handleCustomRangeModalConfirm"
        />
    </div>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import { PBadge, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';
import { range } from 'lodash';

import { i18n } from '@/translations';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';

import type { DateRange } from '@/services/dashboards/config';
import CustomDateRangeModal from '@/services/dashboards/widgets/_components/CustomDateRangeModal.vue';

export default defineComponent({
    name: 'DashboardDateDropdown',
    components: {
        CustomDateRangeModal,
        PBadge,
        PSelectDropdown,
    },
    props: {
        dateRange: {
            type: Object as PropType<DateRange>,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const { i18nDayjs } = useI18nDayjs();
        const state = reactive({
            getMonthMenuItem: computed(() => {
                const monthData: MenuItem[] = [];
                range(12).forEach((i) => {
                    monthData.push({
                        type: 'item',
                        label: i18nDayjs.value.utc(dayjs.utc().format('YYYY-MM-DD')).subtract(i, 'month').format('MMMM YYYY'),
                        name: dayjs.utc().subtract(i, 'month').format('YYYY-MM'),
                    });
                });
                return monthData;
            }),
            monthMenuItems: computed<MenuItem[]>(() => ([
                {
                    type: 'item',
                    name: 'current',
                    label: i18n.t('DASHBOARDS.DETAIL.CURRENT_MONTH'),
                    badge: i18n.t('DASHBOARDS.DETAIL.AUTO'),
                },
                ...state.getMonthMenuItem,
                { type: 'divider' },
                {
                    type: 'item',
                    name: 'custom',
                    label: i18n.t('DASHBOARDS.DETAIL.CUSTOM'),
                },
            ])),
            selectedMonthLabel: computed(() => state.monthMenuItems[state.selectedMonthMenuIndex]?.label),
            selectedMonthBadge: computed(() => state.monthMenuItems[state.selectedMonthMenuIndex]?.badge),
            selectedMonthName: computed(() => state.monthMenuItems[state.selectedMonthMenuIndex]?.name),
            selectedDateRange: {},
            selectedMonthMenuIndex: 0,
            customRangeModalVisible: false,
        });

        const setSelectedDateRange = (start, end) => {
            const _start = dayjs.utc(start).startOf('month').format('YYYY-MM-DD');
            const _end = dayjs.utc(end).endOf('month').format('YYYY-MM-DD');
            state.selectedDateRange = { start: _start, end: _end };
        };

        const handleSelectMonthMenuItem = (selectedIndex: number) => {
            state.selectedMonthMenuIndex = selectedIndex;
            if (state.monthMenuItems[selectedIndex].name === 'current') {
                state.selectedDateRange = { start: undefined, end: undefined };
                emit('update:date-range', state.selectedDateRange);
            } else if (state.monthMenuItems[selectedIndex].name === 'custom') state.customRangeModalVisible = true;
            else {
                setSelectedDateRange(state.monthMenuItems[selectedIndex].name, state.monthMenuItems[selectedIndex].name);
                emit('update:date-range', state.selectedDateRange);
            }
        };
        const handleCustomRangeModalConfirm = (dateRange: DateRange) => {
            const { start, end } = dateRange;
            setSelectedDateRange(start, end);
            emit('update:date-range', state.selectedDateRange);
            state.customRangeModalVisible = false;
        };

        const setInitialDateRange = () => {
            const _current = dayjs.utc();
            const _start = dayjs.utc(props.dateRange?.start);
            const _end = dayjs.utc(props.dateRange?.end);

            // 1. default month => start is (month 'current' + day '1'), end is (month 'current + day 'today')
            // Index 0 is 'Current' menu index

            if (!props.dateRange?.start
                || !props.dateRange?.end
                || (_start.isSame(_current.startOf('month'), 'day')
                && _end.isSame(_current, 'day'))
            ) {
                return 0;
            }

            // 2. some month => start is (month 'n' + day '1'), end is (month 'n' + day '{last day}')
            if (_start.isSame(_end, 'month')
                && _start.isSame(_start.startOf('month'), 'day')
                && _end.isSame(_end.endOf('month'), 'day')
            ) {
                const itemIndex = state.monthMenuItems.findIndex((d) => d.name === _start.format('YYYY-MM'));
                if (itemIndex > -1) return itemIndex;
            }

            // 3. custom => else cases.
            // The Last index is 'Custom' menu index.
            return state.monthMenuItems.length - 1;
        };

        watch(() => props.dateRange, () => {
            state.selectedMonthMenuIndex = setInitialDateRange();
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleSelectMonthMenuItem,
            handleCustomRangeModalConfirm,
        };
    },
});
</script>
<style lang="postcss" scoped>
.dashboard-date-dropdown {
    /* custom design-system component - p-select-dropdown */
    :deep(.p-select-dropdown) {
        min-width: auto;
    }
}
</style>
