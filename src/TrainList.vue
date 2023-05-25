<template lang="pug">
.trains-list
  vue-simple-context-menu(
    element-id="wagon-context-menu"
    :options="wagon_types"
    ref="vueSimpleContextMenuRef"
    @option-clicked="wagonContextOptionClicked")
  .buttons
    .button(@click="addTrain") Добавить состав
    .button(@click="addWagon") Добавить вагон
    .button Добавить станцию
  .trains
    .train(v-for="train in trains" :key="train.id")
      .train__info
        .train__id \#{{train.id}}
        .train__name Название:
          input.train-input(:value="train.name" @blur="editTrainName($event,train)")
        .train__location Локация:
          input.train-input(:value="train.location" @blur="editTrainLocation($event,train)")
        button.train__btn-delete(v-if="train.id!==0" @click="deleteTrain(train.id)") Удалить
      draggableComponent.train__wagons(
        v-model="train.railwayUnits"
        group="wagon"
        item-key="id")
        template(#item="{element:unit}")
          .wagon(@click.prevent.right="wagonHandleClick($event,train, unit)")
            .wagon__info
              input.wagon__name.train-input(:value="unit.name" @blur="editWagonName($event,train,unit)")
              input.wagon__number.train-input(:value="unit.number" @blur="editWagonNumber($event,train,unit)")
            .wagon__img(:class="getClassByWagonType(unit.type)")
</template>

<script lang="ts" setup>
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css';

import {computed, ref} from "vue";
import {trainStore} from "@/store/trains";
import type {Train} from "@/types/Train";
import type {RailwayUnit} from "@/types/RailwayUnit";
import {RailwayUnitTypes} from "@/types/RailwayUnitTypes";
import draggableComponent from "vuedraggable";
// @ts-ignore
import VueSimpleContextMenu from 'vue-simple-context-menu';

const train_store = trainStore()
const wagon_types = [
  {
    name:"Flatcar 1",
    type: RailwayUnitTypes.WAGON_FLATCAR_1
  },{
    name:"Flatcar 2",
    type: RailwayUnitTypes.WAGON_FLATCAR_2
  },{
    name:"Flatcar 3",
    type: RailwayUnitTypes.WAGON_FLATCAR_3
  },{
    name:"Hopper",
    type: RailwayUnitTypes.WAGON_HOPPER
  },{
    name:"Boxcar",
    type: RailwayUnitTypes.WAGON_BOXCAR
  },{
    name:"Tanker",
    type: RailwayUnitTypes.WAGON_TANKER
  },{
    name:"Pass",
    type: RailwayUnitTypes.WAGON_PASS
  },{
    name:"Locomotive",
    type: RailwayUnitTypes.LOCOMOTIVE
  }
]

const vueSimpleContextMenuRef = ref(null)

const trains = computed(()=>{
  const arr = []
  for (const train of train_store.trains.values()) {
    arr.push(train)
  }
  return arr
})

function addTrain(){
  train_store.addTrain({ name: "-", location: "-"})
}
function addWagon(){
  train_store.addWagon({type: RailwayUnitTypes.WAGON_PASS})
}
function deleteTrain(id: number){
  train_store.deleteTrain(id)
}
function editTrainName(event: FocusEvent, train: Train){
  train_store.editTrainName(train.id,(event.target as HTMLInputElement).value)
}
function editTrainLocation(event: FocusEvent, train: Train){
  train_store.editTrainLocation(train.id,(event.target as HTMLInputElement).value)
}
function editWagonName(event: FocusEvent, train: Train, unit: RailwayUnit){
  train_store.editWagonName(train.id,unit.id,(event.target as HTMLInputElement).value)
}
function editWagonNumber(event: FocusEvent, train: Train, unit: RailwayUnit){
  train_store.editWagonNumber(train.id,unit.id,(event.target as HTMLInputElement).value)
}
function getClassByWagonType(type: RailwayUnitTypes){
  switch (type){
    case RailwayUnitTypes.WAGON_FLATCAR_1: return "flatcar_1"
    case RailwayUnitTypes.WAGON_FLATCAR_2: return "flatcar_2"
    case RailwayUnitTypes.WAGON_FLATCAR_3: return "flatcar_3"
    case RailwayUnitTypes.WAGON_HOPPER: return "hopper"
    case RailwayUnitTypes.WAGON_TANKER: return "tanker"
    case RailwayUnitTypes.WAGON_BOXCAR: return "boxcar"
    case RailwayUnitTypes.WAGON_PASS: return "pass"
    case RailwayUnitTypes.LOCOMOTIVE: return "locomotive"
    case RailwayUnitTypes.TENDER: return "tender"
  }
}
function wagonHandleClick(event: MouseEvent, train: Train, unit: RailwayUnit){
  (vueSimpleContextMenuRef.value as any).showMenu(event, {
    train_id: train.id,
    wagon_id: unit.id
  })
}
function wagonContextOptionClicked(event: {item:{train_id:number,wagon_id:number},option:{name:string,type:RailwayUnitTypes}}){
  train_store.editWagonType(event.item.train_id,event.item.wagon_id,event.option.type)
}

defineExpose({
  addTrain,
  addWagon,
  editTrainName,
  editTrainLocation,
  getClassByWagonType,
  editWagonName,
  editWagonNumber,
  wagonContextOptionClicked,
  deleteTrain
});
</script>

<style lang="scss" scoped>
.trains-list{

}
.buttons{
  display: flex;
}
.button{
  white-space: nowrap;
  margin-right: 10px;
  padding: 5px 10px;
  border: #2c3e50 1px solid;
  border-radius: 5px;
  cursor: pointer;
  background: #282828;
  user-select: none;
  &:hover{
    background: #2c3e50;
  }
  &:active{
    background: #365369;
  }
}
.trains {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 10px;
}
.train {
  gap: 10px;
  border-bottom: 1px solid #282828;

  &__btn-delete{
    padding: 4px 8px;
    background: darkred;
    color: var(--color-text);
    cursor: pointer;
    border:{
      radius: 5px;
      color: grey;
      width: 0;
      style: solid;
    };

    &:hover{
      background: #af0000;
    }

    &:active{
      background: #790000;
    }
  }
}
.train__info{
  display: flex;
  gap: 10px;
}
.train__wagons{
  width: 100%;
  display: flex;
  justify-content: start;
}
.wagon{
  width: 50px;
  margin: 5px;
  cursor: pointer;
  user-select: none;

  &__info{
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__name,&__number{
    width: 50px;
    text-align: center;
  }

  &__img{
    border-radius: 5px;
    width: 50px;
    height: 20px;
    background: {
      repeat: no-repeat;
      position-y: -22px;
      position-x: -10px;
      size: 70px 70px;
      color: grey;
    };
    &.flatcar_1{
      background:{
        image: url("/src/assets/images/flatcar_logs.png");
      };
    }
    &.flatcar_2{
      background:{
        image: url("/src/assets/images/flatcar_stakes.png");
      };
    }
    &.flatcar_3{
      background:{
        image: url("/src/assets/images/flatcar_cordwood.png");
      };
    }
    &.hopper{
      background:{
        image: url("/src/assets/images/flatcar_hopper.png");
      };
    }
    &.boxcar{
      background:{
        image: url("/src/assets/images/boxcar.png");
      };
    }
    &.tanker{
      background:{
        image: url("/src/assets/images/flatcar_tanker.png");
      };
    }
    &.pass{
      background:{
        image: url("/src/assets/images/caboose.png");
        position-y: -22px;
      };
    }
    &.locomotive{
      background:{
        image: url("/src/assets/images/class70.png");
        position-y: -23px;
        position-x: 5px;
      };
    }
  }
}
.train-input{
  outline: unset;
  background: unset;
  color: var(--color-text);
  border: unset;
  border-radius: 2px;
  padding: 4px 2px;

  &:hover{
    background: #383838;
  }
  &:focus{
    background: #383838;
    border: 1px solid #808080;
    padding: 3px 1px;
  }
}
</style>
