import nodemailer, {Transporter} from "nodemailer";
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
     * @return Promise<boolean|Error> True if success, error object if not success
     */
    public static async sendMail(targetName: string, from: string, subject: string, body: string): Promise<boolean|Error> {

        if(!this.targetTransports.has(targetName)) return false;

        let target: Target = TargetManager.targets.get(targetName);

        let transporter: Transporter = this.targetTransports.get(targetName);

        try {
            await transporter.sendMail({
                from,
                replyTo: from,
                to: target.recipients,
                subject,
                html: body
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