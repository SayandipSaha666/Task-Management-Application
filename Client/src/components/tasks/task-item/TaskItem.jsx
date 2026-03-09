import React from 'react'
import CommonCard from '../../common-card/CommonCard'
import { Pencil, Trash2 } from 'lucide-react'

const statusConfig = {
  todo:       { label: 'To Do',       className: 'badge-todo' },
  inProgress: { label: 'In Progress', className: 'badge-inprogress' },
  blocked:    { label: 'Blocked',     className: 'badge-blocked' },
  review:     { label: 'Review',      className: 'badge-review' },
  done:       { label: 'Done',        className: 'badge-done' },
};

const priorityConfig = {
  low:    { label: 'Low',    className: 'badge-low' },
  medium: { label: 'Medium', className: 'badge-medium' },
  high:   { label: 'High',   className: 'badge-high' },
};

function TaskItem({item,handleDelete,handleUpdate, setShowDialog, setCurrentEditedId}) {
  const status = statusConfig[item?.status] || statusConfig.todo;
  const priority = priorityConfig[item?.priority] || null;

  return (
    <div className="animate-fade-in-up">
      <CommonCard
      title={item?.title}
      description={item?.description}
      headerRightContent={
        <div className="flex items-center gap-1.5">
          {priority && (
            <span className={`badge ${priority.className}`}>
              {priority.label}
            </span>
          )}
          <span className={`badge ${status.className}`}>
            {status.label}
          </span>
        </div>
      }
      footerContent={
        <div className="flex w-full items-center gap-2 pt-1">
          <button
            onClick={() => handleUpdate(item)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            onClick={() => handleDelete(item?._id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      }
      />
    </div>
  )
}

export default TaskItem