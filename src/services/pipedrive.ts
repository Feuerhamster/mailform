import {
    ApiClient,
    LeadsApi,
    PersonsApi,
    PersonFieldsApi,
    OrganizationsApi,
    OrganizationFieldsApi,
    LeadLabelsApi,
    //@ts-ignore
} from "pipedrive";
import "dotenv/config";
import {ContactForm} from "../@types/target";
import {PipedrivePersonService} from "./pipedrive/person";
import {AddOrganization, AddPerson, OrganizationItemResponse, Response} from "./pipedrive/types";
import {PipedriveOrganizationService} from "./pipedrive/organization";
import {PipedriveLeadService} from "./pipedrive/lead";

// TODO check every create Person Org or Lead has the info account set.
export const PIPEDRIVE_INFO_ACC_ID = 13132618;

const apiClient = new ApiClient();

const apiToken = apiClient.authentications.api_key;
apiToken.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");

export class PipedriveService {
    // TODO use a constructor
    leadClient = new LeadsApi(apiClient);
    leadLabelClient = new LeadLabelsApi(apiClient);
    personClient = new PersonsApi(apiClient);
    personFiledClient = new PersonFieldsApi(apiClient);
    orgClient = new OrganizationsApi(apiClient);
    orgFieldClient = new OrganizationFieldsApi(apiClient);
    personService = new PipedrivePersonService();

    validateContactForm(data: any): ContactForm {
        if (data.firstname === null) throw new Error("firstname is empty");
        if (data.lastname === null) throw new Error("lastname is empty");
        if (data.org === null) throw new Error("org is empty");
        if (data.email === null) throw new Error("email is empty");
        return data as ContactForm;
    }

    async createAllPipedriveItemsForContactForm(req: ContactForm): Promise<Response> {
        console.info(`PipedriveService -> createLead -> for ${req.firstname} ${req.email}`);
        let personId: number | undefined;
        let orgId: number | undefined;
        try {
            const addPerReq = await this.addPerson(req);
            addPerReq.msg();
            if (!addPerReq.success) throw addPerReq.error;

            if (!addPerReq.data?.addSimplePersonResponse?.data?.id)
                throw new Error("Person id is undefined, unexpected behavior");
            personId = addPerReq.data?.addSimplePersonResponse?.data?.id;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                msg: () => console.error("We have a Problem on add an new Person the howl process are broken."),
            };
        }

        try {
            const addOrgResp = await this.addOrganization(req);
            addOrgResp.msg();
            if (!addOrgResp.success) throw addOrgResp.error;

            if (!addOrgResp.data?.addSimpleOrgResponse?.data?.id) {
                throw new Error("Organization id is undefined, unexpected behavior");
            }
            orgId = addOrgResp.data?.addSimpleOrgResponse?.data?.id;
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            console.error(`[Error] add a new organization, error: ${ex.message}`);
        }

        try {
            if (orgId) {
                const connectionResp = await this.personService.connectOrgAndPerson(this.personClient, personId, orgId);
                if (!connectionResp.success) {
                    connectionResp.msg();
                    throw connectionResp.error;
                }
            } else throw new Error("orgId is null or undefined wie can´t connect the org with the person");
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            console.error(`[Error] connection between organization and person, error: ${ex.message}`);
        }

        try {
            const leadResp = await new PipedriveLeadService().addLead(this.leadClient, this.leadLabelClient, req, personId, orgId);
            if (!leadResp.success) {
                leadResp.msg();
                throw leadResp.error;
            }
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            console.error(`[Error] add a lead, error: ${ex.message}`);
        }

        return {
            success: true,
            msg: () => console.info("Added a new People Organization and a Lead"),
        };
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
                personResponse.msg();
                throw personResponse.error;
            }
            returnData.addSimplePersonResponse = personResponse;
            const personId = personResponse.data?.id;
            if (!personId) {
                personResponse.msg();
                throw new Error("The new created person has no personId");
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
                personResponse.msg();
                returnData.personLangFieldResponse?.msg();
                returnData.addLabelFiledResponse?.msg();
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
                personResponse.msg();
                returnData.personLabelFieldResponse?.msg();
                returnData.addLabelFiledResponse?.msg();
                console.warn(
                    `We can't add the Inbound Form Label for Person with ID: ${personId}, because: ${
                        (error as Error).message
                    }`
                );
            }

            return {
                success: true,
                data: returnData,
                msg: () => console.info("Successfully added a new People"),
            };
        } catch (error) {
            // Error form addSimplePerson
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            // TODO write a test for the log statement
            console.error(`[Error] add a new Person, error: ${ex.message}`);
            return {
                success: false,
                error: ex,
                msg: () => console.error("Error is happened on addPerson"),
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
                addSimpleOrgResp.msg();
                throw addSimpleOrgResp.error;
            }
            returnData.addSimpleOrgResponse = addSimpleOrgResp;
            const orgId = addSimpleOrgResp.data?.id;
            if (!orgId) {
                addSimpleOrgResp.msg();
                throw new Error("The new created person has no orgId");
            }

            try {
                const checkOrgLabelFiledResponse = await service.checkLabelId(this.orgFieldClient);
                returnData.orgLabelFieldResponse = checkOrgLabelFiledResponse;
                if (!checkOrgLabelFiledResponse.success) throw checkOrgLabelFiledResponse.error as Error;
                const addInboundLabelToOrgResponse = await service.addInboundLabelToOrg(this.orgClient, orgId);
                returnData.addLabelFiledResponse = addInboundLabelToOrgResponse;
                if (!addInboundLabelToOrgResponse.success) throw addInboundLabelToOrgResponse.error;
            } catch (error) {
                addSimpleOrgResp?.msg();
                returnData.orgLabelFieldResponse?.msg();
                returnData.addLabelFiledResponse?.msg();
                console.warn(
                    `We can't add the Inbound Form Label for Org with ID: ${orgId}, because: ${
                        (error as Error).message
                    }`
                );
            }

            return {
                success: true,
                data: returnData,
                msg: () => console.info("Successfully added a new Organization"),
            };
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            // TODO write a test for the log statement
            console.error(`[Error] add a new Organization, error: ${ex.message}`);
            return {
                success: false,
                error: ex,
                msg: () => console.error("Error is happened on addOrganization"),
            };
        }
    }
}

export function getRequiredEnvVariable(varName: string): string {
    const value = process.env[varName];
    if (!value) {
        throw new Error(`now env found for ${varName}`);
    }
    return value;
}
