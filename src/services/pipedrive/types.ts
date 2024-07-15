import { Response } from '../pipedrive'
import { LANGUAGE_MAPPER } from './language-mapper';

export type LanguageKey = keyof typeof LANGUAGE_MAPPER;


export interface PersonLangFieldResponse extends Response<Field<LanguageOption>> {}
export interface PersonLabelFieldResponse extends Response<Field<LabelField>> {}

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
