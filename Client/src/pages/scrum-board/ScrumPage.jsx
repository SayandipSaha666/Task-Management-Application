import React, { useEffect } from 'react'
import { useContext } from 'react';
import { GlobalContext } from '../../context/Store';
import { getAllTaskAPI, updateTaskAPI } from '../../services/api_service';
import {Skeleton} from '../../components/ui/skeleton'
import { scrumBoardOptions } from '../../config/Config';
import CommonCard from '../../components/common-card/CommonCard';

const columnColors = {
  todo:       { header: 'bg-blue-500',    dot: 'bg-blue-400',    border: 'border-blue-200/60' },
  inProgress: { header: 'bg-amber-500',   dot: 'bg-amber-400',   border: 'border-amber-200/60' },
  blocked:    { header: 'bg-red-500',      dot: 'bg-red-400',     border: 'border-red-200/60' },
  review:     { header: 'bg-purple-500',   dot: 'bg-purple-400',  border: 'border-purple-200/60' },
  done:       { header: 'bg-emerald-500',  dot: 'bg-emerald-400', border: 'border-emerald-200/60' },
};

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
          className='mb-3'
          draggable={task?.status !== "done" ? true : false}
        >
          <CommonCard
            title={task.title}
            description={task.description}
            className={`${task?.status !== "done" ? "cursor-grab active:cursor-grabbing" : ""}`}
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

  if(loading) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ))}
    </div>
  )

  const tasksByStatus = renderTaskByTaskStatus();

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="section-title">Scrum Board</h1>
        <p className="section-subtitle mt-1">Drag and drop tasks between columns</p>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5">
        {scrumBoardOptions.map((item) => {
          const colors = columnColors[item.id] || columnColors.todo;
          const tasksInColumn = tasksByStatus[item.id] || [];

          return (
            <div
              className={`flex-shrink-0 w-64 sm:w-auto rounded-2xl border ${colors.border} bg-white/40 backdrop-blur-sm overflow-hidden`}
              key={item.id}
              onDrop={(event) => onDrop(event, item.id)}
              onDragOver={(event) => event.preventDefault()}
            >
              {/* Column header */}
              <div className="px-4 py-3 flex items-center gap-2.5">
                <div className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                <h3 className="text-sm font-semibold text-foreground">
                  {item.label}
                </h3>
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-muted/80 px-1.5 text-xs font-medium text-muted-foreground">
                  {tasksInColumn.length}
                </span>
              </div>

              {/* Column body */}
              <div className="p-3 min-h-[200px]">
                {tasksInColumn.length > 0 ? tasksInColumn : (
                  <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-border/40 text-xs text-muted-foreground/60">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  )
}

export default ScrumPage