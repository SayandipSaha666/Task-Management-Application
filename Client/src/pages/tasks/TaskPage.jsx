import React, { useEffect } from 'react'
import { useState } from 'react';
import { Plus, ListChecks, Inbox } from 'lucide-react';
import TaskItem from '../../components/tasks/task-item/TaskItem';
import AddNewTask from '../../components/tasks/add-task/AddNewTask';
import { useContext } from 'react';
import { GlobalContext } from '../../context/Store';
import { addNewTaskAPI, getAllTaskAPI , deleteTaskAPI , updateTaskAPI } from '../../services/api_service';
import {Skeleton} from '../../components/ui/skeleton'

function TaskPage() {
  const [showDialog,setShowDialog] = useState(false);
  const {loading, setLoading, taskList, setTaskList, user, taskFormData, currentEditedId, setCurrentEditedId} = useContext(GlobalContext);

  async function handleUpdate(item){
    setCurrentEditedId(item?._id);
    setShowDialog(true);
    taskFormData.setValue('title',item?.title);
    taskFormData.setValue('description', item?.description);
    taskFormData.setValue('status', item?.status);
    taskFormData.setValue('priority', item?.priority);
  }

  async function handleDelete(id){
    const deleteItem = await deleteTaskAPI(id);
    if(deleteItem?.success){
      fetchTaskList();
    }
  }

  async function handleSubmit(getData){
    console.log(getData,user);
    const response = (currentEditedId) ? await updateTaskAPI({...getData, userId: user._id, _id: currentEditedId}) :  await addNewTaskAPI({...getData,userId: user._id});
    console.log(response);
    if(response?.success){
      await fetchTaskList();
      setShowDialog(false);
      taskFormData.reset({
          title: '',
          description: '',
          status: '',
          priority: ''
      })
      setCurrentEditedId(null);
    }
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

  const onOpenChange = (open) => {
    setShowDialog(open);
    if (!open) {
      taskFormData.reset();
      setCurrentEditedId(null);
    }
  }

  useEffect(() => {
    if(user !== null) {
      fetchTaskList();
    }
    },[user])

    console.log(taskList)

    if(loading) return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    )

  return (
    <>
    {/* Page header */}
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
      <div>
        <h1 className='section-title flex items-center gap-2'>
          <ListChecks size={24} className="text-indigo-500" />
          My Tasks
        </h1>
        <p className="section-subtitle mt-1">Organize and track your work</p>
      </div>
      <button
        onClick={() => setShowDialog(true)}
        className="inline-flex items-center gap-2 h-11 px-5 rounded-xl btn-gradient text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer"
      >
        <Plus size={18} strokeWidth={2.5} />
        Add Task
      </button>
    </div>

    {/* Task grid */}
    {Array.isArray(taskList) && taskList.length > 0 ? (
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {taskList.map((taskItem) => (
          <TaskItem
            key={taskItem._id}
            item={taskItem}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
          />
        ))}
      </div>
    ) : (
      /* Empty state */
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 mb-5">
          <Inbox size={28} className="text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No tasks yet</h3>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
          Create your first task to start organizing your workflow.
        </p>
      </div>
    )}

    <AddNewTask
      showDialog={showDialog}
      handleSubmit={handleSubmit}
      formData={taskFormData}
      btnText={currentEditedId ? "Update" : "Add"}
      title={currentEditedId ? "Update Task" : "Add New Task"}
      onOpenChange={onOpenChange}
    />
    </>
  )
}

export default TaskPage