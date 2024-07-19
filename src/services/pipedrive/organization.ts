import {
    NewOrganization,
    //@ts-ignore
} from "pipedrive";
import { ContactForm } from "../../@types/target";
import { OrganizationResponse } from "./types";
import { PIPEDRIVE_INFO_ACC_ID } from "../pipedrive";




export class PipedriveOrganizationService {

    // https://github.com/pipedrive/client-nodejs/blob/master/docs/OrganizationsApi.md#addOrganization
    async addSimpleOrganization(client: any, req: ContactForm): Promise<OrganizationResponse> {
        console.info(
            `PipedriveService -> addOrganization -> send a addLead request to Pipedrive`
        );

        const opts = NewOrganization.constructFromObject({
            name: req.org,
            owner_id: PIPEDRIVE_INFO_ACC_ID,
        });

        const response: OrganizationResponse = await client.addOrganization(opts);

        console.info(`PipedriveService -> addOrganization -> received response: ${JSON.stringify(response)}`);
        return response.success == true
            ? {
                  success: true,
                  data: response.data,
                  msg: "Everything is okay",
              }
            : {
                  success: false,
                  error: new Error(String(response.data)),
                  msg: "Request goes wrong -> add Organization",
              };
    }

    async addInboundLabelToOrganization() {
        
    }

}