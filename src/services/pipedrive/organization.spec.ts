// @ts-ignore
import {ApiClient, PersonsApi, PersonFieldsApi, OrganizationsApi} from "pipedrive";
import { ContactForm } from "../../@types/target";
import { getRequiredEnvVariable } from "../pipedrive";
import { PipedriveOrganizationService } from "./organization";
import { removeOrganization } from "./helper.spec";

describe("Test Organization Service", () => {

    let orgClient: any
    let service: PipedriveOrganizationService;
    const organizationsIdsToRemove: number[] = []


    beforeAll(async () => {
        console.info("beforeAll -> Create ApiClient and PersonApiClient");
        const apiClient = new ApiClient();
        apiClient.authentications.api_key.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");
        orgClient = new OrganizationsApi(apiClient);
        service = new PipedriveOrganizationService();
    });

    afterAll(async () => {
        await removeOrganization(organizationsIdsToRemove, orgClient);
    })


    it("should add a new simple organization", async () => {
        const contactForm = getDefaultContactForm();
        const response = await service.addSimpleOrganization(orgClient, contactForm);
        expect(response.success).toBeTruthy();
        expect(response.data?.name).toBe(contactForm.org)
    });
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
