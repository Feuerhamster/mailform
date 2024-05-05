import { Target } from "$models/database.js";
import nodemailer, { Transporter } from "nodemailer";
import Mail, { Attachment as NodemailerAttachment } from "nodemailer/lib/mailer";

/**
 * Map file objects from file to attachment objects for nodemailer
 * @param files Multer files
 * @return NodemailerAttachment[]
 */
function mapFilesToNodemailerAttachments(files: Express.Multer.File[]): NodemailerAttachment[] {
	const attachments: NodemailerAttachment[] = [];

	for (const file of files) {
		attachments.push({
			path: file.path,
			filename: file.originalname || undefined,
			contentType: file.mimetype || undefined,
		});
	}

	return attachments;
}

export function mapFiles(files: Express.Request["files"]): Express.Multer.File[] {
	const fileArray: Express.Multer.File[] = [];

	if (Array.isArray(files)) {
		fileArray.push(...files);
	} else if (typeof files === "object") {
		for (const [key, value] of Object.entries(files)) {
			fileArray.push(...value);
		}
	}

	return fileArray;
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
export async function sendMail(
	target: Target,
	replyTo: string,
	subject: string,
	body: string,
	files?: Express.Multer.File[],
): Promise<boolean | Error> {
	const transporter = nodemailer.createTransport(target.smtp);

	let mail: Mail.Options = {
		from: target.from,
		replyTo,
		to: target.recipients,
		subject,
		html: body,
	};

	if (files) {
		mail.attachments = mapFilesToNodemailerAttachments(files);
	}

	await transporter.sendMail(mail);

	return true;
}
