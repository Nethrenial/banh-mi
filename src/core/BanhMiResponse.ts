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
                console.log(body)
                return new Response(body, responseOptions);
            } catch (error) {
                throw new Error('Given object is not json serializable');
            }

        } else {
            throw new Error('Given value is not json serializable');
        }
    }

}