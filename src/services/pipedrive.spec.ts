// @ts-ignore
import {ApiClient, PersonsApi, PersonFieldsApi} from "pipedrive";
import { getRequiredEnvVariable, PipedriveService } from "./pipedrive";
import { ContactForm } from "../@types/target";
import { LABEL_OPTION } from "./pipedrive/person";


describe('Pipedrive Service Tests', () => {

    let personClient: any;
    let personFieldClient: any;
    const service = new PipedriveService();

    beforeAll(async () => {
        console.info("beforeAll -> Create ApiClient and PersonApiClient");
        const apiClient = new ApiClient();
        apiClient.authentications.api_key.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");
        personClient = new PersonsApi(apiClient);
        personFieldClient = new PersonFieldsApi(apiClient);
    });


    it('should add a new Person correctly with label and language Validation',async () => {
        const contactForm: ContactForm = {
            firstname: 'Markus',
            lastname: 'Müller',
            email: 'markus.müller@gmail.ch',
            org: 'Boumat',
            language: 'de-CH',
            phone: "0791231212",
            msg: "Geht das auf dein oder auf mein Nacken"
        }

        const response = await service.addPerson(contactForm)

        expect(response.success).toBeTruthy()
        expect(response.data?.addSimplePersonResponse?.success).toBeTruthy()
        const simplePersonResp = response.data?.addSimplePersonResponse?.data
        expect(simplePersonResp?.name).toBe(`${contactForm.firstname} ${contactForm.lastname}`)
        expect(simplePersonResp?.last_name).toBe(contactForm.lastname)
        expect(simplePersonResp?.fist_name).toBe(contactForm.firstname)
        expect(simplePersonResp?.email).toBe(contactForm.email)
        expect(simplePersonResp?.label).toBe(LABEL_OPTION.id)
        expect(simplePersonResp?.phone?[0][]).toBe(contactForm.phone)



        expect(response.data?.personLangFieldResponse?.success).toBeTruthy()
        expect(response.data?.addLanguageForPersonResponse?.success).toBeTruthy()
        expect(response.data?.personLangFieldResponse?.success).toBeTruthy()
        expect(response.data?.addLabelFiledResponse?.success).toBeTruthy()
    })
})