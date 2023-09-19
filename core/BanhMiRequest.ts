import { BanhMiApplication } from "./BanhMiApplication"
import { parseCookies, parseHeaders } from "./utils/index"



/**
 * BanhMiRequest class
 * TODO: Correct the implementation for url, baseUrl and originalUrl
 * TODO: Add req.protocol
 */
export class BanhMiRequest {
    [x: string]: any

    #request: Request



    /**
     * Current BanhMiApplication instance
     */
    app: BanhMiApplication

    #params: Record<string, string | undefined> = {}


    constructor(app: BanhMiApplication, request: Request, options?: {
        _params?: Record<string, string>
    }) {
        this.app = app
        this.#request = request
        if (options) {
            this.#params = options._params ? options._params : {}
        }
    }


    /**
     * Get dynamic params defined in the path
     * They will have the same name as defined in the path
     * @example
     * ```ts
     * app.get("/books/:bookId", (req, res) => {
     *      console.log(req.params) 
     *      // will give  { bookId: 'whatever-matched-string' }
     * })
     * ```
     */
    get params() {
        return this.#params
    }

    set params(params: Record<string, string | undefined>) {
        this.#params = params
    }


    /**
     * Returns the same params object as BanhMiRequest.params, but will type information you can pass as a generic
     * Useful for autocomplete
     * @example
     * ```ts
     * app.get("/books/:bookId", (req, res) => {
     *      const params = req.getParams<{bookId: string}>()
     *      params.bookId // autocomplete !!
     * })
     * ```
     */
    getParams<ParamsInterface = Record<string, string | undefined>>() {
        return this.#params as ParamsInterface
    }


    #baseUrl: string | null = null
    /**
     * Base url of the request
     */
    get baseUrl() {
        if (this.#baseUrl) return this.#baseUrl
        const fullPath = this.path
        if (fullPath === '/') {
            this.#baseUrl = "/"
            return "/"
        }
        const urlSegments = fullPath.split('/')
        this.#baseUrl = `/${urlSegments[1]}`
        return this.#baseUrl
    }

    #path: string | null = null
    /**
     * Full path of the request
     */
    get path() {
        if (this.#path) return this.#path
        return new URL(this.request.url).pathname
    }

    #hostname: string | null = null
    /**
     * Hostname of the request
     */
    get hostname() {
        if (this.#hostname) return this.#hostname
        return new URL(this.request.url).hostname
    }


    #headers: Record<string, string | string[]> | null = null
    /**
     * Headers as a object
     */
    get headers() {
        if (this.#headers) return this.#headers
        this.#headers = parseHeaders(this.request.headers)
        return this.#headers
    }

    /**
     * In case needed to type the header values
     * @example
     * ```ts
     * const headers = req.getHeaders<{'accept-encoding'?: string}>()
     * headers['accept-encoding'] //Intellisense Works!
     * ```
     * By default has the `Record<string, string | string[]>` type.
     */
    getHeaders<HeaderInterface = Record<string, string | string[]>>() {
        return this.headers as HeaderInterface
    }



    /**
     * Same duty as `req.get('key')` and `req.header('key')` in expressjs.
     * @param key header name
     * @return returns the header value for the given header name, returns undefined if not found
     * @example
     * ```ts
     * const value = req.getHeader('Content-Type') // or req.getHeader('content-type')
     * ```
     * If the header has multiple values, returns a string, otherwise a array of string
     * We can include the generic to explicitly say string or string[], 
     * @example
     * ```ts
     * const value = req.getHeader<string>('Content-Type') // or req.getHeader('content-type')
     * ```
     * but not recommended 
     * as you should probably check and validate it anyways
     * Also, in her, referer and referrer is intechangable, and both cases are supported in at all times.
     * @example
     * `req.getHeader('Cookie')` is the same as `req.getHeader('cookie')`
     */
    getHeader<HeaderType = string | string[]>(key: string) {
        key = ['referrer', 'referer'].includes(key) ? 'referrer' : key.toLowerCase()
        return this.headers[key] as HeaderType | undefined
    }

    #cookies: Record<string, string> | null = null
    /**
     * Cookies as a object
     */
    get cookies() {
        if (this.#cookies) return this.#cookies
        this.#cookies = parseCookies(this.request.headers)
        return this.#cookies
    }

    /**
     * In case needed to type the cookie values
     * @example
     * ```ts
     * const cookies = req.getCookies<{_ga?: string}>()
     * cookies._ga //Intellisense Works!
     * ```
     * By default has the `Record<string, string>` type.
     */
    getCookies<CookiesInterface = Record<string, string>>() {
        return this.cookies as CookiesInterface
    }

    #query: Record<string, string> | null = null
    /**
     * Query parameters as a object
     */
    get query() {
        if (this.#query) return this.#query
        const rawSearchParams = new URL(this.request.url).searchParams
        this.#query = {}
        rawSearchParams.forEach((value, key) => {
            if (this.#query)
                this.#query[key] = value
        })
        return this.#query
    }

    /**
 * In case needed to type the query values
 * @example
 * ```ts
 * const query = req.getCookies<{q?: string;name?: string}>()
 * query.q //Intellisense Works!
 * ```
 * By default has the `Record<string, string>` type.
 */
    getQuery<QueryInterface = Record<string, string>>() {
        return this.query as QueryInterface
    }

    #body: any = null

    get body() {
        return this.#body ?? undefined
    }

    set body(body: any) {
        this.#body = body
    }

    getBody<BodyInterface = any>() {
        return this.body as BodyInterface
    }

}