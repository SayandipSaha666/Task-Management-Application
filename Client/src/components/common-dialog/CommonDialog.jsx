import React from 'react'
import CommonForm from '../common-form/CommonForm'
import { Dialog, DialogContent, DialogTitle} from '../ui/dialog'
import { Button } from '../ui/button'


function CommonDialog({title,formControls, formData, btnText, showDialog, onOpenChange, handleSubmit}) {
  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-screen h-112.5 overflow-auto">
            <DialogTitle>{title}</DialogTitle>
            <CommonForm
              formControls={formControls}
              handleSubmit={handleSubmit}
              form={formData}
              submitButtonText={btnText}
            />
        </DialogContent>
    </Dialog>
  )
}

export default CommonDialog