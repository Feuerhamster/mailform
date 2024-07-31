import 'dotenv/config';
import {
    AddNoteRequest,
    ApiClient,
    LeadLabelsApi,
    LeadsApi,
    NotesApi,
    OrganizationFieldsApi,
    OrganizationsApi,
    PersonFieldsApi,
    PersonsApi,
} from 'pipedrive';
import {ContactForm} from '../@types/target';
import {PipedriveLeadService} from './pipedrive/lead';
import logger from './pipedrive/logger';
import {PipedriveOrganizationService} from './pipedrive/organization';
import {PipedrivePersonService} from './pipedrive/person';
import {AddOrganization, AddPerson, Response} from './pipedrive/types';

// TODO Test for logs
export const PIPEDRIVE_INFO_ACC_ID = 13132618;

const apiClient = new ApiClient();

const apiToken = apiClient.authentications.api_key;
apiToken.apiKey = getRequiredEnvVariable('PIPEDRIVE_API_SECRET');

export class PipedriveService {
    // TODO use a constructor
    leadClient = new LeadsApi(apiClient);
    leadLabelClient = new LeadLabelsApi(apiClient);
    personClient = new PersonsApi(apiClient);
    personFiledClient = new PersonFieldsApi(apiClient);
    orgClient = new OrganizationsApi(apiClient);
    orgFieldClient = new OrganizationFieldsApi(apiClient);
    personService = new PipedrivePersonService();
    notesClient = new NotesApi(apiClient);
    // TODO implement the Notes Service

    validateContactForm(data: any): ContactForm {
        if (data.name === null) throw new Error('name is empty');
        if (data.org === null) throw new Error('org is empty');
        if (data.email === null) throw new Error('email is empty');
        return data as ContactForm;
    }

    async createAllPipedriveItemsForContactForm(req: ContactForm): Promise<Response> {
        logger.info(`PipedriveService -> createLead -> for ${req.name} ${req.email}`);
        let personId: number | undefined;
        let orgId: number | undefined;
        let leadId: number | undefined;
        try {
            const addPerReq = await this.addPerson(req);
            addPerReq.log();
            if (!addPerReq.success) throw addPerReq.error;

            if (!addPerReq.data?.addSimplePersonResponse?.data?.id)
                throw new Error('Person id is undefined, unexpected behavior');
            personId = addPerReq.data?.addSimplePersonResponse?.data?.id;
        } catch (error) {
            logger.error(`PipedriveService -> createAllPipedriveItemsForContactForm -> addPerson -> error: ${error}`);
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                log: () => console.error('We have a Problem on add an new Person the howl process are broken.'),
            };
        }

        try {
            const addOrgResp = await this.addOrganization(req);
            addOrgResp.log();
            if (!addOrgResp.success) throw addOrgResp.error;

            if (!addOrgResp.data?.addSimpleOrgResponse?.data?.id) {
                logger.warn('Organization id is undefined, unexpected behavior');
                throw new Error('Organization id is undefined, unexpected behavior');
            }
            orgId = addOrgResp.data?.addSimpleOrgResponse?.data?.id;
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            logger.error(
                `PipedriveService -> createAllPipedriveItemsForContactForm -> addOrganization -> error: ${ex}`
            );
        }

        try {
            if (orgId) {
                const connectionResp = await this.personService.connectOrgAndPerson(this.personClient, personId, orgId);
                if (!connectionResp.success) {
                    connectionResp.log();
                    throw connectionResp.error;
                }
            } else {
                logger.error('orgId is null or undefined wie cant connect the org with the person');
                throw new Error('orgId is null or undefined wie cant connect the org with the person');
            }
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            console.error(`[Error] connection between organization and person, error: ${ex.message}`);
        }

        try {
            const leadResp = await new PipedriveLeadService().addLead(
                this.leadClient,
                this.leadLabelClient,
                req,
                personId,
                orgId
            );
            if (!leadResp.success) {
                leadResp.log();
                throw leadResp.error;
            }
            leadId = (leadResp.data as any).id;
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            console.error(`[Error] add a lead, error: ${ex.message}`);
        }

        // add Note
        if (req.message) {
            const addNoteResp = await this.addNoteToLead(leadId, req.message);
            if (!addNoteResp.success) {
                addNoteResp.log();
            }
        }

        return {
            success: true,
            log: () =>
                logger.info(
                    'Added a new People Organization and a Lead' + (req.message ? ' with a Note' : ' without a Note')
                ),
        };
    }

    async addNoteToLead(leadId: number, content: string): Promise<Response> {
        try {
            let opts = AddNoteRequest.constructFromObject({
                lead_id: leadId,
                content: content,
            });
            const response = await this.notesClient.addNote(opts);
            if (response.success) {
                return {
                    success: true,
                    log: () => logger.info('Successfully added a note to the lead'),
                };
            } else {
                return {
                    success: false,
                    error: new Error(JSON.stringify(response)),
                    log: () => logger.error('Request goes wrong -> add Note to the lead'),
                };
            }
        } catch (error) {
            const ex = error instanceof Error ? error.message : JSON.stringify(error);
            logger.error(`PipedriveService -> addNoteToLead`, {error: ex});

            return {
                success: false,
                error: error instanceof Error ? error : new Error(ex),
                log: () => logger.error('An error occurred while adding the note to the lead'),
            };
        }
    }

    // https://github.com/pipedrive/client-nodejs/blob/master/docs/PersonsApi.md#addPerson
    async addPerson(req: ContactForm): Promise<Response<AddPerson>> {
        try {
            const returnData: AddPerson = {};
            const personResponse = await this.personService.addSimplePerson(
                this.personClient,
                req,
                PIPEDRIVE_INFO_ACC_ID
            );

            if (!personResponse.success) {
                personResponse.log();
                throw personResponse.error;
            }
            returnData.addSimplePersonResponse = personResponse;
            const personId = personResponse.data?.id;
            if (!personId) {
                personResponse.log();
                throw new Error('The new created person has no personId');
            }

            try {
                const checkPersonLangFiledResponse = await this.personService.checkLanguage(this.personFiledClient);
                returnData.personLangFieldResponse = checkPersonLangFiledResponse;
                if (!checkPersonLangFiledResponse.success) throw checkPersonLangFiledResponse.error;
                const addLanguageForPersonResponse = await this.personService.addLanguageForPerson(
                    this.personClient,
                    req,
                    personId
                );
                returnData.addLangForPersonResponse = addLanguageForPersonResponse;
                if (!addLanguageForPersonResponse.success) throw addLanguageForPersonResponse.error;
            } catch (error) {
                // Here we log the functions checkLanguage and addLanguageForPerson
                personResponse.log();
                returnData.personLangFieldResponse?.log();
                returnData.addLabelFiledResponse?.log();
                console.warn(
                    `We cant add the Language for the Person with ID: ${personId}, because: ${(error as Error).message}`
                );
            }

            try {
                const checkPersonLabelFiledResponse = await this.personService.checkLabelId(this.personFiledClient);
                returnData.personLabelFieldResponse = checkPersonLabelFiledResponse;
                if (!checkPersonLabelFiledResponse.success) throw checkPersonLabelFiledResponse.error;
                const addInboundLabelToPersonResponse = await this.personService.addInboundLabelToPerson(
                    this.personClient,
                    personId
                );
                returnData.addLabelFiledResponse = addInboundLabelToPersonResponse;
                if (!addInboundLabelToPersonResponse.success) throw addInboundLabelToPersonResponse.error;
            } catch (error) {
                personResponse.log();
                returnData.personLabelFieldResponse?.log();
                returnData.addLabelFiledResponse?.log();
                console.warn(
                    `We can't add the Inbound Form Label for Person with ID: ${personId}, because: ${
                        (error as Error).message
                    }`
                );
            }

            return {
                success: true,
                data: returnData,
                log: () => console.info('Successfully added a new People'),
            };
        } catch (error) {
            // Error form addSimplePerson
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            // TODO write a test for the log statement
            console.error(`[Error] add a new Person, error: ${ex.message}`);
            return {
                success: false,
                error: ex,
                log: () => console.error('Error is happened on addPerson'),
            };
        }
    }

    // https://github.com/pipedrive/client-nodejs/blob/master/docs/OrganizationsApi.md#addOrganization
    async addOrganization(req: ContactForm): Promise<Response<AddOrganization>> {
        try {
            const service = new PipedriveOrganizationService();
            const returnData: AddOrganization = {};
            const addSimpleOrgResp = await service.addSimpleOrganization(this.orgClient, req);

            if (!addSimpleOrgResp.success) {
                addSimpleOrgResp.log();
                throw addSimpleOrgResp.error;
            }
            returnData.addSimpleOrgResponse = addSimpleOrgResp;
            const orgId = addSimpleOrgResp.data?.id;
            if (!orgId) {
                addSimpleOrgResp.log();
                throw new Error('The new created person has no orgId');
            }

            try {
                const checkOrgLabelFiledResponse = await service.checkLabelId(this.orgFieldClient);
                returnData.orgLabelFieldResponse = checkOrgLabelFiledResponse;
                if (!checkOrgLabelFiledResponse.success) throw checkOrgLabelFiledResponse.error;
                const addInboundLabelToOrgResponse = await service.addInboundLabelToOrg(this.orgClient, orgId);
                returnData.addLabelFiledResponse = addInboundLabelToOrgResponse;
                if (!addInboundLabelToOrgResponse.success) throw addInboundLabelToOrgResponse.error;
            } catch (error) {
                addSimpleOrgResp?.log();
                returnData.orgLabelFieldResponse?.log();
                returnData.addLabelFiledResponse?.log();
                console.warn(
                    `We can't add the Inbound Form Label for Org with ID: ${orgId}, because: ${
                        (error as Error).message
                    }`
                );
            }

            return {
                success: true,
                data: returnData,
                log: () => logger.info('Successfully added a new Organization'),
            };
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            // TODO write a test for the log statement
            logger.error(`[Error] add a new Organization, error: ${ex.message}`);
            return {
                success: false,
                error: ex,
                log: () => logger.error('Error is happened on addOrganization'),
            };
        }
    }
}

export function getRequiredEnvVariable(varName: string): string {
    const value = process.env[varName];
    if (!value) {
        logger.error(`no env found for ${varName}`);
        throw new Error(`no env found for ${varName}`);
    }
    return value;
}
