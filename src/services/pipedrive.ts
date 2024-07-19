import {
    ApiClient,
    LeadsApi,
    PersonsApi,
    PersonFieldsApi,
    OrganizationsApi,
    AddLeadRequest,
    OrganizationFieldsApi,
    //@ts-ignore
} from "pipedrive";
import {v4 as uuidv4} from "uuid";

import "dotenv/config";
import {ContactForm} from "../@types/target";
import {PipedrivePersonService} from "./pipedrive/person";
import {AddOrganization, AddPerson, OrganizationItemResponse, Response} from "./pipedrive/types";
import { PipedriveOrganizationService } from "./pipedrive/organization";

// TODO check every create Person Org or Lead has the info account set.
export const PIPEDRIVE_INFO_ACC_ID = 13132618;
const LEAD_LABEL_ID = "74b21c90-f326-11ed-98c5-c58df5a19268";
const apiClient = new ApiClient();

const apiToken = apiClient.authentications.api_key;
apiToken.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");

export class PipedriveService {
    // TODO use a constructor
    leadClient = new LeadsApi(apiClient);
    personClient = new PersonsApi(apiClient);
    personFiledClient = new PersonFieldsApi(apiClient);
    orgClient = new OrganizationsApi(apiClient);
    orgFieldClient = new OrganizationFieldsApi(apiClient);

    validateContactForm(data: any): ContactForm {
        if (data.firstname === null) throw new Error("firstname is empty");
        if (data.lastname === null) throw new Error("lastname is empty");
        if (data.org === null) throw new Error("org is empty");
        if (data.email === null) throw new Error("email is empty");
        return data as ContactForm;
    }

    async createAllPipedriveItemsForContactForm(req: ContactForm): Promise<Response> {
        console.info(`PipedriveService -> createLead -> for ${req.firstname} ${req.email}`);
        let personId: number;
        try {
            const addPerReq = await this.addPerson(req);
            if (!addPerReq.success) throw addPerReq.error;

            if (!addPerReq.data?.addSimplePersonResponse?.data?.id)
                throw new Error("person id is undefined, unexpected behavior");
            personId = addPerReq.data?.addSimplePersonResponse?.data?.id;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                msg: "We have a Problem on add an new Person the howl process are broken.",
            };
        }

        return {
            success: true,
        };
    }

    // https://github.com/pipedrive/client-nodejs/blob/master/docs/LeadsApi.md#addLead
    private async addLead(person_id: number, organization_id: number): Promise<Response> {
        const origin_id = `fidentity_backend_${uuidv4()}`;
        console.info(`PipedriveService -> addLead -> send a addLead request to Pipedrive, origin_id: ${origin_id}`);

        const opts = AddLeadRequest.constructFromObject({
            title: "Anfrage Webformular TEST-KEVIN",
            owner_id: PIPEDRIVE_INFO_ACC_ID,
            label_ids: [LEAD_LABEL_ID],
            person_id: person_id,
            organization_id: organization_id,
            origin_id,
        });

        const response = await this.leadClient.addLead(opts);
        console.debug(`PipedriveService -> addLead -> received response ${JSON.stringify(response)}`);

        return response.success === true
            ? {
                  success: true,
                  msg: "Everything is okay",
              }
            : {
                  success: false,
                  error: new Error(JSON.stringify(response.data)),
                  msg: "Request goes wrong -> add Lead",
              };
    }

    // https://github.com/pipedrive/client-nodejs/blob/master/docs/PersonsApi.md#addPerson
    async addPerson(req: ContactForm): Promise<Response<AddPerson>> {
        try {
            const service = new PipedrivePersonService();
            const returnData: AddPerson = {};
            const personResponse = await service.addSimplePerson(this.personClient, req, PIPEDRIVE_INFO_ACC_ID);

            if (!personResponse.success) throw personResponse.error;
            returnData.addSimplePersonResponse = personResponse;
            const personId = personResponse.data?.id;
            if (!personId) throw new Error("The new created person has no personId");

            try {
                const checkPersonLangFiledResponse = await service.checkLanguage(this.personFiledClient);
                returnData.personLangFieldResponse = checkPersonLangFiledResponse;
                if (!checkPersonLangFiledResponse.success) throw checkPersonLangFiledResponse.error as Error;
                const addLanguageForPersonResponse = await service.addLanguageForPerson(
                    this.personClient,
                    req,
                    personId
                );
                returnData.addLangForPersonResponse = addLanguageForPersonResponse;
                if (!addLanguageForPersonResponse.success) throw addLanguageForPersonResponse.error as Error;
            } catch (error) {
                console.warn(
                    `We cant add the Language for the Person with ID: ${personId}, because: ${(error as Error).message}`
                );
            }

            try {
                const checkPersonLabelFiledResponse = await service.checkLabelId(this.personFiledClient);
                returnData.personLabelFieldResponse = checkPersonLabelFiledResponse;
                if (!checkPersonLabelFiledResponse.success) throw checkPersonLabelFiledResponse.error as Error;
                const addInboundLabelToPersonResponse = await service.addInboundLabelToPerson(
                    this.personClient,
                    personId
                );
                returnData.addLabelFiledResponse = addInboundLabelToPersonResponse;
                if (!addInboundLabelToPersonResponse.success) throw addInboundLabelToPersonResponse.error;
            } catch (error) {
                console.warn(
                    `We can't add the Inbound Form Label for Person with ID: ${personId}, because: ${
                        (error as Error).message
                    }`
                );
            }

            return {
                success: true,
                data: returnData,
                msg: "Successfully added a new People",
            };
        } catch (error) {
            const ex = error instanceof Error ? error : new Error(JSON.stringify(error));
            console.error(`[Error] ${ex.message}`);
            return {
                success: false,
                error: ex,
            };
        }
    }

    // https://github.com/pipedrive/client-nodejs/blob/master/docs/OrganizationsApi.md#addOrganization
    async addOrganization(req: ContactForm) {
        try {
            const service = new PipedriveOrganizationService()
            const returnData: AddOrganization = {}
            const addSimpleOrgResp = await service.addSimpleOrganization(this.orgClient, req)

            if(!addSimpleOrgResp.success) throw addSimpleOrgResp.error
            returnData.addSimpleOrgResponse = addSimpleOrgResp;
            const orgId = addSimpleOrgResp.data?.id;
            if (!orgId) throw new Error("The new created person has no orgId");

            try {
                const checkOrgLabelFiledResponse = await service.checkLabelId(this.orgFieldClient);
                returnData.orgLabelFieldResponse = checkOrgLabelFiledResponse;
                if (!checkOrgLabelFiledResponse.success) throw checkOrgLabelFiledResponse.error as Error;
                const addInboundLabelToOrgResponse = await service.addInboundLabelToOrg(
                    this.orgClient,
                    orgId
                );
                returnData.addLabelFiledResponse = addInboundLabelToOrgResponse;
                if (!addInboundLabelToOrgResponse.success) throw addInboundLabelToOrgResponse.error;
            } catch (error) {
                console.warn(
                    `We can't add the Inbound Form Label for Org with ID: ${orgId}, because: ${
                        (error as Error).message
                    }`
                );
            }

        }
    }
        
}

//export function getCurrentUTCDateTime(): string {
//    const now = new Date();
//    const isoString = now.toISOString(); // e.g., "2024-06-17T13:47:00.000Z"
//    const datePart = isoString.split("T")[0]; // "2024-06-17"
//    const timePart = isoString.split("T")[1].split(".")[0]; // "13:47:00"
//    return `${datePart} ${timePart}`;
//}

export function getRequiredEnvVariable(varName: string): string {
    const value = process.env[varName];
    if (!value) {
        throw new Error(`now env found for ${varName}`);
    }
    return value;
}
