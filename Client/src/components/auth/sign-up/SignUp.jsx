import React from 'react'
import CommonForm from '../../common-form/CommonForm'
import { signUpFormControls } from '../../../config/Config'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { callRegisterUserApi } from '../../../services/api_service'
import {toast} from 'sonner'
import { useNavigate } from 'react-router-dom'

function SignUp() {

  const [registeredData, setRegisteredData] = useState(null);
  const navigate= useNavigate();

  const formData = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  })

  async function handleSubmit(data){
    try {
      console.log('submitted:', data);
      const response_data = await callRegisterUserApi(data);
      console.log('response:', response_data);
      if(response_data?.success){
          toast.success('User Registration successful', {
            description: 'Welcome'
          })
          navigate('/tasks/list')
      }else{
        toast.error('User Registration failed', {
          description: response_data?.message
        })
      }
      setRegisteredData(data);
      formData.reset();
    } catch (error) {
      console.error('Signup failed:', error?.response?.data || error.message);
    }
  }

  return (
    <div>
      <CommonForm
        formControls={signUpFormControls}
        submitButtonText={"Sign Up"}
        handleSubmit={handleSubmit}
        form={formData}
      />
    </div>
  )
}

export default SignUp