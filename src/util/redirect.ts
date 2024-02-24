import {Request} from "express";

/**
 * Create absolute Url from relative redirectUrl
 * @param req incoming Request
 * @param targetRedirectUrl redirectUrl from target
 * @returns String
 */
function getRedirectUrl(req: Request, targetRedirectUrl: string) {
    let redirectUrl = targetRedirectUrl

    const urlPattern = /^(https?):\/\//;
    if(!urlPattern.test(redirectUrl)) {
        redirectUrl = (req.header('Referer') || '/') + redirectUrl;
    }

    return redirectUrl
}

export default getRedirectUrl;