import {RailwayUnitTypes} from "@/types/RailwayUnitTypes";

export interface RailwayUnit {
    id: number
    name: string
    number: string
    type: RailwayUnitTypes
    comment: string
}
