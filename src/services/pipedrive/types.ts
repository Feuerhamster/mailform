import { LANGUAGE_MAPPER } from './language-mapper';

export type LanguageKey = keyof typeof LANGUAGE_MAPPER;

// export interface AddSimplePersonResponse extends Response<AddSimplePersonResponse> {}
export interface PersonItemResponse extends Response<PersonItem> {}
export interface PersonLangFieldResponse extends Response<Field<LanguageOption>> {}
export interface PersonLabelFieldResponse extends Response<Field<LabelField>> {}

export interface Response<T = unknown> {
    success: boolean;
    data?: T;
    error?: Error;
    msg?: string;
}

export interface Field<T = unknown> {
    id: number;
    key: string;
    name: string;
    options: T[];
};

export interface LanguageOption {
    id: number;
    label: string;
}

export interface LabelField {
    id: number,
    label: string,
    color: string
}

// https://github.com/pipedrive/client-nodejs/blob/master/docs/PersonItem.md
export interface PersonItem {
    id?: number,
    company_id?: number,
    phone?: object[],
    email?: object[],
    label?: number,
    name?: string,
    fist_name?: string,
    last_name?: string
}

export interface UpdatePersonData {

}

export interface AddPerson{
    addSimplePersonResponse?: PersonItemResponse
    personLangFieldResponse?: PersonLangFieldResponse
    addLanguageForPersonResponse?: Response<unknown> // https://github.com/pipedrive/client-nodejs/blob/master/docs/UpdatePersonResponse.md
    personLabelFieldResponse? : PersonLabelFieldResponse
}

