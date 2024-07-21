import {
    NewOrganization,
    UpdateOrganization,
    //@ts-ignore
} from "pipedrive";
import {ContactForm} from "../../@types/target";
import {Field, LabelField, LabelFieldResponse, OrganizationItemResponse, Response} from "./types";
import {PIPEDRIVE_INFO_ACC_ID} from "../pipedrive";
import {PERSON_LABEL_OPTION, validateLabelIdField} from "./person";

export const ORG_LABEL_ID = 4041;
export const ORG_LABEL_OPTION = {
    id: 113,
    label: "Inbound Webformular",
};

export class PipedriveOrganizationService {
    // https://github.com/pipedrive/client-nodejs/blob/master/docs/OrganizationsApi.md#addOrganization
    async addSimpleOrganization(client: any, req: ContactForm): Promise<OrganizationItemResponse> {
        console.info(`PipedriveService -> addOrganization -> send a addLead request to Pipedrive`);

        const opts = NewOrganization.constructFromObject({
            name: req.org,
            owner_id: PIPEDRIVE_INFO_ACC_ID,
        });

        try {
            const response = await client.addOrganization(opts);
            console.info(`PipedriveService -> addOrganization -> received response: ${JSON.stringify(response)}`);

            return response.success === true
                ? {
                      success: true,
                      data: response.data,
                      msg: () => console.info("Successfully added a new Organization"),
                  }
                : {
                      success: false,
                      error: new Error(JSON.stringify(response.data)),
                      msg: () => console.error("Request goes wrong -> add Organization"),
                  };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            console.error(`PipedriveService -> addOrganization -> error: ${errorMessage}`);

            return {
                success: false,
                error: error instanceof Error ? error : new Error(errorMessage),
                msg: () => console.error("An error occurred while adding the organization"),
            };
        }
    }

    async checkLabelId(client: any): Promise<LabelFieldResponse> {
        try {
            const response = await client.getOrganizationField(ORG_LABEL_ID);

            if (response.success) {
                console.info(`checkLabelId -> getPersonField response: ${JSON.stringify(response)}`);
                const labelField = response.data as Field<LabelField>;
                const isValid = validateLabelIdField(labelField, ORG_LABEL_OPTION);
                return {
                    success: isValid,
                    data: labelField,
                    msg: () =>
                        isValid
                            ? console.info("Label check PASS, Everything is okay")
                            : console.error(
                                  `Label check FAIL, because we can't find: ${JSON.stringify(
                                      PERSON_LABEL_OPTION
                                  )} in ${JSON.stringify(labelField)}`
                              ),
                };
            }

            return {
                success: false,
                error: new Error(JSON.stringify(response.data)),
                msg: () => console.error("Request goes wrong -> check Label for the label id goes wrong"),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                msg: () => console.error("An error occurred while checking the label id"),
            };
        }
    }

    async addInboundLabelToOrg(client: any, orgId: number): Promise<Response> {
        const updateData = {
            label: ORG_LABEL_OPTION.id,
            label_ids: [ORG_LABEL_OPTION.id],
        };

        try {
            const response = await client.updateOrganization(orgId, updateData);
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    msg: () => console.info("Successfully updated the the Inbound Webfrom Label to the Organization"),
                };
            }

            return {
                success: false,
                error: new Error(JSON.stringify(response.data)),
                msg: () => console.error("Request goes wrong -> update Inbound Webform to Organization"),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(JSON.stringify(error)),
                msg: () =>
                    console.error(
                        "An error occurred while updating the organization label, specific add the Inbound Webform"
                    ),
            };
        }
    }

}
