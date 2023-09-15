export function onlyLogInFrameworkDevelopmentProcess(...args: any[]) {
    if (Bun.env['BANH_MI_ENV'] === 'development') {
        console.log(...args)
    }
} 