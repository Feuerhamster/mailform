// @ts-ignore
import {ApiClient, PersonsApi, PersonFieldsApi, OrganizationsApi} from "pipedrive";
import {PERSON_LABEL_FIELD_ID, PERSON_LABEL_OPTION, LANGUAGE_KEY, LANGUAGE_MAP, PipedrivePersonService, validateLabelIdField} from "./person";
import {getRequiredEnvVariable, PipedriveService} from "../pipedrive";
import {ContactForm} from "../../@types/target";
import {LANGUAGE_MAPPER} from "./language-mapper";
import {Field, LabelField, LanguageKey, LanguageOption} from "./types";
import { isTemplateSpan } from "typescript";
import { getContactForm, removeCreatedPersons, removeOrganization } from "./helper.spec";
import { PipedriveOrganizationService } from "./organization";

describe("PipeDrive API Person Test", () => {
    let personClient: any;
    let personFieldClient: any;
    let orgClient: any;
    let service: PipedrivePersonService;
    const personIdsToRemove: number[] = [];
    const organizationsIdsToRemove: number[] = [];
    const PIPEDRIVE_INFO_ACC_ID = 13_132_618;

    beforeAll(async () => {
        console.info("beforeAll -> Create ApiClient and PersonApiClient");
        const apiClient = new ApiClient();
        apiClient.authentications.api_key.apiKey = getRequiredEnvVariable("PIPEDRIVE_API_SECRET");
        personClient = new PersonsApi(apiClient);
        personFieldClient = new PersonFieldsApi(apiClient);
        orgClient = new OrganizationsApi(apiClient);
        service = new PipedrivePersonService();
    });

    afterAll(async () => {
        await removeCreatedPersons(personIdsToRemove, personClient);
        await removeOrganization(organizationsIdsToRemove, orgClient);
    });

    it("addSimplePerson -> should add a new Person into Pipedrive", async () => {
        const contactForm: ContactForm = getContactForm("JEST-TEST-new-user");

        const response = await service.addSimplePerson(personClient, contactForm, PIPEDRIVE_INFO_ACC_ID);
        expect(response.success).toBeTruthy();
        expect((response.data as any).id).not.toBeNull();
        expect((response.data as any).phone[0].value == "0792223344");
        expect((response.data as any).email[0].value == "API-JEST-TEST-email");
        personIdsToRemove.push((response.data as any).id);
    });

    it("addSimplePerson, addLanguageForPerson -> should add a new person and add the language to the person", async () => {
        const contactForm: ContactForm = getContactForm("JEST-TEST-update-user");

        const simplePersonResp = await service.addSimplePerson(personClient, contactForm, PIPEDRIVE_INFO_ACC_ID);
        expect(simplePersonResp.success).toBeTruthy();

        const id = (simplePersonResp.data as any).id as number;
        expect(id).not.toBeNull();
        personIdsToRemove.push(id);

        const addLangForPersonResp = await service.addLanguageForPerson(personClient, contactForm, id);
        if (!addLangForPersonResp.success) throw addLangForPersonResp.error;
        expect(addLangForPersonResp.success).toBeTruthy();
        const data = addLangForPersonResp.data as any;
        expect(data[LANGUAGE_KEY] == 88);
        expect(data[LANGUAGE_KEY] == LANGUAGE_MAP["Deutsch"]);
    });

    it("addSimplePerson, addInboundLabelToPerson -> should add a new person and then add the Inbound Webform to the person", () => {});

    it('addSimplePerson, addOrganization and connect this together', async () => {
        const contactForm: ContactForm = getContactForm("JEST-TEST-connected-with-org");

        const simplePersonResp = await service.addSimplePerson(personClient, contactForm, PIPEDRIVE_INFO_ACC_ID);
        expect(simplePersonResp.success).toBeTruthy();

        const personId = simplePersonResp.data?.id as number
        expect(personId).not.toBeNull();
        personIdsToRemove.push(personId);

        const pipeDriveService = new PipedriveOrganizationService()

        const addOrgResp = await pipeDriveService.addSimpleOrganization(orgClient, contactForm)
        expect(addOrgResp.success).toBeTruthy()

        const orgId = addOrgResp.data?.id as number
        expect(orgId).not.toBeNull()
        organizationsIdsToRemove.push(orgId)

        const response = await service.connectOrgAndPerson(personClient, personId, orgId)
        expect(response.success).toBeTruthy()
    })

    it("checkLanguage -> should check pipedrive has a valid Language Field", async () => {
        const response = await service.checkLanguage(personFieldClient);
        expect(response.success).toBeTruthy();
        expect(response.data?.id).toBe(9099);
        expect(response.data?.key).toBe(LANGUAGE_KEY);
    });

    it("checkLabelId -> should check pipedrive has a valid Label ID", async () => {
        const response = await service.checkLabelId(personFieldClient);
        console.log(JSON.stringify(response));
        expect(response.success).toBeTruthy();
        expect(response.data?.id).toBe(PERSON_LABEL_FIELD_ID);
        const inboundLabelOption = response.data?.options.find((opt) => opt.id === PERSON_LABEL_OPTION.id);
        expect(inboundLabelOption).not.toBeNull();
        expect(inboundLabelOption?.label).toBe(PERSON_LABEL_OPTION.label);
    });

    it("validateLanguageField -> the language field should be wrong and success", () => {
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

    it("validateLabelIdField -> the label filed should be wrong and success", () => {
        const data: Field<LabelField> = {
            id: 1234,
            key: "1234",
            name: "Test",
            options: [
                {
                    id: 1234,
                    label: "abcd",
                    color: "blue",
                },
            ],
        };
        const wrongResult = validateLabelIdField(data, PERSON_LABEL_OPTION)
        expect(wrongResult).toBeFalsy()
        
        data.options.push({
            id: 114,
            label: "Inbound Webformular",
            color: "yellow"
        })

        const rightResult = validateLabelIdField(data, PERSON_LABEL_OPTION)
        expect(rightResult).toBeTruthy()

        data.options = []
        const wrongResultEmpty = validateLabelIdField(data, PERSON_LABEL_OPTION)
        expect(wrongResultEmpty).toBeFalsy()

    });

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


