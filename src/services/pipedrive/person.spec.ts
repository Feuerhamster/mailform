// @ts-ignore
import {ApiClient, PersonsApi, PersonFieldsApi} from "pipedrive";
import {LABEL_FIELD_ID, LABEL_OPTION, LANGUAGE_KEY, LANGUAGE_MAP, PipedrivePersonService} from "./person";
import {getRequiredEnvVariable} from "../pipedrive";
import {ContactForm} from "../../@types/target";
import {LANGUAGE_MAPPER} from "./language-mapper";
import { Field, LanguageKey, LanguageOption } from "./types";

type pipedriveResponse = {success: boolean; data: unknown}

describe("PipeDrive API Person Test", () => {
    let personClient: any;
    let personFieldClient: any;
    const personIdsToRemove: number[] = [];
    const service = new PipedrivePersonService();
    const PIPEDRIVE_INFO_ACC_ID = 13_132_618;

    beforeAll(async () => {
        console.info("beforeAll -> Create ApiClient and PersonApiClient");
        const apiClient = new ApiClient();
        apiClient.authentications.api_key.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");
        personClient = new PersonsApi(apiClient);
        personFieldClient = new PersonFieldsApi(apiClient);
    });

    afterAll(async () => {
        const deleteResponses: pipedriveResponse[] = [];
        if (personIdsToRemove.length !== 0) {
            console.info(`afterAll -> Delete created Users: ${personIdsToRemove}`);
            
            for (const id of personIdsToRemove) {
                try {
                    const response = (await personClient.deletePerson(id)) as pipedriveResponse;
                    console.info(`afterAll -> Delete User response: ${JSON.stringify(response)}`);
                    deleteResponses.push(response);
                } catch (error) {
                    console.error(`afterAll -> Failed to delete user with ID ${id}: ${(error as any).message}`);
                }
            }
        }
    
        for (const resp of deleteResponses) {
            if (!resp.data) {
                console.error(`afterAll -> ${JSON.stringify(resp.data)}`);
            }
            expect(resp.success).toBe(true);  // Ensure this matches your testing framework's syntax
        }
    });

    it("addSimplePerson -> should add a new Person into Pipedrive", async () => {
        const contactForm: ContactForm = getContactForm("JEST-TEST-new-user");

        const response = await service.addSimplePerson(personClient, contactForm, PIPEDRIVE_INFO_ACC_ID);
        console.log(response)
        expect(response.success).toBeTruthy();
        expect((response.data as any).id).not.toBeNull();
        expect((response.data as any).phone[0].value == "0792223344");
        expect((response.data as any).email[0].value == "API-JEST-TEST-email");
        personIdsToRemove.push((response.data as any).id)
    });

    it("addSimplePerson, addLanguageForPerson -> should add a new person and add the language to the person", async () => {
        const contactForm: ContactForm = getContactForm("JEST-TEST-update-user");

        const simplePersonResp = await service.addSimplePerson(personClient, contactForm, PIPEDRIVE_INFO_ACC_ID);
        expect(simplePersonResp.success);

        const id = (simplePersonResp.data as any).id as number;
        expect(id).not.toBeNull();
        personIdsToRemove.push(id);

        const addLangForPersonResp = await service.addLanguageForPerson(personClient, contactForm, id);
        if(!addLangForPersonResp.success) throw addLangForPersonResp.error
        expect(addLangForPersonResp.success).toBeTruthy();
        const data = addLangForPersonResp.data as any
        expect(data[LANGUAGE_KEY] == 88)
        expect(data[LANGUAGE_KEY] == LANGUAGE_MAP['Deutsch'])

    });

    it('addSimplePerson, addInboundLabelToPerson -> should add a new person and then add the Inbound Webform to the person', () => {
        
    })

    it("checkLanguage -> should check pipedrive has a valid Language Field", async () => {
        const response = await service.checkLanguage(personFieldClient);
        expect(response.success).toBeTruthy();
        expect(response.data?.id).toBe(9099);
        expect(response.data?.key).toBe(LANGUAGE_KEY);
    });

    it('checkLabelId -> should check pipedrive has a valid Label ID', async () => {
        const response = await service.checkLabelId(personFieldClient)
        console.log(JSON.stringify(response))
        expect(response.success).toBeTruthy()
        expect(response.data?.id).toBe(LABEL_FIELD_ID)
        expect(response.data?.options[0].id).toBe(LABEL_OPTION.id)
        expect(response.data?.options[0].label).toBe(LABEL_OPTION.label)
    })

    it("validateLanguageField -> should be wrong field", () => {
        const data: Field<LanguageOption> = {
            id: 7902846,
            key: "wrong-hash",
            name: "name",
            options: [
                {
                    id: 88,
                    label: "Deutsch",
                },
                {
                    id: 0,
                    label: "WRONG LANG",
                },
            ],
        };
        let wrongResult = service.validateLanguageField(data);
        expect(wrongResult).toBeFalsy();

        data.key = "bab84189617691c8d2549a1331ad7d8ceca26653";
        wrongResult = service.validateLanguageField(data);
        expect(wrongResult).toBeFalsy();

        data.options = [
            {
                id: 88,
                label: "Deutsch",
            },
            {
                id: 89,
                label: "Englisch",
            },
            {
                id: 90,
                label: "Französisch",
            },
            {
                id: 92,
                label: "Italienisch",
            },
            {
                id: 91,
                label: "Spanisch",
            },
        ];
        const rightResult = service.validateLanguageField(data);
        expect(rightResult).toBeTruthy();
    });

    it('validateLabelIdField, should validates correctly', () => {
        
    })

    it("test the language mapper, every property should have a german name and the german name could be 5 different languages", () => {
        for (const key in LANGUAGE_MAPPER) {
            const language = LANGUAGE_MAPPER[key as LanguageKey];

            expect(language.germanName).not.toBeNull;
            expect(["Deutsch", "Englisch", "Französisch", "Spanisch", "Italienisch"]).toContain(language.germanName);
            const staticLangFromCode = Object.keys(LANGUAGE_MAP);
            expect(staticLangFromCode).toContain(language.germanName);
        }
    });
});

function getContactForm(id: string): ContactForm {
    return {
        firstname: `${id}-firstname`,
        lastname: `${id}-lastname`,
        org: `${id}-org`,
        email: `${id}-email`,
        phone: `0792223344`,
        msg: `This is a test form fidentity API`,
        language: `de-CH`,
    };
}
