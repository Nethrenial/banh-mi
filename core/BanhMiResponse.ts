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

export class BanhMiResponse {

    private _status: number = 200
    app: BanhMiApplication 

    constructor(app: BanhMiApplication) {
        this.app = app
    }


    async sendFile(path: string) {
        
        const mimeType = this.app.getMimeTypeIfReqestingFileInsteadOfARoute(path)
        console.log(mimeType)
        if (mimeType) {
            console.log("Requesting a file with ", mimeType)
            const fullFilePath = this.app.staticFolder + path
            console.log(fullFilePath)
            const file = Bun.file(fullFilePath)
            const fileExists = await file.exists()
            if(!fileExists) {
                return new Response("Not Found", {
                    status: 404,
                    statusText: "Not Found"
                })
            }
            const fileContent = file.size === 0 ? '' : await file.text()
            return new Response(fileContent, {
                headers: {
                    "content-type": mimeType
                }
            })
        }
    }

    send(data?: BanhMiResponseBodyAcceptedType) {
        // Default options for the Response constructor
        const responseOptions: ResponseInit = {};

        let body: any

        // Handle different data types
        if (data !== undefined) {
            if (data instanceof ReadableStream || data instanceof Blob || data instanceof FormData || data === null) {
                body = data;
            } else if (['boolean', 'number', 'string', 'object'].includes(typeof data)) {
                // Convert objects to JSON and set appropriate headers
                try {
                    body = JSON.stringify(data);
                    responseOptions.headers = {
                        ...responseOptions.headers,
                        'Content-Type': 'application/json',
                    };
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
        const responseOptions: ResponseInit = {};
        return new Response(data, responseOptions);
    }

    json(data: JsonSerializable) {
        const responseOptions: ResponseInit = {};
        if (['boolean', 'number', 'string', 'object', 'null', 'undefined'].includes(typeof data)) {
            // Convert objects to JSON and set appropriate headers
            try {
                const body = JSON.stringify(data);
                responseOptions.headers = {
                    ...responseOptions.headers,
                    'Content-Type': 'application/json',
                };
                return new Response(body, responseOptions);
            } catch (error) {
                throw new Error('Given object is not json serializable');
            }

        } else {
            throw new Error('Given value is not json serializable');
        }
    }

}