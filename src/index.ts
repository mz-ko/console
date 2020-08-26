/* eslint-disable import/first,import/newline-after-import */
import './styles/style.scss';

// lib
import * as Fluent from './lib/fluent-api';
import * as Mock from './lib/mock';
import * as ApiToolSet from './lib/api';
import * as Translations from './translations';
export {
    Fluent,
    Mock,
    ApiToolSet,
    Translations,
};


// atom components
export { default as PI } from './components/atoms/icons/PI.vue';
export { default as PButton } from './components/atoms/buttons/PButton.vue';
export { default as PBadge } from './components/atoms/badges/PBadge.vue';
export { default as PEmpty } from './components/atoms/empty/PEmpty.vue';
export { default as PCol } from './components/atoms/grid/col/Col.vue';
export { default as PRow } from './components/atoms/grid/row/Row.vue';
export { default as PHr } from './components/atoms/hr/PHr.vue';
export { default as PTextInput } from './components/atoms/inputs/PTextInput.vue';
export { default as PLabel } from './components/atoms/labels/PLabel.vue';

// molecule components
export { default as PNoticeAlert } from './components/molecules/alert/notice/PNoticeAlert.vue';
export { default as PRouteBreadcrumb } from './components/molecules/breadcrumbs/breadcrumb/PRouteBreadcrumb.vue';

// molecule button components
export { default as PCopyButton } from './components/molecules/buttons/copy-button/PCopyButton.vue';
export { default as PIconButton } from './components/molecules/buttons/icon-button/PIconButton.vue';
export { default as PLoadingButton } from './components/molecules/buttons/loading-button/PLoadingButton.vue';

// molecule form components
export { default as PCheckBox } from './components/molecules/forms/checkbox/PCheckBox.vue';
export { default as PDictInput } from './components/molecules/forms/dict-input/PDictInput.vue';
import * as PDictInputToolset from './components/molecules/forms/dict-input/PDictInput.toolset';
export { default as PTagsInput } from './components/organisms/forms/tags-input/PTagsInput.vue';
export { default as PRadio } from './components/molecules/forms/radio/PRadio.vue';
export { default as PSelect } from './components/molecules/forms/select/PSelect.vue';

// molecule layout components
export { default as PGridLayout } from './components/molecules/layouts/grid-layout/PGridLayout.vue';
export { default as PBoxLayout } from './components/molecules/layouts/box-layout/PBoxLayout.vue';
export { default as PPaneLayout } from './components/molecules/layouts/pane-layout/PPaneLayout.vue';

// organisms buttons
export { default as PSelectBtnGroup } from './components/organisms/buttons/select-btn-group/PSelectBtnGroup.vue';

// organisms context menu
export { default as PContextMenu } from './components/organisms/context-menu/PContextMenu.vue';

// organisms dropdown
export { default as PDropdownBtn } from './components/organisms/dropdown/dropdown-btn/PDropdownBtn.vue';
export { default as PDropdownMenuBtn } from './components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
export { default as PSelectDropdown } from './components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';

// organisms dynamic view
export { default as PDynamicField } from './components/organisms/dynamic-field/PDynamicField.vue';

// organisms forms
export { default as PJsonSchemaFieldGroup } from './components/organisms/forms/json-schema-field-group/PJsonSchemaFieldGroup.vue';
export { default as PJsonSchemaForm } from './components/organisms/forms/json-schema-form/PJsonSchemaForm.vue';
import * as PJsonSchemaFormToolSet from './components/organisms/forms/json-schema-form/toolset';

// organisms tables
export { default as PDataTable } from './components/organisms/tables/data-table/PDataTable.vue';
import * as PDataTableToolSet from './components/organisms/tables/data-table/PDataTable.toolset';
export { default as PToolboxTable } from './components/organisms/tables/toolbox-table/PToolboxTable.vue';
import * as PToolboxTableToolSet from './components/organisms/tables/toolbox-table/PToolboxTable.toolset';


// tool sets
export {
    // @ts-ignore
    PDictInputToolset,
    // @ts-ignore
    PTableToolset,
    // @ts-ignore
    PJsonSchemaFormToolSet,
    // @ts-ignore
    PDataTableToolSet,
    // @ts-ignore
    PToolboxTableToolSet,
};
