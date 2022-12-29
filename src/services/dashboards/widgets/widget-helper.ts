import type { AsyncComponent } from 'vue';

import { mergeWith } from 'lodash';

import type {
    BaseConfigInfo, WidgetConfig,
} from '@/services/dashboards/widgets/config';
import { BASE_WIDGET_CONFIGS, CONSOLE_WIDGET_CONFIGS } from '@/services/dashboards/widgets/widget-config-list';

const mergeCustomizer = (val1, val2) => {
    if (Array.isArray(val1)) return [...new Set(val1.concat(val2))];
    return undefined;
};
const baseWidgetConfigCacheMap = new Map<string, Partial<WidgetConfig>>();
const getMergedBaseWidgetConfig = (configs: BaseConfigInfo[]): Partial<WidgetConfig> => {
    const mergedBaseConfig = mergeWith(
        {},
        ...configs.map((configInfo) => {
            const baseConfigId = configInfo.config_id;
            if (!baseConfigId) {
                throw new Error('There is no config_id in base config info.');
            }

            if (baseWidgetConfigCacheMap.has(baseConfigId)) {
                return baseWidgetConfigCacheMap.get(baseConfigId) as Partial<WidgetConfig>;
            }

            const baseConfig = BASE_WIDGET_CONFIGS[baseConfigId];
            if (!baseConfig) {
                throw new Error(`No matching base widget configuration found. ${baseConfigId} does not exist.`);
            }

            const childConfigs = baseConfig.base_configs;
            if (!childConfigs) {
                baseWidgetConfigCacheMap.set(baseConfigId, baseConfig);
                return baseConfig;
            }

            return getMergedBaseWidgetConfig(childConfigs);
        }),
        mergeCustomizer,
    );

    return mergedBaseConfig;
};

const consoleWidgetConfigCacheMap = new Map<string, WidgetConfig>();
export const getWidgetConfig = (widgetConfigId: string): WidgetConfig => {
    if (consoleWidgetConfigCacheMap.has(widgetConfigId)) return consoleWidgetConfigCacheMap.get(widgetConfigId) as WidgetConfig;

    const config = CONSOLE_WIDGET_CONFIGS[widgetConfigId] as WidgetConfig;
    if (!config?.base_configs) {
        consoleWidgetConfigCacheMap.set(widgetConfigId, config);
        return config;
    }

    const baseWidgetConfigs = config.base_configs;
    const mergedConfig = mergeWith(
        {},
        getMergedBaseWidgetConfig(baseWidgetConfigs),
        config,
        mergeCustomizer,
    );
    consoleWidgetConfigCacheMap.set(widgetConfigId, mergedConfig);
    return consoleWidgetConfigCacheMap.get(widgetConfigId) as WidgetConfig;
};

export const getWidgetComponent = (widgetConfigId: string): AsyncComponent => {
    const config = getWidgetConfig(widgetConfigId);
    if (!config) throw new Error(`No matching widget configuration found. ${widgetConfigId} does not exist.`);
    const widgetComponent = config.widget_component;
    if (!widgetComponent) throw new Error(`No matching widget component found. ${widgetComponent} does not exist.`);

    return widgetComponent;
};
