import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {useRoutes, Routes, Route} from 'react-router-dom'
import AuthPage from './pages/auth/Auth'
import TaskPage from './pages/tasks/TaskPage'
import ScrumPage from './pages/scrum-board/ScrumPage'
import NotFound from './pages/notfound/NotFound'
import Layout from './components/common-layout/Layout'
import HomePage from './pages/home/HomePage'

function App() {
  function CustomRoutes(){
    const route = useRoutes([
      {
        path: '/',
        element: <HomePage/>
      },
      {
        path: '/auth',
        element: <AuthPage/>
      },
      {
        path: '/tasks',
        element: <Layout/>,
        children: [
          {
            path: 'list',
            element: <TaskPage/>
          },
          {
            path: 'scrum-board',
            element: <ScrumPage/>
          }
        ]
      },
      {
        path: '*',
        element: <NotFound/>
      }
    ])  
    return route
  }
  return (
    <>
      <CustomRoutes/>
    </>
  )
}

export default App
