import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const costTrendWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costTrend',
    base_configs: [{ config_id: 'baseTrend' }],
    title: 'Cost Trend',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_TREND.DESC',
        preview_image: 'widget-img_costTrend--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    options: {
        granularity: 'MONTHLY',
        chart_type: CHART_TYPE.LINE,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
    },
    options_schema: {
        default_properties: ['cost_group_by', ...getWidgetFilterSchemaPropertyNames('provider', 'project', 'service_account', 'region', 'cost_product', 'cost_account')],
        fixed_properties: ['cost_group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_group_by'),
                ...getWidgetFilterOptionsSchema(
                    'provider',
                    'project',
                    'service_account',
                    'project_group',
                    'cost_category',
                    'cost_resource_group',
                    'cost_product',
                    'region',
                    'cost_type',
                    'cost_account',
                ),
            },
            order: ['cost_group_by', ...getWidgetFilterSchemaPropertyNames(
                'provider',
                'project',
                'service_account',
                'project_group',
                'cost_category',
                'cost_resource_group',
                'cost_product',
                'region',
                'cost_type',
                'cost_account',
            )],
        },
    },
};

export default costTrendWidgetConfig;
