import hash from 'object-hash';
import { Request, Response, CookieOptions } from 'express'


export function getCookieKey() {
    let cookies: string[] = []
    if (cookies.length < 1) {
        for (let i = 0; i < 100; i++) {
            let next = process.env[`SERVER_HTTP_COOKIES_KEY${i}`]
            if (next) {
                cookies.push(hash(next))
            }
        }

    }
    if (cookies.length < 1) {
        cookies.push(hash("default1"))
        cookies.push(hash("default2"))
    }
    return cookies
}

export function getGeneralCookies(request: Request): { [key: string]: string } {
    return request.cookies
}

export function getSecureCookies(request: Request): { [key: string]: string } {
    return request.signedCookies
}

export interface CookieData {
    [key: string]: any
}
export function setGeneralCookies(response: Response, data: CookieData, options?: CookieOptions) {
    Object.keys(data).forEach((e) => {
        response.cookie(e, JSON.stringify(data[e]), {
            ...options,
            httpOnly: true
        })
    })
}

export function setSecureCookies(response: Response, data: CookieData, options?: CookieOptions) {
    Object.keys(data).forEach((e) => {
        response.cookie(e, JSON.stringify(data[e]), {
            ...options,
            httpOnly: true,
            signed: true,
        });
    });
}




