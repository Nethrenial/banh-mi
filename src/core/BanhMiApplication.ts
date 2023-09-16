import { Server as BunServer } from "bun"
import { BanhMiRequest } from "./BanhMiRequest.js"
import { BanhMiResponse } from "./BanhMiResponse.js"
import { BanhMiHttpMethod, BanhMiRouteType } from "./enums/index.js"
import { BanhMiBodyParsingMethod, BanhMiHandler, BanhMiRouteHandlersMap, BanhMiRouteMatcherNode, SetupBodyParserOption } from "./types/index.js"
import { onlyLogInFrameworkDevelopmentProcess, parseJsonBody } from "./utils/index.js"
import { isAsyncFunction } from "util/types"
import { BanhMiRouter } from "./BanhMiRouter.js"





export class BanhMiApplication {
    globalHandlers: BanhMiHandler[] = []


    handlers: BanhMiRouteHandlersMap = {
        GET: {},
        POST: {},
        DELETE: {},
        PATCH: {},
        PUT: {},
    }

    bodyParsers: SetupBodyParserOption[] = []

    // for now use method will only be used to register routers
    setupRouter(path: string, router: BanhMiRouter) {
        const routerHandlersMap = router.routerHandlersMap
        for (const method in routerHandlersMap) {
            if (routerHandlersMap.hasOwnProperty(method)) {
                const handlersMap = routerHandlersMap[method as BanhMiHttpMethod]
                for (const partialPath in handlersMap) {
                    if (handlersMap.hasOwnProperty(partialPath)) {
                        const handlers = handlersMap[partialPath]
                        const fullPath = path + partialPath
                        this.registerRoute(fullPath, method as BanhMiHttpMethod, handlers)
                    }
                }
            }
        }
    }

    setupGlobalMiddleware(...handlers: BanhMiHandler[]) {
        this.globalHandlers.push(...handlers)
    }

    setupBodyParser<T extends BanhMiBodyParsingMethod>(parser: SetupBodyParserOption<T>) {
        this.bodyParsers.push(parser)
    }


    get(path: string, ...handlers: BanhMiHandler[]) {
        this.registerRoute(path, BanhMiHttpMethod.GET, handlers)
    }

    post(path: string, ...handlers: BanhMiHandler[]) {
        this.registerRoute(path, BanhMiHttpMethod.POST, handlers)
    }

    put(path: string, ...handlers: BanhMiHandler[]) {
        this.registerRoute(path, BanhMiHttpMethod.PUT, handlers)
    }

    patch(path: string, ...handlers: BanhMiHandler[]) {
        this.registerRoute(path, BanhMiHttpMethod.PATCH, handlers)
    }

    delete(path: string, ...handlers: BanhMiHandler[]) {
        this.registerRoute(path, BanhMiHttpMethod.DELETE, handlers)
    }

    listen(port?: number, callback?: (server: BunServer) => any | Promise<any>) {
        // onlyLogInFrameworkDevelopmentProcess(this.handlers)
        const that = this
        const server = Bun.serve({
            port,
            async fetch(request, server) {

                const path = new URL(request.url).pathname
                const banhMiRequest = new BanhMiRequest(that, request)
                const banhMiResponse = new BanhMiResponse()


                that.bodyParsers.forEach(async ({ method, options }) => {
                    switch (method) {
                        case BanhMiBodyParsingMethod.json:
                            console.log("Got here")
                            const parseResult = await parseJsonBody(request)
                            if(parseResult) {
                                banhMiRequest.body = parseResult
                            }
                    }
                })



                let response: any
                for (const [index, handler] of that.globalHandlers.entries()) {
                    if (response instanceof Response) {
                        break;
                    }

                    const isHandlerAsync = isAsyncFunction(handler);
                    response = isHandlerAsync
                        ? await handler(banhMiRequest, banhMiResponse)
                        : handler(banhMiRequest, banhMiResponse);

                }
                if (response instanceof Response)
                    return response

                // console.time("Time to get the matched handlers")
                const matchedHandlers = that.matchRoute(path, request.method as BanhMiHttpMethod)
                // console.timeEnd("Time to get the matched handlers")
                onlyLogInFrameworkDevelopmentProcess("Matched handlers", matchedHandlers)
                if (matchedHandlers === null) {
                    return new Response("Not Found", {
                        status: 404,
                        statusText: "Not Found"
                    })
                } else {
                    if (matchedHandlers) {
                        if (matchedHandlers.type === BanhMiRouteType.dynamic) {
                            onlyLogInFrameworkDevelopmentProcess(matchedHandlers.params)
                        }

                        banhMiRequest.params = matchedHandlers.params
                        const banhMiResponse = new BanhMiResponse()

                        const handlers = matchedHandlers.handlers
                        if (handlers.length === 1) {
                            const handler = handlers[0]
                            const isHandlerAsync = isAsyncFunction(handler)
                            const response = isHandlerAsync ? await handler(banhMiRequest, banhMiResponse) : handler(banhMiRequest, banhMiResponse)
                            if (response instanceof Response) {
                                return response
                            }
                            throw new Error("Must give a response")
                        } else {
                            let response: any
                            for (const [index, handler] of handlers.entries()) {
                                if (response instanceof Response) {
                                    break;
                                }

                                const isHandlerAsync = isAsyncFunction(handler);
                                response = isHandlerAsync
                                    ? await handler(banhMiRequest, banhMiResponse)
                                    : handler(banhMiRequest, banhMiResponse);

                                if (index === handlers.length - 1 && !(response instanceof Response)) {
                                    throw new Error("Must give a response");
                                }
                            }
                            return response
                        }
                    } else {
                        return new Response("Not Found", {
                            status: 404,
                            statusText: "Not Found"
                        })
                    }

                }
            },
        })

        if (callback) callback(server)
    }

    private registerRoute(path: string, method: BanhMiHttpMethod, handlers: BanhMiHandler[]) {
        if (path === '/') {
            this.handlers[method]['/'] = { type: BanhMiRouteType.static, handlers, children: {}, self: "/" }
            return
        }
        // remove last slash if any
        if (path[path.length - 1] === '/') {
            path = path.slice(0, path.length - 1)
        }
        let pathSegments = path.split('/').slice(1)

        let matcherIndex = 0
        let matcherNode: BanhMiRouteMatcherNode | undefined = this.handlers[method][pathSegments[0]]


        if (pathSegments.length === 1) {
            const routeType = pathSegments[0].includes(':') ? BanhMiRouteType.dynamic : BanhMiRouteType.static
            if (matcherNode) {
                this.handlers[method][pathSegments[0]].handlers = handlers
            } else {
                this.handlers[method][pathSegments[0]] = { type: routeType, handlers, children: {}, self: pathSegments[0] }
            }
            return
        }


        if (!matcherNode) {
            const routeType = pathSegments[0].includes(':') ? BanhMiRouteType.dynamic : BanhMiRouteType.static
            this.handlers[method][pathSegments[0]] = { type: routeType, handlers, children: {}, self: pathSegments[0] }
            matcherNode = this.handlers[method][pathSegments[0]]
        }

        do {
            matcherIndex++
            const matcher = pathSegments[matcherIndex]
            const routeType = pathSegments[matcherIndex].includes(':') ? BanhMiRouteType.dynamic : BanhMiRouteType.static
            if (matcher) {
                const childMatcherNode = matcherNode?.children[matcher]
                if (!childMatcherNode) {
                    matcherNode.children[matcher] = { type: routeType, handlers: matcherIndex === pathSegments.length - 1 ? handlers : [], children: {}, self: matcher }
                } else {
                    if (matcherIndex === pathSegments.length - 1) {
                        matcherNode.children[matcher].handlers = handlers
                    }
                }
                matcherNode = matcherNode?.children[matcher]
            }
        } while (matcherNode && matcherIndex < pathSegments.length - 1)


    }


    private matchRoute(path: string, method: BanhMiHttpMethod) {

        // remove last slash if any
        if (path[path.length - 1] === '/') {
            path = path.slice(0, path.length - 1)
        }

        const params: Record<string, string> = {}

        // for now, ignore favicon request
        if (path === '/favicon.ico') return null

        if (path === "/") {
            const matcherNode = this.handlers[method]['/']
            return matcherNode && matcherNode.handlers.length > 0 ? { handlers: matcherNode.handlers, type: BanhMiRouteType.static, params } : null
        }

        const pathSegments = path.split('/').slice(1)
        onlyLogInFrameworkDevelopmentProcess("Path segments", pathSegments)
        if (pathSegments.length === 1) {
            const matcherNode = this.handlers[method][pathSegments[0]]
            if (matcherNode) {
                onlyLogInFrameworkDevelopmentProcess("Found a matcher node => ", matcherNode.self)
                return matcherNode.handlers.length > 0 ? { handlers: matcherNode.handlers, type: BanhMiRouteType.static, params } : null
            } else {
                const dynamicMatcher = this.matchingNodeHasDynamicMatcher(this.handlers[method])
                if (dynamicMatcher) {
                    const dynamicMatcherNode = this.handlers[method][dynamicMatcher]
                    onlyLogInFrameworkDevelopmentProcess(dynamicMatcherNode)
                    const paramName = dynamicMatcher.split(":")[1]
                    params[paramName] = pathSegments[0]
                    return dynamicMatcherNode.handlers.length > 0 ? { handlers: dynamicMatcherNode.handlers, type: BanhMiRouteType.dynamic, params } : null
                } else {
                    return null
                }
            }
        } else {
            let matcherIndex = 0
            let matcherNode: BanhMiRouteMatcherNode | undefined = undefined
            do {
                const matcher = pathSegments[matcherIndex]
                const prevMatcherNode: BanhMiRouteMatcherNode | undefined = matcherNode
                matcherNode = matcherIndex === 0 ? this.handlers[method][matcher] : (matcherNode ? matcherNode.children[matcher] : undefined)
                onlyLogInFrameworkDevelopmentProcess(`MatcherNode for index ${matcherIndex} is `, matcherNode)

                if (matcherNode && matcherIndex === pathSegments.length - 1) {
                    return matcherNode.handlers.length > 0 ? { handlers: matcherNode.handlers, type: BanhMiRouteType.static, params } : null
                } else if (matcherNode && matcherIndex !== pathSegments.length - 1) {
                    onlyLogInFrameworkDevelopmentProcess(`Static match found for ${matcher}, continue checking for the next matcher`)
                } else if (!matcherNode) {
                    const dynamicMatcher = this.matchingNodeHasDynamicMatcher(matcherIndex === 0 ? this.handlers[method] : (prevMatcherNode ? prevMatcherNode.children : {}))
                    if (dynamicMatcher) {
                        if (matcherIndex !== pathSegments.length - 1) {
                            onlyLogInFrameworkDevelopmentProcess(`Dynamic match found for ${matcher}, setting params and continue checking for the next matcher`)
                            const paramName = dynamicMatcher.split(":")[1]
                            params[paramName] = matcher
                        } else {
                            const dynamicMatcherNode = matcherIndex === 0 ? this.handlers[method][dynamicMatcher] : (prevMatcherNode ? prevMatcherNode.children[dynamicMatcher] : undefined)
                            if (dynamicMatcherNode) {
                                onlyLogInFrameworkDevelopmentProcess(dynamicMatcherNode)
                                const paramName = dynamicMatcher.split(":")[1]
                                params[paramName] = matcher
                                return dynamicMatcherNode.handlers.length > 0 ? { handlers: dynamicMatcherNode.handlers, type: BanhMiRouteType.dynamic, params } : null
                            } else {
                                return null
                            }
                        }
                        if (prevMatcherNode)
                            // @ts-ignore
                            matcherNode = matcherIndex === 0 ? this.handlers[method][dynamicMatcher] : (prevMatcherNode.children as Record<string, BanhMiRouteMatcherNode>)[dynamicMatcher]
                    } else {
                        return null
                    }
                }
                matcherIndex++
            } while (matcherIndex < pathSegments.length)
        }
    }



    private matchingNodeHasDynamicMatcher(obj: Record<string, BanhMiRouteMatcherNode>) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                const value = obj[prop]
                if (value.type === BanhMiRouteType.dynamic) {
                    return value.self;
                }
            }
        }
        return null;
    }

}