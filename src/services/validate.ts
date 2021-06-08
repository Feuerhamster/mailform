import validate from "validate.js";
import {NextFunction, Request, Response} from "express";

// Middleware to validate custom fields in Request body
function _validationMiddleware(req: Request, res: Response, next: NextFunction, schema: Object) {

    let errors: any[] | undefined = validate(req.body, schema, { format: "detailed" });

    // Go next if there is no errors
    if( errors === undefined ){
        return next();
    }

    errors = errors.map((err) => {
        return { field: err.attribute, violated: err.validator, expect: err.options };
    });

    return res.status(422).json({ error: "validation_error", problems: errors });

}


export function validateMiddleware(schema: Object): any {
    return (req, res, next) => _validationMiddleware(req, res, next, schema);
}

export default validateMiddleware;