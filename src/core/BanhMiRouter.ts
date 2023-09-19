import { BanhMiHandler, BanhMiRouterRouteHandlersMap } from './types';
export class BanhMiRouter {
    routerHandlersMap: BanhMiRouterRouteHandlersMap = {
        GET: {},
        POST: {},
        PATCH: {},
        PUT: {},
        DELETE: {}
    }

    get(path: string, ...handlers: BanhMiHandler[]) {
        this.routerHandlersMap.GET[path] = handlers
    }

    post(path: string, ...handlers: BanhMiHandler[]) {
        this.routerHandlersMap.POST[path] = handlers
    }

    patch(path: string, ...handlers: BanhMiHandler[]) {
        this.routerHandlersMap.PATCH[path] = handlers
    }

    put(path: string, ...handlers: BanhMiHandler[]) {
        this.routerHandlersMap.PUT[path] = handlers
    }
    
    delete(path: string, ...handlers: BanhMiHandler[]) {
        this.routerHandlersMap.DELETE[path] = handlers
    }
}