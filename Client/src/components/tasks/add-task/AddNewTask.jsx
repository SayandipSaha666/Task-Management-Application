import React from 'react'
import CommonDialog from '../../common-dialog/CommonDialog'
import { addewTaskFormControls } from '../../../config/Config'


function AddNewTask({showDialog,onOpenChange,handleSubmit,formData, btnText, title}) {
  
  return (
    <div>
        <CommonDialog
        formControls={addewTaskFormControls}
        showDialog={showDialog}
        onOpenChange={onOpenChange}
        title={title}
        btnText={btnText}
        handleSubmit={handleSubmit}
        formData={formData}
        />
    </div>
  )
}

export default AddNewTask