import React, {useState} from 'react'
import SignIn from '../../components/auth/sign-in/SignIn';
import SignUp from '../../components/auth/sign-up/SignUp';

function AuthPage() {
  const [isRegistered,setIsRegistered] = useState(false);
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      {/* Background decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className='relative z-10 w-full max-w-md animate-fade-in-up'>
        {/* Auth Card */}
        <div className="rounded-2xl border border-border/50 bg-white/80 p-8 shadow-xl shadow-slate-900/[0.06] backdrop-blur-xl">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl btn-gradient">
              <span className="text-lg font-bold text-white">T</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isRegistered ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isRegistered
                ? 'Sign in to continue managing your tasks'
                : 'Get started with TaskFlow for free'}
            </p>
          </div>

          {/* Form */}
          <div>
            {isRegistered ? <SignIn/> : <SignUp/>}
          </div>

          {/* Switch */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isRegistered ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsRegistered(!isRegistered)}
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                {isRegistered ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage