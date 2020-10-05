//拖拽的实现是靠react自带的onDrag事件
//所以我们只要在这里封装好HTML标签属性,给外面直接用就好了
//封装bar和draggable(这个包装想要能被拖拽的组件)
//当draggable被拖起，让下面的Bar消失，并且该draggable变成fixed
//所以文档里这俩消失了，下面的就挤上来了
//这里只是管理数据的
//真正的把这些数据渲染成DOM在App里做的


import {useState} from 'react'

const DRAGGABLE = "DRAGGABLE"
const BAR = "BAR"

function draggable(item,id){
  return {
    type:DRAGGABLE,
    id,
    data:item
  }
}

//  |A|B|C|  |是Bar
function insertBars(list){
  let i = 0 //ID
  
  const newBar = () =>{
    return {
      type:BAR,
      id:i++
    }
  }

  return [newBar()].concat(
    ...list.map(item=>{
      return [draggable(item,i++),newBar()]
    })
    //list.map最后变成[ [],[],[] ]  所以...解构成 [],[],[]就可以用concat把数组全拼接在一起
  )
}

function clacChanging(list,drag,drop){
  //复制一份state里的list,因为不能直接修改state
  //drag是正在拽的，drop是松手在哪个list[drop]上了(我们只给Bar添加了这个插入功能)
  list = list.slice()
  const dragItem = list[drag]

  //dir>0拽到下面去了，<0是拽到上面去了
  const dir = drag > drop ? -2 : 2;
  //drop的地方一定是Bar
  const end = dir > 0 ? drop -1 : drop + 1;

  //数组里可拖拽的元素一个个进行交换
  for(let i = drag ;i !== end ; i+=dir){
    list[i] = list[i+dir];
  }
  list[end] = dragItem;
  return list
}

export default function useDraggable(list){
  const [dragList,setDragList] = useState(() => 
    insertBars(list)
  )

  const [dragOver,setDragOver] = useState(null)
  const [dragging,setDragging] = useState(null)


  return {
    dragList,
    //可被放置在上面的用这个
    createDropperProps: id => {
      return {
        key : id,
        dragging,
        dragOver,//记录鼠标拖拽在哪个id物体上停留
        eventHandlers:{
          //当某被拖动的对象在另一对象容器范围内拖动时触发此事件
          onDragOver : (e) => {
            e.preventDefault()
            setDragOver(id)
          },
          //当被鼠标拖动的对象离开其容器范围内时触发此事件
          onDragLeave: e => {
            e.preventDefault()
            setDragOver(null)
          },
          //鼠标松开
          onDrop: e => {
            e.preventDefault()
            setDragOver(null)
            setDragList( list => {
              return clacChanging(list,dragging,id)
            })
          }
        }
      }
    },
    //可拖拽的用这个
    createDraggerProps : (id,key) => {
      return {
        id,
        key,
        dragging,//保存现在正在drag的id
        eventHandlers:{
          //这些都是HTML的drag事件
          onDragStart:()=>{
            setDragging(id)
          },
          onDragEnd:() => {
            setDragging(null)
          }
        }
      }
    }
  }
}