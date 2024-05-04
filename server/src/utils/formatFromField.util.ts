/**
 * Format an email "from" field with an address, first name and last name
 * @param from
 * @param firstName
 * @param lastName
 * @return string The formatted "from" field
 */
export function formatFromField(from: string, firstName?: string, lastName?: string): string {
	let result = "";

	if (firstName) result += firstName;

	if (firstName && lastName) result += " ";

	if (lastName) result += lastName;

	if (result.length > 0) result += ` <${from}>`;

	if (result.length < 1) result = from;

	return result;
}
