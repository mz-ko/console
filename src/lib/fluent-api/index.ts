import InventoryService from './inventory';
import PluginService from './plugin';
import SecretService from './secret';
import IdentityService from './identity';
import RepositoryService from './repository';
import AddOns from './add-ons';
import Statistics from './statistics';

export class FluentApi {
    inventory = (): InventoryService => new InventoryService();

    plugin = (): PluginService => new PluginService();

    secret = (): SecretService => new SecretService();

    identity = (): IdentityService => new IdentityService();

    repository = (): RepositoryService => new RepositoryService();

    addons = (): AddOns => new AddOns();

    statistics = (): Statistics => new Statistics();
}

export const fluentApi = new FluentApi();
export * from './type';
export * from './toolset';
