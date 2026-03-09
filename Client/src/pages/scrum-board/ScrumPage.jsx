import React, { useEffect } from 'react'
import { useContext } from 'react';
import { GlobalContext } from '../../context/Store';
import { getAllTaskAPI, updateTaskAPI } from '../../services/api_service';
import {Skeleton} from '../../components/ui/skeleton'
import { scrumBoardOptions } from '../../config/Config';
import CommonCard from '../../components/common-card/CommonCard';


function ScrumPage() {
  const {loading, setLoading, taskList, setTaskList, user} = useContext(GlobalContext);

  function onDragStart(event, getTaskId) {
    event.dataTransfer.setData("id", getTaskId);
  }

  async function updateTaskByStatus(getTask) {
    await updateTaskAPI(getTask);
    await fetchTaskList();
  }

  function onDrop(event, getCurrentStatus) {
    const getDraggedTaskId = event.dataTransfer.getData("id");

    let findCurrentTask = taskList.find(
      (item) => item._id.toString() === getDraggedTaskId
    );

    findCurrentTask = {
      ...findCurrentTask,
      status: getCurrentStatus,
    };

    updateTaskByStatus(findCurrentTask);
  }

  function renderTaskByTaskStatus() {
    const taskStatuses = {
      done: [],
      inProgress: [],
      blocked: [],
      todo: [],
      review: []
    };
    taskList.forEach((task) => {
      taskStatuses[task.status].push(
        <div
          key={task._id}
          onDragStart={task?.status !== "done" ? (event) => onDragStart(event, task._id) : null }
          className='mb-2'
          draggable={task?.status !== "done" ? true : false}
        >
          <CommonCard
            title={task.title}
            description={task.description}
          />
        </div>
      )
    })
    console.log(taskStatuses)
    return taskStatuses;
  }

  async function fetchTaskList() {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await getAllTaskAPI(user?._id);
      if(response?.success){
        setTaskList(response?.taskList || []);
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(user !== null) {
      fetchTaskList();
    }
  },[user])
  if(loading) return <Skeleton/>

  return (
    <div className="grid grid-cols-5 gap-2 h-full">
      {scrumBoardOptions.map((item) => (
        <div
          className="border border-[#333333] rounded overflow-auto"
          key={item.id}
          onDrop={(event) => onDrop(event, item.id)}
          onDragOver={(event) => event.preventDefault()}
        >
          <div className="px-1 py-3 text-center bg-black border-none mb-3">
            <h3 className="text-2xl font-extrabold text-white">
              {item.label}
            </h3>
          </div>
          <div className="p-3">{renderTaskByTaskStatus()[item.id]}</div>
        </div>
      ))}
    </div>
  )
}

export default ScrumPage