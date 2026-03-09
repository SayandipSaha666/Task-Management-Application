import React, { useEffect } from 'react'
import CommonButton from '../../components/common-button/CommonButton';
import { useState } from 'react';
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
    if(loading) return <Skeleton/>

  return (
    <>
    <div className='mb-5'>
        <CommonButton
        onClick={() => setShowDialog(true)}
        buttonText = {"Add New Task"}
        type = "button"
        />
    </div>  
    <div className='mt-5 flex flex-col'>
      <h2 className='font-bold'>List of Tasks</h2>
      <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-4'>
        {Array.isArray(taskList) && taskList.length > 0 ?
          taskList.map((taskItem) => (
            <TaskItem
              key={taskItem._id}
              item={taskItem}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
              />
          ))
          : null
        }
      </div>
    </div>
    <AddNewTask
      showDialog={showDialog}
      handleSubmit={handleSubmit}
      formData={taskFormData}
      btnText={currentEditedId ? "Update" : "Add"}
      title={currentEditedId ? "Update Task" : "Add New Task"}
      onOpenChange={onOpenChange}
    />
      {taskList.length === 0 ? <h3>No Tasks remaining!! Add a new one</h3> : null}
    </>
  )
}

export default TaskPage