// @ts-ignore
import {ApiClient, PersonsApi, PersonFieldsApi} from "pipedrive";
import {Field, LANGUAGE_KEY, LANGUAGE_MAP, LanguageKey, PipedrivePersonService} from "./person";
import {getRequiredEnvVariable} from "../pipedrive";
import {ContactForm} from "../../@types/target";
import {LANGUAGE_MAPPER} from "./language-mapper";
import { response } from "express";

type pipedriveResponse = {success: boolean; data: unknown}

describe("PipeDrive API Person Test", () => {
    let personClient: any;
    let personFieldClient: any;
    let personIdsToRemove: number[] = [];
    const service = new PipedrivePersonService();
    const PIPEDRIVE_INFO_ACC_ID = 13_132_618;

    beforeAll(async () => {
        console.log("Create ApiClient and PersonApiClient");
        const apiClient = new ApiClient();
        apiClient.authentications.api_key.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");
        personClient = new PersonsApi(apiClient);
        personFieldClient = new PersonFieldsApi(apiClient);
    });

    afterAll(async () => {
        const deleteResponses: pipedriveResponse[] = [];
        if (personIdsToRemove.length !== 0) {
            console.info(`AfterAll -> Delete created Users: ${personIdsToRemove}`);
            
            for (const id of personIdsToRemove) {
                try {
                    const response = (await personClient.deletePerson(id)) as pipedriveResponse;
                    console.info(`AfterAll -> Delete User response: ${JSON.stringify(response)}`);
                    deleteResponses.push(response);
                } catch (error) {
                    console.error(`Failed to delete user with ID ${id}: ${(error as any).message}`);
                }
            }
        }
    
        for (const resp of deleteResponses) {
            if (!resp.data) {
                console.error(JSON.stringify(resp.data));
            }
            expect(resp.success).toBe(true);  // Ensure this matches your testing framework's syntax
        }
    });

    it("should add a new Person into Pipedrive", async () => {
        const contactForm: ContactForm = getContactForm("JEST-TEST-new-user");

        const response = await service.addSimplePerson(personClient, contactForm, PIPEDRIVE_INFO_ACC_ID);
        expect(response.success).toBeTruthy();
        expect((response.data as any).id).not.toBeNull();
        expect((response.data as any).phone[0].value == "0792223344");
        expect((response.data as any).email[0].value == "API-JEST-TEST-email");
        // pipedrivePersonIds.push(response.data.id)
    });

    it("should add a new person and add the language to the person", async () => {
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

    it("should check pipedrive has a valid Language Field", async () => {
        const response = await service.checkLanguage(personFieldClient);
        console.info(JSON.stringify(response));
        expect(response.success).toBeTruthy();
        expect(response.data?.id).toBe(9099);
        expect(response.data?.key).toBe(LANGUAGE_KEY);
    });

    it("should be wrong field", () => {
        const data: Field = {
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
        // let wrongResult = service.validateField(data);
        // expect(wrongResult).toBeFalsy();

        data.key = "bab84189617691c8d2549a1331ad7d8ceca26653";
        // wrongResult = service.validateField(data);
        // expect(wrongResult).toBeFalsy();

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
        const rightResult = service.validateField(data);
        expect(rightResult).toBeTruthy();
    });

    it("test the language mapper, every property should have a german name and the german name could be 5 different languages", () => {
        for (const key in LANGUAGE_MAPPER) {
            const language = LANGUAGE_MAPPER[key as LanguageKey];

            console.debug(`Test Language: ${JSON.stringify(language)}`);

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
