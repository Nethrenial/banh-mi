import { Server as BunServer } from "bun"
import { BanhMiRequest } from "./BanhMiRequest.js"
import { BanhMiResponse } from "./BanhMiResponse.js"
import { BanhMiHttpMethod, BanhMiRouteType } from "./enums/index.js"
import { BanhMiHandler, BanhMiRouteHandlersMap, BanhMiRouteMatcherNode } from "./types/index.js"
import { onlyLogInFrameworkDevelopmentProcess } from "./utils/index.js"



export class BanhMiApplication {
    globalHandlers: BanhMiHandler[] = []

    handlers: Record<BanhMiHttpMethod, { [key: string]: { type: 'withParams' | 'withoutParams', handlers: BanhMiHandler[] } }> = {
        GET: {},
        POST: {}
    }

    testHandlers: BanhMiRouteHandlersMap = {
        GET: {},
        POST: {}
    }


    private registerRoute(path: string, method: BanhMiHttpMethod, handlers: BanhMiHandler[]) {
        if (path === '/') {
            this.testHandlers[method]['/'] = { type: BanhMiRouteType.static, handlers, children: {}, self: "/" }
            return
        }
        const pathSegments = path.split('/').slice(1)

        let matcherIndex = 0
        let matcherNode: BanhMiRouteMatcherNode | undefined = this.testHandlers[method][pathSegments[0]]


        if (pathSegments.length === 1) {
            const routeType = pathSegments[0].includes(':') ? BanhMiRouteType.dynamic : BanhMiRouteType.static
            if (routeType === BanhMiRouteType.static) {
                if (matcherNode) {
                    this.testHandlers[method][pathSegments[0]].handlers = handlers
                } else {
                    this.testHandlers[method][pathSegments[0]] = { type: BanhMiRouteType.static, handlers, children: {}, self: pathSegments[0] }
                }
            } else {
                if (matcherNode) {
                    this.testHandlers[method][pathSegments[0]].handlers = handlers
                } else {
                    this.testHandlers[method][pathSegments[0]] = { type: BanhMiRouteType.dynamic, handlers, children: {}, self: pathSegments[0] }
                }
            }
            return
        }


        if (!matcherNode) {
            const routeType = pathSegments[0].includes(':') ? BanhMiRouteType.dynamic : BanhMiRouteType.static
            if (routeType === BanhMiRouteType.static) {
                this.testHandlers[method][pathSegments[0]] = { type: BanhMiRouteType.static, handlers, children: {}, self: pathSegments[0] }
            } else {
                this.testHandlers[method][pathSegments[0]] = { type: BanhMiRouteType.dynamic, handlers, children: {}, self: pathSegments[0] }
            }
            matcherNode = this.testHandlers[method][pathSegments[0]]
        }

        do {
            matcherIndex++
            const matcher = pathSegments[matcherIndex]
            const routeType = pathSegments[matcherIndex].includes(':') ? BanhMiRouteType.dynamic : BanhMiRouteType.static
            if (matcher) {
                const childMatcherNode = matcherNode?.children[matcher]
                if (!childMatcherNode) {
                    if (routeType === BanhMiRouteType.static) {
                        matcherNode.children[matcher] = { type: BanhMiRouteType.static, handlers: matcherIndex === pathSegments.length - 1 ? handlers : [], children: {}, self: matcher }
                    } else {
                        matcherNode.children[matcher] = { type: BanhMiRouteType.dynamic, handlers: matcherIndex === pathSegments.length - 1 ? handlers : [], children: {}, self: matcher }
                    }
                } else {
                    if (routeType === BanhMiRouteType.static) {
                        if (matcherIndex === pathSegments.length - 1) {
                            matcherNode.children[matcher].handlers = handlers
                        }
                    } else {
                        if (matcherIndex === pathSegments.length - 1) {
                            matcherNode.children[matcher].handlers = handlers
                        }
                    }
                }
                matcherNode = matcherNode?.children[matcher]
            }
        } while (matcherNode && matcherIndex < pathSegments.length - 1)


    }

    get(path: string, ...handlers: BanhMiHandler[]) {
        this.registerRoute(path, BanhMiHttpMethod.GET, handlers)
    }

    post(path: string, ...handlers: BanhMiHandler[]) {
        this.registerRoute(path, BanhMiHttpMethod.POST, handlers)
    }


    listen(port?: number, callback?: (server: BunServer) => any | Promise<any>) {
        // onlyLogInFrameworkDevelopmentProcess(this.testHandlers)
        const that = this
        const server = Bun.serve({
            port,
            fetch(request, server) {

                const path = new URL(request.url).pathname

                console.time("Time to get the matched handlers")
                const matchedHandlers = that.matchRoute(path, request.method as BanhMiHttpMethod)
                console.timeEnd("Time to get the matched handlers")
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
                        const banhMiRequest = new BanhMiRequest(that, request, {
                            _params: matchedHandlers.params
                        })
                        matchedHandlers.handlers.forEach(h => {
                            h(banhMiRequest, new BanhMiResponse())
                        })
                    }

                }


                // const method = request.method as BanhMiHttpMethod
                // let handlers: BanhMiHandler[] = []
                // switch (method) {
                //     case BanhMiHttpMethod.GET:
                //         handlers = that.handlers.GET[path].handlers
                //         break;
                //     case BanhMiHttpMethod.POST:
                //         handlers = that.handlers.POST[path].handlers
                //     default:
                //         break;
                // }

                // handlers?.forEach(h => {
                //     h(banhMiRequest, new BanhMiResponse())
                // })

                return new Response("Some Response")
            },
        })

        if (callback) callback(server)
    }


    private matchRoute(path: string, method: BanhMiHttpMethod) {

        const params: Record<string, string> = {}

        // for now, ignore favicon request
        if (path === '/favicon.ico') return null

        if (path === "/") {
            const matcherNode = this.testHandlers[method]['/']
            return matcherNode && matcherNode.handlers.length > 0 ? { handlers: matcherNode.handlers, type: BanhMiRouteType.static, params } : null
        }

        const pathSegments = path.split('/').slice(1)
        onlyLogInFrameworkDevelopmentProcess("Path segments", pathSegments)
        if (pathSegments.length === 1) {
            const matcherNode = this.testHandlers[method][pathSegments[0]]
            if (matcherNode) {
                onlyLogInFrameworkDevelopmentProcess("Found a matcher node => ", matcherNode.self)
                return matcherNode.handlers.length > 0 ? { handlers: matcherNode.handlers, type: BanhMiRouteType.static, params } : null
            } else {
                const dynamicMatcher = this.matchingNodeHasDynamicMatcher(this.testHandlers[method])
                if (dynamicMatcher) {
                    const dynamicMatcherNode = this.testHandlers[method][dynamicMatcher]
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
                matcherNode = matcherIndex === 0 ? this.testHandlers[method][matcher] : (matcherNode ? matcherNode.children[matcher] : undefined)
                onlyLogInFrameworkDevelopmentProcess(`MatcherNode for index ${matcherIndex} is `, matcherNode)

                if (matcherNode && matcherIndex === pathSegments.length - 1) {
                    return matcherNode.handlers.length > 0 ? { handlers: matcherNode.handlers, type: BanhMiRouteType.static, params } : null
                } else if (matcherNode && matcherIndex !== pathSegments.length - 1) {
                    onlyLogInFrameworkDevelopmentProcess(`Static match found for ${matcher}, continue checking for the next matcher`)
                } else if (!matcherNode) {
                    const dynamicMatcher = this.matchingNodeHasDynamicMatcher(matcherIndex === 0 ? this.testHandlers[method] : (prevMatcherNode ? prevMatcherNode.children : {}))
                    if (dynamicMatcher) {
                        if (matcherIndex !== pathSegments.length - 1) {
                            onlyLogInFrameworkDevelopmentProcess(`Dynamic match found for ${matcher}, setting params and continue checking for the next matcher`)
                            const paramName = dynamicMatcher.split(":")[1]
                            params[paramName] = matcher
                        } else {
                            const dynamicMatcherNode = matcherIndex === 0 ? this.testHandlers[method][dynamicMatcher] : (prevMatcherNode ? prevMatcherNode.children[dynamicMatcher] : undefined)
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
                            matcherNode = matcherIndex === 0 ? this.testHandlers[method][dynamicMatcher] : (prevMatcherNode.children as Record<string, BanhMiRouteMatcherNode>)[dynamicMatcher]
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