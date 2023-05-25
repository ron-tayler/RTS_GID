import {defineStore} from "pinia"
import {Train} from "@/types/Train";
import {RailwayUnitTypes} from "@/types/RailwayUnitTypes";

export const trainStore = defineStore('trains',{
    state: ()=>({
        new_train_id: 1,
        new_wagon_id: 1,
        trains: new Map<number,Train>([[0,{
            name: "Магазин",
            id: 0,
            location: "Магазин",
            railwayUnits: []
        }]]),
        stations: [{
            id: 0,
            name: "Магазин",
            trains: [0]
        }]
    }),
    actions:{
        addTrain({name, location}: {name: string, location: string}) {
            const id = this.new_train_id
            this.new_train_id++
            this.trains.set(id, {id, name, location, railwayUnits: []})
        },
        editTrainName(id: number, name: string){
            const train = this.trains.get(id)
            if(train) train.name = name
        },
        editTrainLocation(id: number, location: string){
            const train = this.trains.get(id)
            if(train) train.location = location
        },
        addWagon({type}:{type: RailwayUnitTypes}){
            const train = this.trains.get(0)
            if(train) {
                this.new_wagon_id++
                train.railwayUnits.push({
                    id: this.new_wagon_id,
                    name: "-",
                    number: "-",
                    type,
                    comment: ""
                })
            }
        },
        editWagonName(train_id: number, wagon_id: number, name: string){
            const train = this.trains.get(train_id)
            if(!train) return;
            const wagon = train.railwayUnits.find(unit=>unit.id==wagon_id)
            if(!wagon) return;
            wagon.name = name
        },
        editWagonNumber(train_id: number, wagon_id: number, number: string){
            const train = this.trains.get(train_id)
            if(!train) return;
            const wagon = train.railwayUnits.find(unit=>unit.id==wagon_id)
            if(!wagon) return;
            wagon.number = number
        },
        editWagonType(train_id: number, wagon_id: number, new_type: RailwayUnitTypes){
            const train = this.trains.get(train_id)
            if(!train) return;
            const wagon = train.railwayUnits.find(unit=>unit.id==wagon_id)
            if(!wagon) return;
            wagon.type = new_type
        },
        deleteTrain(id: number){
            this.trains.delete(id)
        }
    }
})