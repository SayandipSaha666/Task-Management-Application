import React from 'react'
import CommonForm from '../../common-form/CommonForm'
import { signInFormControls } from '../../../config/Config'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { callLoginUserApi } from '../../../services/api_service'
import {toast} from 'sonner'
import { useNavigate } from 'react-router-dom'


function SignIn() {
  const [loggedInData, setLoggedInData] = useState(null);
  const navigate= useNavigate();

  const formData = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function handleSubmit(data){
    try {
      console.log('submitted:', data);
      const response_data = await callLoginUserApi(data);
      console.log('response:', response_data);
      if(response_data?.success){
        toast.success('User Login successful',{
          description: 'Welcome'
        })
        navigate('/tasks/list')
      }else{
        toast.error('User Login failed',{
          description: response_data?.message
        })
      }
      setLoggedInData(data);
      formData.reset(); 
    } catch (error) {
      console.error('SignIn failed:', error?.response?.data || error.message);
    }
  }


  return (
    <div>
      <CommonForm
        formControls={signInFormControls}
        submitButtonText={"Sign In"}
        handleSubmit={handleSubmit}
        form={formData}
      />
    </div>
  )
}

export default SignIn