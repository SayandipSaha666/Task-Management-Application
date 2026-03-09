import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../common-header/Header'

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout