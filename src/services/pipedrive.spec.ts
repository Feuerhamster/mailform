// @ts-ignore
import {ApiClient, PersonsApi, PersonFieldsApi} from "pipedrive";
import { getRequiredEnvVariable, PipedriveService } from "./pipedrive";
import { ContactForm } from "../@types/target";
import { removeCreatedPersons } from "./pipedrive/helper.spec";


describe('Pipedrive Service Tests', () => {

    let personClient: any;
    const personIdsToRemove: number[] = [];
    const service = new PipedriveService();

    beforeAll(async () => {
        console.info("beforeAll -> Create ApiClient and PersonApiClient");
        const apiClient = new ApiClient();
        apiClient.authentications.api_key.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");
        personClient = new PersonsApi(apiClient);
    });

    afterAll(async () => {
        await removeCreatedPersons(personIdsToRemove, personClient);
    })


    it('should add a new Person correctly with label and language Validation',async () => {
        const contactForm: ContactForm = {
            firstname: 'JEST Markus',
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
        expect(simplePersonResp?.first_name).toBe(contactForm.firstname)
        expect(simplePersonResp?.phone?.find(x => x.value === contactForm.phone)).not.toBeNull()
        expect(simplePersonResp?.email?.find(x => x.value === contactForm.email)).not.toBeNull()
        expect(simplePersonResp?.id).not.toBeNull()
        const personId = simplePersonResp?.id
        if(personId) personIdsToRemove.push(personId)


        expect(response.data?.personLangFieldResponse?.success).toBeTruthy()
        expect(response.data?.addLangForPersonResponse?.success).toBeTruthy()
        expect(response.data?.personLangFieldResponse?.success).toBeTruthy()
        expect(response.data?.addLabelFiledResponse?.success).toBeTruthy()
    })
})