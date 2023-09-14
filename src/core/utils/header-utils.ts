export function parseHeaders(headers: Headers) {
    const parsedHeaders: Record<string, string | string[]> = {}
    headers.forEach((value, key) => {
        key = ['Referrer', ' Referer', 'referrer', 'referer'].includes(key) ? 'referrer' : key
        if (parsedHeaders[key]) {
            if (Array.isArray(parsedHeaders[key])) {
                (parsedHeaders[key] as string[]).push(value)
            } else if (typeof parsedHeaders[key] === 'string') {
                parsedHeaders[key] = [parsedHeaders[key] as string, value]
            }
        } else {
            parsedHeaders[key] = value
        }
    })
    return parsedHeaders
}
