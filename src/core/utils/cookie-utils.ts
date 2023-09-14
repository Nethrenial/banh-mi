export function parseCookies(headers: Headers) {
    const cookies: Record<string, string> = {};

    const cookieHeader = headers.get('cookie')

    if (cookieHeader) {
        const rawCookies = cookieHeader.split('; ');

        rawCookies.forEach(rawCookie => {
            const parts = rawCookie.split('=');
            const name = parts[0];
            const value = decodeURIComponent(parts[1]);
            cookies[name] = value;
        });
    }
    return cookies
}
