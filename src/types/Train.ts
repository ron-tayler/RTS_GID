import {RailwayUnit} from "@/types/RailwayUnit";

export interface Train {
    id: number,
    name: string,
    location: string,
    railwayUnits: RailwayUnit[]
}