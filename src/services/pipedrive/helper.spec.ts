import {ContactForm} from '../../@types/target';

type PipedriveResponse = {success: boolean; data: unknown};

export async function removeCreatedPersons(personIdsToRemove: number[], personClient: any) {
    const deleteResponses: PipedriveResponse[] = [];
    if (personIdsToRemove.length !== 0) {
        console.info(`afterAll -> Delete created Users: ${personIdsToRemove}`);

        for (const id of personIdsToRemove) {
            try {
                const response = (await personClient.deletePerson(id)) as PipedriveResponse;
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
        expect(resp.success).toBe(true);
    }
}

export async function removeOrganization(organizationsIdsToRemove: number[], orgClient: any) {
    const deleteResponses: PipedriveResponse[] = [];
    if (organizationsIdsToRemove.length !== 0) {
        console.info(`afterAll -> Delete created Users: ${organizationsIdsToRemove}`);

        for (const id of organizationsIdsToRemove) {
            try {
                const response = (await orgClient.deleteOrganization(id)) as PipedriveResponse;
                console.info(`afterAll -> Delete Organization response: ${JSON.stringify(response)}`);
                deleteResponses.push(response);
            } catch (error) {
                console.error(`afterAll -> Failed to delete Organization with ID ${id}: ${(error as any).message}`);
            }
        }
    }

    for (const resp of deleteResponses) {
        if (!resp.data) {
            console.error(`afterAll -> ${JSON.stringify(resp.data)}`);
        }
        expect(resp.success).toBe(true);
    }
}

export function getContactForm(id: string): ContactForm {
    return {
        name: `${id}-firstname`,
        organization: `${id}-org`,
        email: `${id}-email`,
        phone: `0792223344`,
        message: `This is a test form fidentity API`,
        language: `de-CH`,
    };
}
