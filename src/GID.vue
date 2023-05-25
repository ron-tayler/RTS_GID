<template lang="pug">
.gid
  v-stage(ref="stage" :config="stageConfig")
    // Слой с таблицой и станциями
    v-layer
      template(v-for="(st,j) in renderStations")
        // Станция
        v-text(:config="{x:st.name.length*-7-10,y:st.y,text:st.name,align:'right'}")
        v-line(:config="{x:0,y:st.y,points:[0,0,2880,0],stroke:'#404040',strokeWidth:2}")
        v-line(:config="{x:0,y:st.y,points:[0,0,0,st.paths.length*20],stroke:'#404040',strokeWidth:2}")
        template(v-for="(path,i) in st.paths")
          v-line(:config="{x:0,y:st.y+i*20+20,points:[0,0,2880,0],stroke:'#404040',strokeWidth:2}")
          v-text(v-for="k in 24" :config="{x:(k-1)*120+2,y:st.y+i*20+5,text:path.name,align:'right',fill:'#808080'}")

        // Это по идеи между станций
        template(v-if="j+1 !== renderStations.length")
          v-line(:config="{x:0,y:st.y,points:[0,st.paths.length*20,0,100+st.paths.length*20],stroke:'#404040',strokeWidth:2}")
          v-line(v-for="i in 144" :config="{x:i*20,y:st.y+st.paths.length*20,points:[0,0,0,100],stroke:'#808080',strokeWidth:(i%6===0)?2:1,dash:(i%6!==0 && i%3===0)?[4,4]:[]}")
    // Слой с поездами
    v-layer
      template(v-for="train in trains")
        // План
        v-line(v-for="plan_line in getTrainPlanPoints(train)" :config="{x:0,y:0,points:[plan_line.sx,plan_line.sy,plan_line.fx,plan_line.fy],stroke:getTrainColor(train.number),strokeWidth:2,dash:[2,2]}")
        // Исполненное
        v-line(:config="{x:0,y:0,points:getTrainPoints(train),stroke:getTrainColor(train.number),strokeWidth:3}")
        v-text(v-for="text_point in getTrainNumbersByTrain(train)" :config="{x:text_point.x,y:text_point.y,text:train.number,align:'right',fill:getTrainColor(train.number),fontSize:14,fontStyle:'bold'}")
    // Слой времени
    v-layer
      v-line(v-if="renderStations.length>0" :config="{x:gid_time_now*2,y:0,points:[0,-20,0,renderStations[renderStations.length-1].y+renderStations[renderStations.length-1].paths.length*20+20],stroke:'#40ffff',strokeWidth:2}")
      v-text(v-for="i in 25" :config="{x:(i-1)*120-10,y:-20,text:(i-1)%24+':00',fontSize:16,fontStyle:'bold'}")
  .train-menu
    .train-menu__open-btn(@click="onClickBtnOpenTrainMenu")
      span(v-if="is_open_train_menu") >
      span(v-else) &lt;
    .train-menu__body(v-if="is_open_train_menu")
      .train-menu__save-load
        h3 Сохранить / Загрузить
        button(@click="onClickBtnLoadMap") Загрузить карту
        button(@click="onClickBtnLoadTrains") Загрузить поезда
        button(@click="onClickBtnSaveTrains") Сохранить поезда
        button(@click="onClickBtnClearAll") Очистить
        button(@click="onClickBtnAddRandomTrain") Рандом
      .train-menu__add-train
        // Добавить поезд
        h3 Добавить поезд
        label Номер 
          input(v-model="add_train_number")
        label Станция 
          select(v-model="add_train_station")
            option(v-for="(station,i) in stations" :value="i") {{station.name}}
        label Путь 
          select(v-model="add_train_path")
            option(v-for="(path,i) in add_train_paths" :value="i+1") {{path.name}}
        button(@click="onClickBtnAddTrain") Добавить
      .train-menu__train-actions
        h3 Управление поездами
        label Поезд 
          select(v-model="action_train_id")
            option(v-for="train in trainsForActions" :value="train.id") {{train.number}}
        // Отправить поезд
        button(@click="onClickBtnStartTrainUp") Отправить вверх
        button(@click="onClickBtnStartTrainDown") Отправить вниз
        label Путь 
          select(v-model="pick_train_path")
            option(v-for="(path,i) in pick_train_paths" :value="i+1") {{path.name}}
          span  
          button(@click="onClickBtnPickTrainToStation") Принять
        label Путь 
          select(v-model="repick_train_path")
            option(v-for="(path,i) in repick_train_paths" :value="i+1") {{path.name}}
          span  
          button(@click="onClickBtnRePickTrainToStation") Переставить
        button(@click="onClickBtnRemoveTrain") Расформировать поезд
      .train-menu__gid-time
        div

        div
          h3(style="display:inline-block; margin-right: 10px") Время: {{filterTimeZero((gid_time_now-gid_time_now%60)/60)}}:{{filterTimeZero(gid_time_now%60)}}:{{filterTimeZero(gid_time_now_s)}}
          button(style="margin-right: 2px; width: 25px" @click="gid_time_pause=!gid_time_pause") {{gid_time_pause?'|>':'||'}}
          button(style="margin-right: 2px; width: 25px" @click="gid_time_now++;gid_time_now_s=0" @click.ctrl="gid_time_now+=9;gid_time_now_s=0") +
          button(style="margin-right: 2px; width: 25px" @click="gid_time_now--;gid_time_now_s=0" @click.ctrl="gid_time_now-=9;gid_time_now_s=0") -
      .train-menu__train-edit
        h3 Исправление данных
        // Выбираем любой поезд
        label Поезд 
          select(v-model="edit_train_id")
            option(v-for="train in trains" :value="train.id") {{train.id}} | {{train.number}}
          button(@click="onBtnClickRemoveTrain") -
        // Идут инпуты основных данных
        label(v-if="trainForEdit") number 
          input(v-model="trainForEdit.number")
        label(v-if="trainForEdit") status 
          select(v-model="trainForEdit.status")
            option(value="init") Init
            option(value="stop") Stop
            option(value="up") Up
            option(value="down") Down
            option(value="stop-finish") Stop Finish
            option(value="up-finish") Up Finish
            option(value="down-finish") Down Finish
        // Выбираем точку маршрута, есть кнопка добавить или удалить выбранное
        label(v-if="trainForEdit") route 
          select(v-model="edit_train_route_point")
            option(v-for="(point,i) in trainForEdit.route" :value="i") {{i}}
          button(@click="onBtnClickAddTrainRouteBefore") ^
          button(@click="onBtnClickAddTrainRouteAfter") +
          button(@click="onBtnClickRemoveTrainRoute") -
        // Идут инпуты данных
        label(v-if="trainForEdit && trainRoutePointForEdit")   station 
          input(v-model="trainRoutePointForEdit.station" type="number")
        label(v-if="trainForEdit && trainRoutePointForEdit")   path 
          input(v-model="trainRoutePointForEdit.path" type="number")
        label(v-if="trainForEdit && trainRoutePointForEdit")   start 
          input(v-model="trainRoutePointForEdit.start" type="number")
        label(v-if="trainForEdit && trainRoutePointForEdit")   finish 
          input(v-model="trainRoutePointForEdit.finish" type="number")
        // Выбираем точку планируемого маршрута, есть кнопка добавить или удалить выбранное
        label(v-if="trainForEdit") plan 
          select(v-model="edit_train_normal_route_point")
            option(v-for="(point,i) in trainForEdit.norma_route" :value="i") {{i}}
          button(@click="onBtnClickAddTrainPlanRouteBefore") ^
          button(@click="onBtnClickAddTrainPlanRouteAfter") +
          button(@click="onBtnClickRemoveTrainPlanRoute") -
        // Идут инпуты данных
        label(v-if="trainForEdit && trainPlanRoutePointForEdit")   station 
          input(v-model="trainPlanRoutePointForEdit.station" type="number")
        label(v-if="trainForEdit && trainPlanRoutePointForEdit")   start 
          input(v-model="trainPlanRoutePointForEdit.start" type="number")
        label(v-if="trainForEdit && trainPlanRoutePointForEdit")   finish 
          input(v-model="trainPlanRoutePointForEdit.finish" type="number")
</template>

<script lang="ts" setup>
import {onMounted, computed, ref, onBeforeUnmount, watch} from "vue";

const stageConfig = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true
})

type Station = {
  name: string,
  paths: {name:string}[]
}

let stations = ref<Station[]>([])

type Train = {
  id: number,
  number: string,
  status: "stop"|"stop-finish"|"up"|"up-finish"|"down"|"down-finish"|"init",
  route?: {
    station: number,
    path: number,
    start: number,
    finish: number|undefined
  }[],
  norma_route?:{
    station: number,
    start: number,
    finish: number
  }[]
}

let trains = ref<Train[]>([])

let gid_time_pause = ref(false)
let gid_time_now_s = ref(0)
let gid_time_now = ref(0)
let is_open_train_menu = ref(false)
let gid_type_ngdp = ref(false)

let add_train_number = ref("")
let add_train_station = ref(0)
let add_train_path = ref(1)
let action_train_id = ref(0)
let pick_train_path = ref(0)
let repick_train_path = ref(0)
let edit_train_id = ref(1)
let edit_train_route_point = ref(0)
let edit_train_normal_route_point = ref(0)

function createNewTrain(){
  let new_id = 0
  trains.value.forEach(train=>{if(train.id >= new_id) new_id = train.id+1})

  trains.value.push({
    id: new_id,
    number: add_train_number.value,
    status: "stop",
    route: [{
      station: add_train_station.value,
      path: add_train_path.value,
      start: gid_time_now.value,
      finish: undefined
    }]
  })
}

function onClickBtnOpenTrainMenu(){
  is_open_train_menu.value = !is_open_train_menu.value
}
function onClickBtnAddTrain(){
  if(add_train_number.value.length == 0) return

  let train = trains.value.find(train=>train.number==add_train_number.value)

  if(train){
    if((train.route?.length ?? 0) == 0) {
      if(confirm("Есть запланированный или просто пустой маршрут. Хотите его начать?")){
        train.status = "stop"
        train.route = [{
          station: add_train_station.value,
          path: add_train_path.value,
          start: gid_time_now.value,
          finish: undefined
        }]
      }
    }else{
      if(train.status.includes("finish")){
        if(confirm("Есть завершённый маршрут, создаём новый?")){
          createNewTrain()
        }
      }else{
        alert("Такой маршрут есть и он не завершён")
      }
    }
  }else{
    createNewTrain()
  }
}
function onClickBtnStartTrainUp(){
  const train = trains.value.find(train => train.id==action_train_id.value)
  if(train == undefined) return;
  let a = train.route?.length ?? 0
  if(a == 0) return
  let b = train.route![a-1].station
  if(b==0) return

  train.status = "up"
  train.route![a-1].finish = gid_time_now.value
}
function onClickBtnStartTrainDown(){
  const train = trains.value.find(train => train.id==action_train_id.value)
  if(train == undefined) return;
  let a = train.route?.length ?? 0
  if(a == 0) return
  let b = train.route![a-1].station
  if(b==stations.value.length-1) return

  train.status = "down"
  train.route![a-1].finish = gid_time_now.value
}
function onClickBtnPickTrainToStation(){
  const train = trains.value.find(train => train.id==action_train_id.value)
  if(train == undefined) return;
  let a = train.route?.length ?? 0
  if(a == 0) return
  if(train.status != "up" && train.status != "down") return

  if(train.status == "up"){
    let aa = train.route![a-1].station
    train.status = "stop"
    train.route!.push({
      station: aa-1,
      path: pick_train_path.value,
      start: gid_time_now.value,
      finish: undefined
    })
  }else if(train.status == "down"){
    let aa = train.route![a-1].station
    train.status = "stop"
    train.route!.push({
      station: aa+1,
      path: pick_train_path.value,
      start: gid_time_now.value,
      finish: undefined
    })
  }
}
function onClickBtnRePickTrainToStation(){
  const train = trains.value.find(train => train.id==action_train_id.value)
  if(train == undefined) return;
  let a = train.route?.length ?? 0
  if(a == 0) return

  if(train.status == "stop"){
    let aa = train.route![a-1].station
    train.route![a-1].finish = gid_time_now.value

    train.route!.push({
      station: aa,
      path: repick_train_path.value,
      start: gid_time_now.value,
      finish: undefined
    })
  }
}
function onClickBtnRemoveTrain(){
  const train = trains.value.find(train => train.id==action_train_id.value)
  if(train == undefined) return;
  let a = train.route?.length ?? 0
  if(a == 0) return

  train.route![a-1].finish = gid_time_now.value
  if(train.status=="up") train.status = "up-finish"
  if(train.status=="down") train.status = "down-finish"
  if(train.status=="stop") train.status = "stop-finish"
}
function onBtnClickAddTrainRouteBefore(){
  if(!trainForEdit.value) return
  if(!trainForEdit.value?.route) trainForEdit.value.route = []

  trainForEdit.value.route.splice(edit_train_route_point.value,0,{
    station: 0,
    start: gid_time_now.value,
    path: 0,
    finish: gid_time_now.value
  })
}
function onBtnClickAddTrainRouteAfter(){
  if(!trainForEdit.value) return
  if(!trainForEdit.value?.route) trainForEdit.value.route = []
  trainForEdit.value.route.splice(edit_train_route_point.value+1,0,{
    station: 0,
    start: gid_time_now.value,
    path: 0,
    finish: gid_time_now.value
  })
}
function onBtnClickRemoveTrainRoute(){
  if(!trainForEdit.value) return
  if(!trainForEdit.value?.route) trainForEdit.value.route = []
  trainForEdit.value.route.splice(edit_train_route_point.value,1)
}
function onBtnClickAddTrainPlanRouteBefore(){
  if(!trainForEdit.value) return
  if(!trainForEdit.value?.norma_route) trainForEdit.value.norma_route = []

  trainForEdit.value.norma_route.splice(edit_train_normal_route_point.value,0,{
    station: 0,
    start: gid_time_now.value,
    finish: gid_time_now.value
  })
}
function onBtnClickAddTrainPlanRouteAfter(){
  if(!trainForEdit.value) return
  if(!trainForEdit.value?.norma_route) trainForEdit.value.norma_route = []
  trainForEdit.value.norma_route.splice(edit_train_normal_route_point.value+1,0,{
    station: 0,
    start: gid_time_now.value,
    finish: gid_time_now.value
  })
}
function onBtnClickRemoveTrainPlanRoute(){
  if(!trainForEdit.value) return
  if(!trainForEdit.value?.norma_route) trainForEdit.value.norma_route = []
  trainForEdit.value.norma_route.splice(edit_train_normal_route_point.value,1)
}
function onBtnClickRemoveTrain(){
  let train = trains.value.find(train => train.id==edit_train_id.value)
  if(!train) return;
  let index = trains.value.indexOf(train)
  trains.value.splice(index,1)
}
function onClickBtnLoadMap(){
  const input_file = document.createElement("input")
  input_file.type = "file"
  input_file.accept = ".json"
  input_file.click()
  input_file.addEventListener("change",(a)=>{
    if(input_file.files && input_file.files.length > 0){
      input_file.files[0].text()
          .then(JSON.parse)
          .then((load_stations: any) => {
            if(!(load_stations instanceof Array)) return Promise.reject("Error load")
            if(load_stations.length < 0) return Promise.reject("Error load")
            return Promise.all(load_stations.map((station: any)=>{
              if(!(station instanceof Object)) return Promise.reject("Error load")
              if(typeof station.name != "string" || station.name.length == 0) return Promise.reject("Error load")
              if(!(station.paths instanceof Array)) return Promise.reject("Error load")
              return Promise.all(station.paths.map((path: any)=>{
                if(!(path instanceof Object)) return Promise.reject("Error load")
                if(typeof path.name != "string" || path.name.length == 0) return Promise.reject("Error load")
                return Promise.resolve()
              }))
            })).then(()=>{
              stations.value = load_stations
            })
          })
          .then(()=>alert("Готово"),(e)=> {
            alert("Ошибка загрузки")
            console.log(e);
          })
    }
  })
}
function onClickBtnLoadTrains(){
  const input_file = document.createElement("input")
  input_file.type = "file"
  input_file.accept = ".json"
  input_file.click()
  input_file.addEventListener("change",(a)=>{
    if(input_file.files && input_file.files.length > 0){
      input_file.files[0].text()
          .then(JSON.parse)
          .then((load_trains: any) => {
            trains.value = load_trains
          })
          .then(()=>alert("Готово"),(e)=> {
            alert("Ошибка загрузки")
            console.log(e);
          })
    }
  })
}
function onClickBtnSaveTrains(){
  let data = new Blob([JSON.stringify(trains.value)], {type: 'application/json'})
  let link = document.createElement('a');
  link.setAttribute('download', 'trains.json');
  link.href = window.URL.createObjectURL(data);
  link.click()
}
function onClickBtnClearAll(){
  trains.value = []
  stations.value = []
}
function onClickBtnAddRandomTrain() {
  let new_id = 0
  trains.value.forEach(train=>{if(train.id >= new_id) new_id = train.id+1})

  trains.value.push({
    id: new_id,
    number: Math.round(Math.random()*10000).toString(),
    status: "stop",
    route: [{
      station: (Math.random()>0.5) ? 0 : stations.value.length -1,
      path: (Math.random()>0.5) ? -2 : stations.value[stations.value.length -1]?.paths.length+2,
      start: gid_time_now.value-20,
      finish: undefined
    }]
  })
}

const renderStations = computed(()=>{
  let st_y = 0
  return stations.value.map((st)=>{
    let st_y2 = st_y
    st_y += 100 + st.paths.length*20
    return {
      name: st.name,
      paths: st.paths,
      y: st_y2
    }
  })
})
const add_train_paths = computed(()=>{
  return stations.value[add_train_station.value]?.paths ?? []
})
const pick_train_paths = computed(()=>{
  const train = trains.value.find(train => train.id==action_train_id.value)
  if(train == undefined) return [];
  const a = train.route?.length ?? 0
  if(a == 0) return [];
  if(train.status == "up"){
    return stations.value[train.route![a-1].station-1].paths
  }else if(train.status == "down"){
    return stations.value[train.route![a-1].station+1].paths
  }else return []
})
const repick_train_paths = computed(()=>{
  const train = trains.value.find(train => train.id==action_train_id.value)
  if(train == undefined) return [];
  const a = train.route?.length ?? 0
  if(a == 0) return [];
  if(train.status == "stop"){
    return stations.value[train.route![a-1].station].paths
  }else return []
})
const trainsForActions = computed(()=>{
  return trains.value.filter(train=>train.status=="stop"||train.status=="up"||train.status=="down")
})
const trainForEdit = computed(()=>{
  return trains.value.find(train=>train.id == edit_train_id.value)
})
const trainRoutePointForEdit = computed(()=>{
  return trainForEdit.value?.route?.find((point,i)=>i == edit_train_route_point.value)
})
const trainPlanRoutePointForEdit = computed(()=>{
  return trainForEdit.value?.norma_route?.find((point,i)=>i == edit_train_normal_route_point.value)
})

function getTrainPoints(train: Train){
  let points: number[] = []

  ;(train.route ?? []).forEach((r_point,i)=>{
    let path_id = r_point.path ?? 0
    let time_start = r_point.start ?? 0
    let time_finish = r_point.finish

    let st = renderStations.value[r_point.station ?? 0]
    if(!st) return
    let x = time_start*2
    let y = st.y + path_id * 20

    if((train.route??[])[i-1] && (train.route??[])[i-1].station!=r_point.station){
      let yy = st.y
      if((train.route??[])[i-1].station>r_point.station)
        yy += st.paths.length*20
      points.push(x,yy)
    }

    points.push(x,y)

    if(time_finish == -1) time_finish = r_point.finish = undefined

    let fx = time_finish != undefined ? time_finish*2 : gid_time_now.value*2
    points.push(fx,y)

    if((train.route??[])[i+1] && (train.route??[])[i+1].station!=r_point.station){
      let yy = st.y
      if((train.route??[])[i+1].station>r_point.station)
        yy += st.paths.length*20
      points.push(fx,yy)
    }

    if(!(train.route??[])[i+1]){
      if(train.status == "up" || train.status == "up-finish"){
        points.push(fx,st.y)
        points.push(fx + 10,st.y - 20)
      }else if(train.status == "down" || train.status == "down-finish"){
        points.push(fx,st.y + st.paths.length * 20)
        points.push(fx + 10,st.y + st.paths.length * 20 + 20)
      }
    }
  })

  return points
}
function getTrainPlanPoints(train: Train){
  let lines: {sx:number,sy:number,fx:number,fy:number}[] = []

  let temp_x = 0
  let temp_y = 0

  if(train.norma_route && train.norma_route.length > 0){
    train.norma_route.forEach((r_point,i)=>{
      let time_start = r_point.start ?? 0
      let time_finish = r_point.finish ?? 0

      let st = renderStations.value[r_point.station ?? 0]
      if(!st) return
      let fy = st.y
      if((train.norma_route ?? [])[i-1] && (train.norma_route ?? [])[i-1].station > r_point.station)
        fy += st.paths.length * 20

      if(i!=0){
        lines.push({
          sx: temp_x,
          sy: temp_y,
          fx: time_start*2,
          fy: fy
        })
      }

      temp_x = time_finish*2
      temp_y = st.y
      if((train.norma_route ?? [])[i+1] && (train.norma_route ?? [])[i+1].station > r_point.station)
        temp_y += st.paths.length * 20
    })
  }

  return lines
}
function getTrainNumbersByTrain(train: Train){
  let points: {x:number,y:number}[] = []

  ;(train.route ?? []).forEach(r_point=>{
    let path_id = r_point.path ?? 0
    let time_start = r_point.start ?? 0

    let st = renderStations.value[r_point.station ?? 0]
    if(!st) return
    let x = time_start*2+2
    let y = st.y + path_id * 20 - 14

    points.push({x,y})
  })

  return points
}
function getTrainColor(number: string|number){
  if(typeof number == "string") number = Number(number)
  if(number>0 && number < 1000) return "#ff0000"
  if(number>1000 && number < 2000) return "#00ff00"
  if(number>2000 && number < 4000) return "#985601"
  if(number>4000 && number < 5000) return "#00857a"
  if(number>5000 && number < 6000) return "#0065c9"
  if(number>6000 && number < 8000) return "#ff0000"
  if(number>8000 && number < 10000) return "#9300c4"
  return "#000000"
}
function filterTimeZero(time: number){
  if(time < 10){
    return '0' + time
  }else{
    return time
  }
}

watch(trains,()=>{
  localStorage.setItem('trains',JSON.stringify(trains.value))
},{
  deep: true
})
watch(stations,()=>{
  localStorage.setItem('stations',JSON.stringify(stations.value))
},{
  deep: true
})
watch(gid_time_now,(value)=>{
  localStorage.setItem('gid_time',value.toString())
})

let timeline_interval = 0
onMounted(()=>{
  trains.value = JSON.parse(localStorage.getItem('trains') ?? "[]")
  stations.value = JSON.parse(localStorage.getItem('stations') ?? "[]")
  let time = Number(localStorage.getItem('gid_time'))
  gid_time_now.value = isNaN(time) ? 0 : time
  timeline_interval = setInterval(()=>{
    if(gid_time_pause.value) return
    gid_time_now_s.value++
    if(gid_time_now_s.value >= 60) {
      gid_time_now_s.value = 0
      gid_time_now.value++
    }
  },1000)

  window.addEventListener("resize",()=>{
    stageConfig.value.width = window.innerWidth
    stageConfig.value.height = window.innerHeight
  })
})
onBeforeUnmount(()=>{
  clearInterval(timeline_interval)
})

</script>

<style lang="scss" scoped>
.gid{
  position: absolute;
  background: #bbb;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.train-menu{
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background: #282828;
  display: flex;

  &__open-btn{
    height: 100%;
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    cursor: pointer;
    &:hover{
      background: #383838;
    }
  }

  &__body{
    display: flex;
    flex-direction: column;
    padding-left: 10px;
    padding-right: 10px;
    height: 100%;
    min-height: 0;
    overflow-y: auto;
  }
  &__add-train{
    display: flex;
    flex-direction: column;
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: 2px solid #404040;
  }
  &__train-actions{
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    flex-direction: column;
    border-bottom: 2px solid #404040;
  }
  &__gid-time{
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    flex-direction: column;
    border-bottom: 2px solid #404040;
  }
  &__train-edit{
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    flex-direction: column;
    border-bottom: 2px solid #404040;
  }
  &__save-load{
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    flex-direction: column;
  }
}
</style>