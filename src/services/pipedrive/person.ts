// @ts-ignore
import {NewPerson} from 'pipedrive';
import {v4 as uuidv4} from 'uuid';
import {ContactForm} from '../../@types/target';
import {LANGUAGE_MAPPER} from './language-mapper';
import logger from './logger';
import {
    Field,
    LabelField,
    LabelFieldResponse,
    LanguageKey,
    LanguageOption,
    PersonItem,
    PersonItemResponse,
    PersonLangFieldResponse,
    Response,
} from './types';

interface PersonOptions {
    name: string;
    owner_id: number;
    email: {value: string}[];
    phone?: {value: string}[]; // phone is optional
}

export const LANGUAGE_FILED_ID = 9099;
export const LANGUAGE_KEY = 'bab84189617691c8d2549a1331ad7d8ceca26653';
export const LANGUAGE_MAP: {[key: string]: number} = {
    Deutsch: 88,
    Englisch: 89,
    Französisch: 90,
    Spanisch: 91,
    Italienisch: 92,
};

export const PERSON_LABEL_FIELD_ID = 9105;
export const PERSON_LABEL_OPTION = {
    id: 114,
    label: 'Inbound Webformular',
};

export class PipedrivePersonService {
    // https://github.com/pipedrive/client-nodejs/blob/master/docs/PersonsApi.md#addPerson
    async addSimplePerson(client: any, req: ContactForm, owner_id: number): Promise<PersonItemResponse> {
        const origin_id = `fidentity_backend_${uuidv4()}`;
        logger.info(
            `PipedrivePersonService -> addPerson -> send a addPerson request to Pipedrive, origin_id: ${origin_id}`
        );

        const opts: PersonOptions = {
            name: req.name,
            owner_id: owner_id,
            email: [
                {
                    value: req.email,
                },
            ],
        };

        if (req.phone) {
            opts.phone = [
                {
                    value: req.phone,
                },
            ];
        }
        logger.debug(`PipedrivePersonService -> addPerson -> request opts: ${JSON.stringify(opts)}`);

        try {
            const newPerson = NewPerson.constructFromObject(opts);

            const response = await client.addPerson(newPerson);
            logger.info(`PipedrivePersonService -> addPerson -> received response: ${JSON.stringify(response)}`);

            if (response.success) {
                const personData: PersonItem = response.data;
                return {
                    success: true,
                    data: personData,
                    log: () => logger.info('Add a Simple Person successfully, Everything is okay'),
                };
            } else {
                return {
                    success: false,
                    error: new Error(JSON.stringify(response.data)),
                    log: () => logger.error('Request goes wrong -> add person'),
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                log: () => logger.error('An error occurred while adding the person'),
            };
        }
    }

    async addLanguageForPerson(client: any, req: ContactForm, person_id: number): Promise<Response> {
        const language = req.language;

        if (!language) {
            return {
                success: false,
                error: new Error('The language was not passed you cannot set the language'),
                log: () => logger.error('The language was not passed you cannot set the language'),
            };
        }
        if (!LANGUAGE_MAPPER.hasOwnProperty(language as LanguageKey)) {
            return {
                success: false,
                error: new Error(`We do not support this language: ${language}`),
                log: () => logger.error('The language was not passed you cannot set the language'),
            };
        }

        const langCode = LANGUAGE_MAP[LANGUAGE_MAPPER[language as LanguageKey].germanName];
        const updateData = {
            [LANGUAGE_KEY]: langCode,
        };

        try {
            const response = await client.updatePerson(person_id, updateData);
            if (response.success) {
                return {
                    success: true,
                    data: response.data as unknown,
                    log: () =>
                        logger.info(
                            `Language from the person successfully updated, person_id: ${person_id}, Everything is okay`
                        ),
                };
            } else {
                return {
                    success: false,
                    error: new Error(JSON.stringify(response.data)),
                    log: () => logger.error('Request goes wrong -> update person language'),
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                log: () => logger.error('An error occurred while updating the person language'),
            };
        }
    }

    async checkLanguage(client: any): Promise<PersonLangFieldResponse> {
        try {
            const response = await client.getPersonField(LANGUAGE_FILED_ID);
            if (response.success) {
                logger.info(`checkLanguage -> getPersonField response: ${JSON.stringify(response)}`);
                const langField = response.data as Field<LanguageOption>;
                const isValid = this.validateLanguageField(langField);
                return {
                    success: isValid,
                    data: langField,
                    log: () =>
                        isValid
                            ? () => logger.info('Language check PASS, Everything is okay')
                            : () =>
                                  logger.error(
                                      `Language check FAIL, because we can't find a different LANGUAGE_KEY or language options has chanced, data: ${JSON.stringify(
                                          langField
                                      )}`
                                  ),
                };
            }

            return {
                success: false,
                error: new Error(JSON.stringify(response.data)),
                log: () => logger.error('Request goes wrong -> getPersonField for the Language goes wrong'),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                log: () => logger.error('An error occurred while checking the language field'),
            };
        }
    }

    async addInboundLabelToPerson(client: any, person_id: number): Promise<Response> {
        const updateData = {
            label: PERSON_LABEL_OPTION.id,
            label_ids: [PERSON_LABEL_OPTION.id],
        };
        try {
            const response = await client.updatePerson(person_id, updateData);
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    log: () =>
                        logger.info(`Inbound Webform successfully updated to the person, person_id: ${person_id}`),
                };
            } else {
                return {
                    success: false,
                    error: new Error(JSON.stringify(response.data)),
                    log: () => logger.error('Request goes wrong -> update person webform inbound label'),
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                log: () =>
                    logger.error('An error occurred while updating the person label, specific add the Inbound webform'),
            };
        }
    }

    async checkLabelId(client: any): Promise<LabelFieldResponse> {
        try {
            const response = await client.getPersonField(PERSON_LABEL_FIELD_ID);

            if (response.success) {
                logger.info(`checkLabelId -> getPersonField response: ${JSON.stringify(response)}`);
                const labelField = response.data as Field<LabelField>;
                const isValid = validateLabelIdField(labelField, PERSON_LABEL_OPTION);
                return {
                    success: isValid,
                    data: labelField,
                    log: isValid
                        ? () => logger.info('Label check PASS, Everything is okay')
                        : () =>
                              logger.error(
                                  `Label check FAIL, because we can't find: ${JSON.stringify(
                                      PERSON_LABEL_OPTION
                                  )} in ${JSON.stringify(labelField)}`
                              ),
                };
            }

            return {
                success: false,
                error: new Error(JSON.stringify(response.data)),
                log: () => logger.error('Request goes wrong -> check Label for the label id goes wrong'),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                log: () => logger.error('An error occurred while checking the label id'),
            };
        }
    }

    async connectOrgAndPerson(client: any, personId: number, organizationId: number): Promise<Response> {
        const data = {
            org_id: organizationId,
        };
        try {
            const response = await client.updatePerson(personId, data);
            if (response.success) {
                return {
                    success: true,
                    data: response.data as unknown,
                    log: () =>
                        logger.info(
                            `Organization successfully connected with the Person org_id: ${organizationId}, person_id: ${personId}`
                        ),
                };
            }

            return {
                success: false,
                error: new Error(JSON.stringify(response.data)),
                log: () => logger.error("Request goes wrong -> we can't connect organization with the person"),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                log: () => logger.error('An error occurred while connecting organization with the person'),
            };
        }
    }

    validateLanguageField = (languageField: Field<LanguageOption>): boolean => {
        if (languageField.key !== LANGUAGE_KEY) return false;

        return Object.entries(LANGUAGE_MAP).every(([label, id]) =>
            languageField.options.some((option) => option.id === id && option.label === label)
        );
    };

    getLang = (req: ContactForm): string | null => {
        return req.language && LANGUAGE_MAPPER.hasOwnProperty(req.language)
            ? LANGUAGE_MAPPER[req.language as LanguageKey].germanName
            : null;
    };
}

export const validateLabelIdField = (labelField: Field<LabelField>, shouldBe: typeof PERSON_LABEL_OPTION): boolean => {
    return Object.values(labelField.options).some(
        (item) => item.id === shouldBe.id && item.label.trim().toLowerCase() === shouldBe.label.trim().toLowerCase()
    );
};
