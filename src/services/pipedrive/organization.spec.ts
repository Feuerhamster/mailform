// @ts-ignore
import {ApiClient, OrganizationsApi, OrganizationFieldsApi} from "pipedrive";
import { ContactForm } from "../../@types/target";
import { getRequiredEnvVariable } from "../pipedrive";
import { ORG_LABEL_ID as ORG_LABEL_FIELD_ID, ORG_LABEL_ID, ORG_LABEL_OPTION, PipedriveOrganizationService } from "./organization";
import { removeOrganization } from "./helper.spec";

describe("Test Organization Service", () => {

    let orgClient: any
    let orgFieldClient: any;
    let service: PipedriveOrganizationService;
    const organizationsIdsToRemove: number[] = []


    beforeAll(async () => {
        console.info("beforeAll -> Create ApiClient and PersonApiClient");
        const apiClient = new ApiClient();
        apiClient.authentications.api_key.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");
        orgClient = new OrganizationsApi(apiClient);
        orgFieldClient = new OrganizationFieldsApi(apiClient)
        service = new PipedriveOrganizationService();
    });

    afterAll(async () => {
        await removeOrganization(organizationsIdsToRemove, orgClient);
    })


    it("should add a new simple organization", async () => {
        const contactForm = getDefaultContactForm();
        const response = await service.addSimpleOrganization(orgClient, contactForm);
        expect(response.success).toBeTruthy(); 
        const orgId = response.data?.id as number
        expect(orgId).not.toBeNull()
        organizationsIdsToRemove.push(orgId)
        expect(response.data?.name).toBe(contactForm.org)
    });

    it('checkLabelId -> should check pipedrive has a valid Label ID', async () => {
        const response = await service.checkLabelId(orgFieldClient);
        console.log(JSON.stringify(response));
        expect(response.success).toBeTruthy();
        expect(response.data?.id).toBe(ORG_LABEL_FIELD_ID);
        const inboundLabelOption = response.data?.options.find((opt) => opt.id === ORG_LABEL_OPTION.id);
        expect(inboundLabelOption).not.toBeNull();
        expect(inboundLabelOption?.label).toBe(ORG_LABEL_OPTION.label);
    })

    it('should add a new Organization and add the Inbound Webform', async () => {
        const contactForm = getDefaultContactForm();
        const addOrgResp = await service.addSimpleOrganization(orgClient, contactForm);
        expect(addOrgResp.success).toBeTruthy(); 
        const orgId = addOrgResp.data?.id as number
        expect(orgId).not.toBeNull()
        organizationsIdsToRemove.push(orgId)

        const response = await service.addInboundLabelToOrg(orgClient, orgId)
        console.log(response)
        console.log(response.error?.message)
        if(response.error) throw response.error
        expect(response.success).toBeTruthy()
    })
});


const getDefaultContactForm = (): ContactForm => {
    return  {
        firstname: 'JEST Markus',
        lastname: 'Müller',
        email: 'markus.müller@gmail.ch',
        org: 'JEST Boumat',
        language: 'de-CH',
        phone: "0791231212",
        msg: "Geht das auf dein oder auf mein Nacken"
    }
}
