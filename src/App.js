import React from 'react';
import './style.css'
import useDraggable from './useDraggable'

//大体的思路应该是通过HTML标签的drag事件来实现拖拽
//而拖拽需要放在一个东西上，直接放list.item上不直观也不知道插上还是下
//所以我们用BAR|ITEM|BAR|... 的方式，把item放在BAR上插入
//那么把BAR和ITEM封装成一个list,使用只需要在ITEM里面插入东西就好了，因为ITEM已经能拖动了
//这里的ITEM更像wrapper，是一层包装
//然后发现用户要能插入，必须提取出ITEM,那么list就没意义了，因为内部东西被提取出去了
//那么我们只能选择导出BAR和ITEM
//他这里选择了导出list对象数组，然后BAR和ITEM定义在这里，我觉得可以封装进去
//传进去一个list(其实只要长度就好了)我们导出BAR|ITEM|BAR|...对象数组
//外面就可以获得这个list,根据这个对象type来判断他是BAR还是ITEM
//然后写对应的构造函数,可以发现每个BAR和ITEM都需要定义HTML里的drap等等props
//所以全部写进封装文件里,...createDropperProps(i)来获得
//当然也可以在这里的Bar上写props，不过这样的缺点是很长，而且需要把hook里保存的
//谁在拖拽，覆盖这谁，修改目前正在被拖拽或覆盖的id等等set函数传出来再写
//这样很繁琐
//可以发现这里的Hook封装不是父子通信这种class的东西了
//已经是像redux的store一样存储着单纯的信息而不是组件了
//在hook文件外面修改hook里保存的数据来共同管理

const list = [
  {
    src:"./imgs/1.jpg",
    alt:'1',
    title:'one'
  },
  {
    src:"./imgs/2.jpg",
    alt:'2',
    title:'two'


  },
  {
    src:"./imgs/3.jpg",
    alt:'3',
    title:'three'


  }
]

//处理被拖动的元素的class属性，给他加上dragging
function cls(def,conditions){
  const list = [def]

    if(conditions[0]){
      list.push(conditions[1])
    }
  return list.join(" ")
}

export default function App(){
  return (
    <div className="App">
       <DraggableList list={list}/>
    </div>
  )
}

function DraggableList({list}){
  const {dragList,createDropperProps,createDraggerProps} = useDraggable(list)
  return dragList.map((item,i) => {
    if(item.type ==="BAR") {
      return <Bar id={i}  {...createDropperProps(i)} />
    }
    else{
      return (
      <Draggable {...createDraggerProps(i,item.id)}>
        <Card {...item.data}/>
      </Draggable>
      )
    }
  })
   
}
 
function Draggable({children,eventHandlers,dragging,id}){

  return <div 
  {...eventHandlers} 
  draggable={true}
  className={cls("draggable",[dragging === id , "dragging"])}>
    {children}
  </div>
}

function Bar({id,dragging,dragOver,eventHandlers}){
  //Bar上面那个draggable被拖动了，去掉该Bar
  if(id === dragging + 1){
    return null
  }
  return (
  <div 
  className={cls("draggable--bar",[dragOver === id,"dragover"])}
  {...eventHandlers} >
    <div 
    className="inner"

    //当拖拽到该Bar上面的时候,让Bar拥有高度和颜色
    //那么就能使用户看见这个要摆放的位置了
    style={{
      height: id === dragOver ? "80px" : "0px"
    }}></div>
  </div>
  )
}

function Card({src,alt,title}){
  return <div className="card">
    <img src={require(src+"")} alt={alt}/>
    <span>{title}</span>
  </div>
}