import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Kanban, Zap } from 'lucide-react'

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      {/* Background decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-indigo-400/8 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-violet-400/8 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl animate-fade-in-up">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600">
          <Zap size={14} />
          Free & Open Source
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Manage tasks{' '}
          <span className="gradient-text">effortlessly</span>
        </h1>

        <p className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
          A beautifully simple task manager with list and scrum board views.
          Stay organized. Ship faster.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl btn-gradient text-sm font-semibold tracking-wide transition-all duration-200"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 rounded-xl bg-white/60 border border-border/50 px-4 py-2.5 backdrop-blur-sm shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Task Management
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/60 border border-border/50 px-4 py-2.5 backdrop-blur-sm shadow-sm">
            <Kanban size={16} className="text-indigo-500" />
            Scrum Board
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/60 border border-border/50 px-4 py-2.5 backdrop-blur-sm shadow-sm">
            <Zap size={16} className="text-amber-500" />
            Drag & Drop
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage