import { Target } from "$models/database.js";
import { File as FormidableFile, Files as FormidableFiles } from "formidable";
import nodemailer, { Transporter } from "nodemailer";
import { Attachment as NodemailerAttachment } from "nodemailer/lib/mailer";

/**
 * Map file objects from formidable to attachment objects for nodemailer
 * @param files Formidable files
 * @return NodemailerAttachment[]
 */
function mapFormidableFilesToNodemailerAttachments(files: FormidableFiles): NodemailerAttachment[] {
	const attachments: NodemailerAttachment[] = [];

	for (const fileKey in files) {
		const fileValue = files[fileKey];
		if (!fileValue) continue;
		const fileValues: FormidableFile[] = fileValue instanceof Array ? fileValue : [fileValue];

		for (const singleFileValue of fileValues) {
			attachments.push(mapFormidableFileToNodemailerAttachment(singleFileValue));
		}
	}
	return attachments;
}

/**
 * Map file object from formidable to attachment object for nodemailer
 * @param file Formidable file
 * @return NodemailerAttachment
 */
function mapFormidableFileToNodemailerAttachment(file: FormidableFile): NodemailerAttachment {
	return {
		path: file.filepath,
		filename: file.originalFilename || undefined,
		contentType: file.mimetype || undefined,
	};
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
	files: FormidableFiles,
): Promise<boolean | Error> {
	const transporter = nodemailer.createTransport(target.smtp);

	await transporter.sendMail({
		from: target.from,
		replyTo,
		to: target.recipients,
		subject,
		html: body,
		attachments: mapFormidableFilesToNodemailerAttachments(files),
	});

	return true;
}
