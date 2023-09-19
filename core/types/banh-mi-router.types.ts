import { BanhMiHttpMethod, BanhMiRouteType } from "../enums"
import { BanhMiHandler } from "./banh-mi-handlers.types"

export interface BanhMiRouteMatcherNode {
    self: string
    type: BanhMiRouteType
    handlers: BanhMiHandler[]
    children: Record<string, BanhMiRouteMatcherNode>
}



export type BanhMiRouteHandlersMap = Record<BanhMiHttpMethod, Record<string, BanhMiRouteMatcherNode>>

export type BanhMiRouterRouteHandlersMap = Record<BanhMiHttpMethod, Record<string, BanhMiHandler[]>>
