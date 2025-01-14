import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const costPieWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costPie',
    title: 'Cost Pie',
    labels: ['Cost'],
    base_configs: [{ config_id: 'basePie' }],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_PIE.DESC',
        preview_image: 'widget-img_costPie--thumbnail.png',
    },
    options: {
        chart_type: CHART_TYPE.PIE,
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

export default costPieWidgetConfig;
