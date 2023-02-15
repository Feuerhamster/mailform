import {File as FormidableFile, Files as FormidableFiles} from "formidable";
import nodemailer, {Transporter} from "nodemailer";
import {Attachment as NodemailerAttachment} from "nodemailer/lib/mailer";
import {TargetManager} from "./targetManager";
import {Target} from "../@types/target";

export class EmailService {

    private static targetTransports: Map<string, Transporter> = new Map<string, Transporter>();

    /**
     * Register a target in the email service
     * @param targetName (file-)name of an existing and loaded target
     * @param smtpURL A valid SMTP(S) URL
     */
    public static registerTarget(targetName: string, smtpURL: string): void {
        this.targetTransports.set(targetName, nodemailer.createTransport(smtpURL));
    }

    /**
     * Map file objects from formidable to attachment objects for nodemailer
     * @param files Formidable files
     * @return NodemailerAttachment[]
     */
    private static mapFormidableFilesToNodemailerAttachments(files: FormidableFiles): NodemailerAttachment[] {
        const attachments: NodemailerAttachment[] = [];

        for (const fileKey in files) {
            const fileValue = files[fileKey];
            const fileValues: FormidableFile[] = fileValue instanceof Array ? fileValue : [fileValue]

            for (const singleFileValue of fileValues) {
                attachments.push(this.mapFormidableFileToNodemailerAttachment(singleFileValue));
            }
        }
        return attachments;
    }

    /**
     * Map file object from formidable to attachment object for nodemailer
     * @param file Formidable file
     * @return NodemailerAttachment
     */
    private static mapFormidableFileToNodemailerAttachment(file: FormidableFile): NodemailerAttachment {
        return {
            path: file.filepath,
            filename: file.originalFilename,
            contentType: file.mimetype,
        };
    }

    /**
     * Format an email "from" field with an address, first name and last name
     * @param from
     * @param firstName
     * @param lastName
     * @return string The formatted "from" field
     */
    public static formatFromField(from: string, firstName: string = null, lastName: string = null): string {

        let result = "";

        if(firstName) result += firstName;

        if(firstName && lastName) result += " ";

        if(lastName) result += lastName;

        if(result.length > 0) result += ` <${from}>`;

        if(result.length < 1) result = from;

        return result;

    }

    /**
     * Send an email
     * @param targetName (file-)name of an existing and loaded target
     * @param from Email from field
     * @param subject Email subject field
     * @param body Email body
     * @param files Formidable files
     * @return Promise<boolean|Error> True if success, error object if not success
     */
    public static async sendMail(targetName: string, from: string, subject: string, body: string, files: FormidableFiles): Promise<boolean|Error> {

        if(!this.targetTransports.has(targetName)) return false;

        let target: Target = TargetManager.targets.get(targetName);

        let transporter: Transporter = this.targetTransports.get(targetName);

        try {
            await transporter.sendMail({
                from,
                replyTo: from,
                to: target.recipients,
                subject,
                html: body,
                attachments: this.mapFormidableFilesToNodemailerAttachments(files),
            });
        } catch (e) {
            console.error("[!] An error occurred while sending an email");
            console.error("* target: " + targetName);
            console.error("* " + e.message);
            return e;
        }

        console.log(`Email successful sent`);
        console.log("* target: " + targetName);
        console.log("* time: " + new Date().toString());

        return true;

    }

}