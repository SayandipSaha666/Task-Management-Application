import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="animate-fade-in-up">
        {/* 404 */}
        <h1 className="text-8xl font-extrabold gradient-text sm:text-9xl">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold text-foreground">
          Page not found
        </h2>

        <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl btn-gradient text-sm font-semibold tracking-wide transition-all duration-200"
          >
            <Home size={16} />
            Back Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound