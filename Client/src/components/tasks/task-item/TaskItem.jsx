import React from 'react'
import CommonButton from '../../common-button/CommonButton'
import CommonCard from '../../common-card/CommonCard'

function TaskItem({item,handleDelete,handleUpdate, setShowDialog, setCurrentEditedId}) {
  
  return (
    <div>
      <CommonCard
      title={item?.title}
      description={item?.status}
      footerContent={
        <div className="flex w-full justify-between items-center gap-3">
          <CommonButton onClick={() => handleUpdate(item)} buttonText={"Edit"}/>
          <CommonButton onClick={() => handleDelete(item?._id)} buttonText={"Delete"}/>
        </div>
      }
      />
    </div>
  )
}

export default TaskItem