import {LANGUAGE_MAPPER} from './language-mapper';

export type LanguageKey = keyof typeof LANGUAGE_MAPPER;

// export interface AddSimplePersonResponse extends Response<AddSimplePersonResponse> {}
export interface PersonItemResponse extends Response<PersonItem> {}
export interface PersonLangFieldResponse extends Response<Field<LanguageOption>> {}
export interface LabelFieldResponse extends Response<Field<LabelField>> {}
export interface OrganizationItemResponse extends Response<OrganizationItem> {}

export interface Response<T = unknown> {
    success: boolean;
    data?: T;
    error?: Error;
    log: () => void;
}

export interface Field<T = unknown> {
    id: number;
    key: string;
    name: string;
    options: T[];
}

export interface LanguageOption {
    id: number;
    label: string;
}

export interface LabelField {
    id: number;
    label: string;
    color: string;
}

export interface LeadLabels {
    success: boolean;
    data: LeadLabel[];
}

export interface LeadLabel {
    id: string;
    name: string;
}

// https://github.com/pipedrive/client-nodejs/blob/master/docs/PersonItem.md
export interface PersonItem {
    id?: number;
    company_id?: number;
    phone?: BasePersonItem[];
    email?: BasePersonItem[];
    label?: number;
    name?: string;
    first_name?: string;
    last_name?: string;
}
// https://github.com/pipedrive/client-nodejs/blob/master/docs/BasePersonItemPhone.md
export interface BasePersonItem {
    value: string;
    primary: boolean;
    label: string;
}

export interface UpdatePersonData {}

export interface AddPerson {
    addSimplePersonResponse?: PersonItemResponse;
    personLangFieldResponse?: PersonLangFieldResponse;
    addLangForPersonResponse?: Response<unknown>; // https://github.com/pipedrive/client-nodejs/blob/master/docs/UpdatePersonResponse.md
    personLabelFieldResponse?: LabelFieldResponse;
    addLabelFiledResponse?: Response<unknown>; // https://github.com/pipedrive/client-nodejs/blob/master/docs/UpdatePersonResponse.md
}

export interface OrganizationItem {
    id?: number;
    name?: string;
    label?: number;
}

export interface AddOrganization {
    addSimpleOrgResponse?: OrganizationItemResponse;
    orgLabelFieldResponse?: LabelFieldResponse;
    addLabelFiledResponse?: Response<unknown>;
}
