import { BanhMiApplication } from "./BanhMiApplication";

export type JsonSerializable =
    | null
    | undefined
    | boolean
    | number
    | string
    | JsonSerializable[]
    | { [key: string]: JsonSerializable }
    | { [key: number]: JsonSerializable };

export type BanhMiResponseBodyAcceptedType = ReadableStream<any> | BlobPart | BlobPart[] | FormData | JsonSerializable | null | undefined;


export interface BanhMiCookieOptions {
    maxAge?: number; // Default: none
    expires?: Date; // Default: none
    httpOnly?: boolean; // Default: true
    secure?: boolean; // Default: false
    sameSite?: boolean | string; // Default: 'Lax'
    domain?: string; // Default: none
    path?: string; // Default: '/'
    secureProxy?: boolean; // Default: false
    signed?: boolean; // Default: false
    encode?: (val: string) => string; // Default: encodeURIComponent
}


export class BanhMiResponse {

    #status: number = 200
    app: BanhMiApplication

    constructor(app: BanhMiApplication) {
        this.app = app
    }

    #headers: Record<string, string> = {}
    #cookies: Record<string, string> = {}


    async sendFile(path: string) {
        // Default options for the Response constructor
        const responseOptions: ResponseInit = {
            headers: this.#headers,
        };
        const mimeType = this.app.getMimeTypeIfReqestingFileInsteadOfARoute(path)
        if (mimeType) {
            const fullFilePath = this.app.staticFolder + path
            const file = Bun.file(fullFilePath)
            const fileExists = await file.exists()
            if (!fileExists) {
                responseOptions.status = 404
                responseOptions.statusText = "Not Found"
                // add content type header with the appropriate mime type
                responseOptions.headers = this.#setCookiesToHeaders(new Headers({
                    ...responseOptions.headers,
                    "content-type": "text/plain"
                }))
                return new Response("Not Found", responseOptions)
            }
            const fileContent = file.size === 0 ? '' : await file.text()
            responseOptions.status = 200
            responseOptions.statusText = "OK"
            responseOptions.headers = this.#setCookiesToHeaders(new Headers({
                ...responseOptions.headers,
                "content-type": mimeType
            }))
            return new Response(fileContent, responseOptions)
        }
    }

    send(data?: BanhMiResponseBodyAcceptedType) {
        // Default options for the Response constructor
        const responseOptions: ResponseInit = {
            headers: this.#headers,
        };

        let body: any

        // Handle different data types
        if (data !== undefined) {
            if (data instanceof ReadableStream || data instanceof Blob || data instanceof FormData || data === null) {
                responseOptions.status = 200
                responseOptions.statusText = "OK"
                responseOptions.headers = this.#setCookiesToHeaders(new Headers(responseOptions.headers))
                body = data;
            } else if (['boolean', 'number', 'string', 'object'].includes(typeof data)) {
                // Convert objects to JSON and set appropriate headers
                try {
                    body = JSON.stringify(data);
                    responseOptions.status = 200
                    responseOptions.statusText = "OK"
                    responseOptions.headers = this.#setCookiesToHeaders(new Headers({
                        ...responseOptions.headers,
                        'Content-Type': 'application/json',
                    }))
                } catch (error) {
                    throw new Error('Given object is not json serializable');
                }

            } else {
                // Handle other types or unsupported types here
                throw new Error('Unsupported data type');
            }
        }

        // Create and return the Response object
        return new Response(data === undefined ? data : body, responseOptions);
    }

    sendArrayOfBlobPart(data: BlobPart[]) {
        const responseOptions: ResponseInit = {
            status: 200,
            statusText: "OK",
            headers: this.#setCookiesToHeaders(new Headers(this.#headers)),
        };
        return new Response(data, responseOptions);
    }

    json(data: JsonSerializable) {
        const responseOptions: ResponseInit = {
            headers: this.#headers,
        };
        if (['boolean', 'number', 'string', 'object', 'null', 'undefined'].includes(typeof data)) {
            // Convert objects to JSON and set appropriate headers
            try {
                const body = JSON.stringify(data);
                responseOptions.status = 200
                responseOptions.statusText = "OK"
                responseOptions.headers = this.#setCookiesToHeaders(new Headers({
                    ...responseOptions.headers,
                    'Content-Type': 'application/json',
                }));
                return new Response(body, responseOptions);
            } catch (error) {
                throw new Error('Given object is not json serializable');
            }

        } else {
            throw new Error('Given value is not json serializable');
        }
    }


    redirect(url: string, status: number = 302) {
        const responseOptions: ResponseInit = {
            status,
            headers: {
                Location: url,
                ...(this.#setCookiesToHeaders(new Headers(this.#headers))),
            },
        };
        return new Response(null, responseOptions);
    }

    setHeader(key: string, value: string) {
        // check if a header with the given key already exists
        const header = this.#headers[key];
        if (header) {
            // if it does, append the new value to the existing one
            this.#headers[key] = `${header}, ${value}`;
        }
        // if it doesn't, set the header with the given key and value
        this.#headers[key] = value;
        return this;
    }


    setCookie(
        name: string,
        value: string,
        options: BanhMiCookieOptions = {
            httpOnly: true,
            sameSite: 'Lax',
            secure: false,
            path: '/',
            encode: encodeURIComponent,
        }
    ) {


        options.encode = options.encode || encodeURIComponent;
        options.path = options.path || '/';
        options.sameSite = options.sameSite || 'Lax';
        options.secure = options.secure || false;
        options.httpOnly = options.httpOnly || true;

        const { domain, encode, expires, httpOnly, maxAge, path, sameSite, secure, secureProxy, signed } = options

        // Create the cookie string
        let cookieString = `${encode(name)}=${encode(value)}`;

        // Add optional attributes
        if (domain) {
            cookieString += `; Domain=${domain}`;
        }
        if (expires) {
            cookieString += `; Expires=${expires.toUTCString()}`;
        } else if (maxAge) {
            cookieString += `; Max-Age=${maxAge}`;
        }
        if (path) {
            cookieString += `; Path=${path}`;
        }
        if (sameSite) {
            cookieString += `; SameSite=${sameSite}`;
        }
        if (secure) {
            cookieString += `; Secure`;
        }
        if (secureProxy) {
            cookieString += `; SecureProxy`;
        }
        if (httpOnly) {
            cookieString += `; HttpOnly`;
        }
        if (signed) {
            // You can add your code to sign the cookie here
        }

        // Store the cookie string in your application's data structure
        this.#cookies[name] = cookieString;

        // Return the response object to allow method chaining
        return this;

    }

    #setCookiesToHeaders(headers: Headers) {
        for (const cookieName in this.#cookies) {
            headers.append('Set-Cookie', this.#cookies[cookieName]);
        }
        // return as a HeadersInit object
        return headers.entries();
    }
}


