import { Request, Response, NextFunction, CookieOptions } from 'express'
import { ServerAuthErrorCode, sendGenericError } from '@jabz/express-security-middleware-util'
import { generateAccessToken, generateRefreshToken } from '@jabz/security-utils/lib/jwt/GenerateUserTokens'
import { verifyJWT } from '@jabz/security-utils/lib/jwt/JwtGeneration'
import { getSecureCookies, setSecureCookies } from '../cookies'




export interface TokenData {
    userID: string
    data: { [key: string]: any }
}
export type TokenInsertFunction = ((data: any) => Promise<TokenData>) | ((data: any) => TokenData)

export enum TokenType {
    refreshToken,
    accessToken
}
export interface Logger {
    info: ((message: any) => void) | ((message: any) => Promise<void>);
    warn: ((message: any) => void) | ((message: any) => Promise<void>);
    error: ((message: any) => void) | ((message: any) => Promise<void>);
    debug: ((message: any) => void) | ((message: any) => Promise<void>);
}
export interface AddCookieOptions {
    tokenType: TokenType,
    tokenInsertFunction: TokenInsertFunction,
    logger?: Logger
    cookieOptions?: CookieOptions
}

function getCookieKey(tokenType: TokenType) { return (tokenType === TokenType.refreshToken) ? TokenType[TokenType.refreshToken] : TokenType[TokenType.accessToken] }

export function addTokenMiddleWare(config: AddCookieOptions) {
    const { tokenType, tokenInsertFunction, cookieOptions, logger } = config;
    const generateToken = (tokenType === TokenType.refreshToken) ? generateRefreshToken : generateAccessToken;
    const cookieKey = getCookieKey(tokenType);

    return async (request: Request, response: Response, next: NextFunction) => {
        await logger?.debug(`add token middle ware active - type:${tokenType}, cookieKey:${cookieKey}`);
        try {
            await logger?.debug('token middle ware try');
            const result = await tokenInsertFunction(request.body);
            await logger?.debug(`insert function result: ${JSON.stringify(result)} `);
            const token = generateToken(result.userID, result.data);
            await logger?.debug(`token generated: ${token} `)
            const data = { [cookieKey]: token }
            setSecureCookies(response, data, cookieOptions)
            await logger?.debug(`middle ware calling next`)
            return next()
        } catch (error) {
            await logger?.error(`middleware Error:\n ${JSON.stringify(error)}`);
            return sendGenericError(response, ServerAuthErrorCode.serverError);
        }
    }
}

export interface CheckAuthorizationOptions {
    tokenType: TokenType
    jwtAudience?: string
}

export function checkAuthorization(config: CheckAuthorizationOptions) {
    const { tokenType, jwtAudience } = config;
    return (request: Request, response: Response, next: NextFunction) => {
        const cookieKey = getCookieKey(tokenType)
        const tokenMissingType = tokenType === TokenType.refreshToken ? ServerAuthErrorCode.refreshTokenNotFound : ServerAuthErrorCode.accessTokenNotFound
        const tokenNotValidMessage = tokenType === TokenType.refreshToken ? ServerAuthErrorCode.refreshTokenNotValid : ServerAuthErrorCode.accessTokenNotValid
        try {
            const cookies: string | undefined = getSecureCookies(request)[cookieKey];
            if (!cookies) return sendGenericError(response, tokenMissingType);
            else if (verifyJWT(cookies, jwtAudience)) return next();
            else return sendGenericError(response, tokenNotValidMessage);
        } catch (error) {
            return sendGenericError(response, ServerAuthErrorCode.serverError)
        }
    }
}