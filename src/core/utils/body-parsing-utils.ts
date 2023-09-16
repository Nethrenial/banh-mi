import { OptionsJson } from 'body-parser';
import Pako from 'pako';
import bytes from 'bytes'
import { decompress as brotliDecompress } from 'brotli'



export interface ParseJsonBodyOptions extends OptionsJson {
    // Add any additional options specific to your implementation
    brotli?: boolean; // Example: Enable Brotli compression
    limit?: string | number; // Request body size limit
    strict?: boolean; // Strict JSON parsing
    type: string
}

export async function parseJsonBody(request: Request, options: ParseJsonBodyOptions = {
    inflate: true,
    limit: '100kb',
    strict: true,
    type: 'application/json',
    reviver: undefined,
    verify: undefined,
    brotli: false, // Set the default for Brotli compression
}) {
    if (request.bodyUsed) {
        return Promise.resolve(null);
    }

    if (!options) {
        return request.json();
    }
    console.log(request)
    if (request.body) {
        const body = await Bun.readableStreamToBlob(request.body)
        console.log(body)
    }

    const { inflate, limit, reviver, strict, type, verify, brotli } = options;

    // if type is not matched, return null
    if (type && type.indexOf(request.headers.get('content-type') || 'text/plain') === -1) {
        return Promise.resolve(null);
    }

    // Check request body size against the limit
    let contentLength: string | number | null = request.headers.get('content-length');
    if (contentLength) {
        contentLength = parseInt(contentLength, 10);
    }
    const maxBodySize = typeof limit === 'string' ? bytes(limit) : limit;

    if (typeof maxBodySize === 'number' && contentLength && (contentLength as number) > maxBodySize) {
        throw new Error('Request body size exceeds limit');
    }

    // Implement proper production-level parsing and error handling
    const contentEncoding = request.headers.get('content-encoding');

    // Parse based on the content encoding (gzip, deflate, brotli, or none)
    if (contentEncoding === 'gzip' && inflate) {
        // Use a library like 'pako' for Gzip decompression
        const rawBody = await request.arrayBuffer();
        const inflated = Pako.inflate(Buffer.from(rawBody), { to: 'string' });
        const parsedData = JSON.parse(inflated, reviver);
        return parsedData
    } else if (contentEncoding === 'deflate' && inflate) {
        const rawBody = await request.arrayBuffer();
        const inflated = Pako.inflate(Buffer.from(rawBody), { to: 'string' });
        const parsedData = JSON.parse(inflated, reviver);
        return parsedData
    } else if (contentEncoding === 'br' && brotli) {
        // Use a library like 'brotli' for Brotli decompression
        const rawBody = await request.arrayBuffer();
        const inflated = brotliDecompress(Buffer.from(rawBody)).toString();
        const parsedData = JSON.parse(inflated, reviver);
        return parsedData
    } else {
        const body = await request.text();

        if (strict) {
            try {
                const parsed = JSON.parse(body);
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed;
                } else {
                    throw new Error('Strict JSON parsing failed: not an object or array');
                }
            } catch (error) {
                throw new Error('Strict JSON parsing failed: ' + (error as Error).message);
            }
        } else {
            return JSON.parse(body);
        }
    }
}
