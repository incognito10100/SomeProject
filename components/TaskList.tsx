'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  title: string
  description: string
  type: string
  dueAt: Date
  pointsValue: number
  minWordCount: number | null
  submissions: Array<{
    id: string
    submittedAt: Date
    mentorScore: number | null
  }>
}

type Props = {
  tasks:    Task[]
  userId:   string
  userRole: string
}


const typeColors: Record<string, string> = {
  READING:    '#3d6b3d',
  REFLECTION: '#8b7355',
  LECTURE:    '#1e2d4a',
  ESSAY:      '#a07830',
  DISCUSSION: '#3d4a5c',
}

export default function TaskList({ tasks, userId, userRole }: Props) {
  const router = useRouter()

  // Which task card is expanded (showing the submit form)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [submission, setSubmission]     = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [filter, setFilter]             = useState('ALL')

  // Filter the tasks
  const filtered = tasks.filter(task => {
    if (filter === 'ALL')      return true
    if (filter === 'PENDING')  return task.submissions.length === 0
    if (filter === 'DONE')     return task.submissions.length > 0
    return task.type === filter
  })

  async function handleSubmit(taskId: string) {
    setSubmitting(true)

    const response = await fetch('/api/tasks/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, content: submission })
    })

    setSubmitting(false)

    if (response.ok) {
      setExpandedTask(null)
      setSubmission('')
      router.refresh() // reload the page data
    }
  }

  const filters = ['ALL', 'PENDING', 'DONE', 'READING', 'REFLECTION', 'ESSAY', 'LECTURE']

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px',
            borderRadius: '100px',
            border: '1px solid',
            borderColor: filter === f ? '#1a1714' : 'rgba(139,115,85,0.25)',
            background: filter === f ? '#1a1714' : 'transparent',
            color: filter === f ? '#f5f0e8' : '#9e9488',
            fontFamily: 'monospace',
            fontSize: '9px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            cursor: 'pointer'
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Task cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {filtered.map(task => {
          const isSubmitted = task.submissions.length > 0
          const isOverdue   = !isSubmitted && new Date() > task.dueAt
          const isExpanded  = expandedTask === task.id
          const wordCount   = submission.split(' ').filter(Boolean).length

          return (
            <div key={task.id} style={{
              border: '1px solid',
              borderColor: isExpanded ? '#8b7355' : 'rgba(139,115,85,0.2)',
              borderRadius: '6px',
              background: '#f5f0e8',
              overflow: 'hidden',
              transition: 'all 0.2s'
            }}>
              {/* Coloured left stripe by task type */}
              <div style={{
                display: 'flex'
              }}>
                <div style={{
                  width: '3px',
                  background: typeColors[task.type] ?? '#8b7355',
                  flexShrink: 0
                }} />

                <div style={{ flex: 1, padding: '20px 22px' }}>

                  {/* Type label */}
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '9px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase' as const,
                    color: typeColors[task.type] ?? '#8b7355',
                    marginBottom: '8px'
                  }}>
                    {task.type}
                  </div>

                  {/* Title */}
                  <div style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '17px',
                    fontWeight: '500',
                    color: '#1a1714',
                    lineHeight: 1.3,
                    marginBottom: '8px'
                  }}>
                    {task.title}
                  </div>

                  {/* Description */}
                  <div style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '12px',
                    color: '#9e9488',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                    marginBottom: '16px'
                  }}>
                    {task.description}
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap' as const,
                    gap: '8px'
                  }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      color: isOverdue ? '#8b2020' : '#9e9488'
                    }}>
                      {isOverdue ? '⚠ Overdue'
                        : isSubmitted ? '✓ Submitted'
                        : `Due ${task.dueAt.toLocaleDateString('en-IN')}`}
                    </div>

                    {!isSubmitted && (
                      <button
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        style={{
                          padding: '7px 16px',
                          background: isExpanded ? 'transparent' : '#1a1714',
                          color: isExpanded ? '#8b7355' : '#f5f0e8',
                          border: '1px solid',
                          borderColor: isExpanded ? '#8b7355' : '#1a1714',
                          borderRadius: '4px',
                          fontFamily: 'Georgia, serif',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {isExpanded ? 'Cancel' : 'Submit →'}
                      </button>
                    )}

                    {isSubmitted && task.submissions[0].mentorScore && (
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#3d6b3d'
                      }}>
                        Score: {task.submissions[0].mentorScore}/100
                      </div>
                    )}
                  </div>

                  {/* Submission form — shows when expanded */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(139,115,85,0.15)'
                    }}>
                      {task.minWordCount && (
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '9px',
                          color: wordCount >= task.minWordCount ? '#3d6b3d' : '#9e9488',
                          marginBottom: '8px',
                          letterSpacing: '0.1em'
                        }}>
                          {wordCount} / {task.minWordCount} words minimum
                        </div>
                      )}
                      <textarea
                        value={submission}
                        onChange={e => setSubmission(e.target.value)}
                        placeholder="Write your submission here..."
                        style={{
                          width: '100%',
                          minHeight: '120px',
                          padding: '12px',
                          border: '1px solid rgba(139,115,85,0.25)',
                          borderRadius: '4px',
                          fontFamily: 'Georgia, serif',
                          fontSize: '13px',
                          lineHeight: 1.7,
                          background: 'white',
                          resize: 'vertical' as const,
                          outline: 'none',
                          color: '#1a1714',
                          marginBottom: '10px'
                        }}
                      />
                      <button
                        onClick={() => handleSubmit(task.id)}
                        disabled={
                          submitting ||
                          (!!task.minWordCount && wordCount < task.minWordCount)
                        }
                        style={{
                          padding: '9px 20px',
                          background: submitting ? '#9e9488' : '#1a1714',
                          color: '#f5f0e8',
                          border: 'none',
                          borderRadius: '4px',
                          fontFamily: 'Georgia, serif',
                          fontSize: '13px',
                          cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {submitting ? 'Submitting...' : 'Submit Task'}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}