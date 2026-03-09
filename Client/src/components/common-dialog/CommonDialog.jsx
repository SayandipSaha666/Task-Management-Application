import React from 'react'
import CommonForm from '../common-form/CommonForm'
import { Dialog, DialogContent, DialogTitle} from '../ui/dialog'

function CommonDialog({title,formControls, formData, btnText, showDialog, onOpenChange, handleSubmit}) {
  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-auto rounded-2xl border border-border/60 bg-white/95 p-0 shadow-xl backdrop-blur-xl">
            <div className="border-b border-border/40 px-6 py-5">
              <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">{title}</DialogTitle>
            </div>
            <div className="px-6 py-5">
              <CommonForm
                formControls={formControls}
                handleSubmit={handleSubmit}
                form={formData}
                submitButtonText={btnText}
              />
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default CommonDialog