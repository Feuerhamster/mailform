import {validate as validateJS} from "validate.js";

/**
 * Validate custom attributes from request body
 * @param fields Object passed as attributes to validate.js
 * @param schema Object passed as constraints to validate.js
 * @return Object
 */
function validate(fields: any, schema: Object) {
    let errors: any[] | undefined = validateJS(fields, schema, { format: "detailed" });

    if( errors === undefined ){
        return { error: undefined, problems: undefined };
    }

    errors = errors.map((err) => {
        return { field: err.attribute, violated: err.validator, expect: err.options };
    });

    return { error: "validation_error", problems: errors };
}

export default validate;