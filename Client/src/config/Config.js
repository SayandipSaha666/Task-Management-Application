export const signUpFormControls = [
    {
        id: 'name',
        label: 'Enter your name',
        type: 'text',
        placeholder: "John Doe",
        componentType: 'input',
        required: true,
        name: 'name',
        disabled: false
    },
    {
        id: 'email',
        label: 'Enter your email',
        type: 'text',
        placeholder: "john@gmail.com",
        componentType: 'input',
        required: true,
        name: 'email',
        disabled: false
    },
    {
        id: 'password',
        label: 'Enter your password',
        type: 'text',
        placeholder: "John@123",
        componentType: 'input',
        required: true,
        name: 'password',
        disabled: false
    }
]

export const signInFormControls = [
    {
        id: 'email',
        label: 'Enter your email',
        type: 'text',
        placeholder: "john@gmail.com",
        componentType: 'input',
        required: true,
        name: 'email',
        disabled: false
    },
    {
        id: 'password',
        label: 'Enter your password',
        type: 'text',
        placeholder: "John@123",
        componentType: 'input',
        required: true,
        name: 'password',
        disabled: false
    }
]

export const scrumBoardOptions = [
    {
        id: "todo",
        label: "To DO",
    },
    {
        id: "inProgress",
        label: "In Progress",
    },
    {
        id: "blocked",
        label: "Blocked",
    },
    {
        id: "review",
        label: "Review",
    },
    {
        id: "done",
        label: "Done",
    }
];

export const addewTaskFormControls = [
    {
        id: "title",
        type: "text",
        placeholder: "Enter title",
        label: "Title",
        componentType: "input",
    },
    {
        id: "description",
        type: "text",
        placeholder: "Enter description",
        label: "Description",
        componentType: "input",
    },
    {
        id: "status",
        placeholder: "Enter Status",
        label: "Status",
        componentType: "select",
        options: scrumBoardOptions,
    },
    {
        id: "priority",
        placeholder: "Enter priority",
        label: "Priority",
        componentType: "input",
        componentType: "select",
        options: [
        {
            id: "low",
            label: "Low",
        },
        {
            id: "medium",
            label: "Medium",
        },
        {
            id: "high",
            label: "High",
        },
        ],
    }
]