import React, {useState} from 'react'
import SignIn from '../../components/auth/sign-in/SignIn';
import SignUp from '../../components/auth/sign-up/SignUp';
import CommonButton from '../../components/common-button/CommonButton';

function AuthPage() {
  const [isRegistered,setIsRegistered] = useState(false);
  return (
    <div className='flex flex-auto flex-col min-h-screen h-full'>
      <div className='flex h-full flex-col justify-center items-center bg-white'>
        <h3 className="text-3xl font-bold">Welcome</h3>
        <div className="mt-5">
          {isRegistered ? <SignIn/> : <SignUp/>}
        </div>
        <div className="mt-5">
          <CommonButton 
            onClick={() => setIsRegistered(!isRegistered)}
            buttonText={isRegistered ? 'Switch to Sign Up' : 'Switch to Sign In'}
            type={"button"}
          />
        </div>
      </div>
    </div>
  )
}

export default AuthPage