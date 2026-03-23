'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
const [running, setRunning] = useState(false)
const [runMsg,  setRunMsg]  = useState('')

type User = {
  id: string
  name: string
  email: string
  role: string
  totalPoints: number
  createdAt: Date
  _count: { submissions: number; journals: number }
}

type Task = {
  id: string
  title: string
  type: string
  dueAt: Date
  pointsValue: number
  assignedTo: string[]
  _count: { submissions: number }
}

type Chain = {
  id: string
  title: string
  status: string
  linkCount: number
  createdAt: Date
  _count: { links: number }
}

type Stats = {
  users: number
  submissions: number
  journals: number
  chainLinks: number
}

const card = {
  background: '#f5f0e8',
  border: '1px solid rgba(139,115,85,0.2)',
  borderRadius: '6px',
  padding: '24px',
  marginBottom: '20px',
}

const label = {
  display: 'block' as const,
  fontFamily: 'monospace',
  fontSize: '9px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#9e9488',
  marginBottom: '5px',
}

const input = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid rgba(139,115,85,0.25)',
  borderRadius: '4px',
  background: '#faf7f2',
  fontFamily: 'Georgia, serif',
  fontSize: '13px',
  outline: 'none',
  color: '#1a1714',
  marginBottom: '12px',
  boxSizing: 'border-box' as const,
}

const btn = (active: boolean) => ({
  padding: '9px 20px',
  border: '1px solid',
  borderColor: active ? '#1a1714' : 'rgba(139,115,85,0.25)',
  background: active ? '#1a1714' : 'transparent',
  color: active ? '#f5f0e8' : '#9e9488',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '9px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
})

export default function AdminClient({
  users, tasks, chains, stats
}: {
  users: User[]
  tasks: Task[]
  chains: Chain[]
  stats: Stats
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'members' | 'tasks' | 'chains'>('overview')

  // ── Task form ──────────────────────────────────────────────
  const [newTask, setNewTask] = useState({
    title: '', description: '', type: 'READING',
    dueAt: '', pointsValue: '50', minWordCount: ''
  })
  const [selectAll,     setSelectAll]     = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [creatingTask,  setCreatingTask]  = useState(false)
  const [taskMsg,       setTaskMsg]       = useState('')

  // ── Chain form ─────────────────────────────────────────────
  const [newChain, setNewChain] = useState({
    title: '', seedPrompt: '', windowHours: '8'
  })
  const [creatingChain, setCreatingChain] = useState(false)
  const [chainMsg,      setChainMsg]      = useState('')

  // ── Change role ────────────────────────────────────────────
  async function changeRole(userId: string, role: string) {
    await fetch('/api/admin/users/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role })
    })
    router.refresh()
  }

  // ── Create task ────────────────────────────────────────────
  async function createTask() {
    if (!newTask.title || !newTask.dueAt) {
      setTaskMsg('Please fill in title and due date.')
      return
    }
    setCreatingTask(true)
    setTaskMsg('')

    const assignedTo = selectAll
      ? users.filter(u => u.role === 'MEMBER').map(u => u.id)
      : selectedUsers

    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, assignedTo })
    })

    setCreatingTask(false)

    if (res.ok) {
      setTaskMsg('✓ Task created successfully!')
      setNewTask({ title: '', description: '', type: 'READING', dueAt: '', pointsValue: '50', minWordCount: '' })
      router.refresh()
    } else {
      setTaskMsg('Something went wrong. Try again.')
    }
  }

  async function runScheduler() {
  setRunning(true)
  setRunMsg('')
  const res  = await fetch('/api/cron/scheduler')
  const data = await res.json()
  setRunning(false)
  setRunMsg(`✓ Done — ${data.results.chains.broken ?? 0} chains checked, ${data.results.streaks.reset ?? 0} streaks reset`)
}

// Add this JSX at the top of the overview tab
<div style={{
  display: 'flex', alignItems: 'center',
  gap: '12px', marginBottom: '24px',
  padding: '16px 20px',
  background: '#f5f0e8',
  border: '1px solid rgba(139,115,85,0.2)',
  borderRadius: '6px',
}}>
  <div style={{ flex: 1 }}>
    <div style={{
      fontFamily: 'Georgia, serif',
      fontSize: '14px', color: '#1a1714'
    }}>
      Background Jobs
    </div>
    <div style={{
      fontFamily: 'monospace', fontSize: '9px',
      color: '#9e9488', marginTop: '3px'
    }}>
      Runs automatically at midnight · click to run now
    </div>
  </div>
  {runMsg && (
    <div style={{
      fontFamily: 'Georgia, serif', fontSize: '12px',
      color: '#3d6b3d', fontStyle: 'italic'
    }}>
      {runMsg}
    </div>
  )}
  <button
    onClick={runScheduler}
    disabled={running}
    style={{
      padding: '8px 16px',
      background: running ? '#9e9488' : '#1a1714',
      color: '#f5f0e8', border: 'none',
      borderRadius: '4px',
      fontFamily: 'monospace', fontSize: '9px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      cursor: running ? 'not-allowed' : 'pointer',
      flexShrink: 0,
    }}
  >
    {running ? 'Running...' : '▶ Run Now'}
  </button>
</div>

  // ── Seed chain ─────────────────────────────────────────────
  async function seedChain() {
    if (!newChain.title || !newChain.seedPrompt) {
      setChainMsg('Please fill in title and prompt.')
      return
    }
    setCreatingChain(true)
    setChainMsg('')

    const res = await fetch('/api/admin/chains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChain)
    })

    setCreatingChain(false)

    if (res.ok) {
      setChainMsg('✓ Chain seeded successfully!')
      setNewChain({ title: '', seedPrompt: '', windowHours: '8' })
      router.refresh()
    } else {
      setChainMsg('Something went wrong. Try again.')
    }
  }

  const members = users.filter(u => u.role === 'MEMBER')

  return (
    <div>

      {/* ── Tab bar ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {(['overview', 'members', 'tasks', 'chains'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={btn(tab === t)}>
            {t === 'overview'  && '◈ Overview'}
            {t === 'members'   && '◎ Members'}
            {t === 'tasks'     && '☰ Tasks'}
            {t === 'chains'    && '⛓ Chains'}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          OVERVIEW
      ══════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div>
          {/* Stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {[
              { label: 'Total Members',   value: stats.users,       color: '#1e2d4a' },
              { label: 'Submissions',      value: stats.submissions,  color: '#3d6b3d' },
              { label: 'Journal Entries',  value: stats.journals,     color: '#8b7355' },
              { label: 'Chain Links',      value: stats.chainLinks,   color: '#a07830' },
            ].map((s, i) => (
              <div key={i} style={{ ...card, borderTop: `3px solid ${s.color}`, marginBottom: 0 }}>
                <div style={{ ...label, marginBottom: '10px' }}>{s.label}</div>
                <div style={{
                  fontFamily: 'Georgia, serif', fontSize: '40px',
                  fontWeight: '300', color: '#1a1714', lineHeight: 1
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Members with no submissions */}
          <div style={card}>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: '17px',
              color: '#1a1714', marginBottom: '16px'
            }}>
              No Activity Yet
            </div>
            {members.filter(u => u._count.submissions === 0).length === 0 ? (
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: '13px',
                color: '#9e9488', fontStyle: 'italic'
              }}>
                All members have submitted at least once. 
              </p>
            ) : (
              members.filter(u => u._count.submissions === 0).map(u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 0', borderBottom: '1px solid rgba(139,115,85,0.1)'
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#8b2020', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontFamily: 'Georgia, serif', fontSize: '13px',
                    flexShrink: 0
                  }}>
                    {u.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '13px' }}>
                      {u.name}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#9e9488' }}>
                      {u.email}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#8b2020' }}>
                    No submissions yet
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MEMBERS
      ══════════════════════════════════════════════════ */}
      {tab === 'members' && (
        <div style={card}>
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: '17px',
            marginBottom: '20px'
          }}>
            All Users — {users.length} total
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Points', 'Submissions', 'Journals', 'Change Role'].map(h => (
                    <th key={h} style={{
                      ...label,
                      padding: '8px 12px',
                      borderBottom: '2px solid rgba(139,115,85,0.2)',
                      textAlign: 'left',
                      whiteSpace: 'nowrap' as const
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(139,115,85,0.1)',
                      fontFamily: 'Georgia, serif', fontSize: '13px'
                    }}>
                      {u.name}
                    </td>
                    <td style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(139,115,85,0.1)',
                      fontFamily: 'monospace', fontSize: '11px', color: '#8b7355'
                    }}>
                      {u.email}
                    </td>
                    <td style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(139,115,85,0.1)'
                    }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '8px',
                        letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                        padding: '3px 8px', borderRadius: '2px',
                        background: u.role === 'ADMIN' ? 'rgba(30,45,74,0.1)'
                          : u.role === 'MENTOR' ? 'rgba(201,151,58,0.1)'
                          : 'rgba(61,107,61,0.1)',
                        color: u.role === 'ADMIN' ? '#1e2d4a'
                          : u.role === 'MENTOR' ? '#a07830'
                          : '#3d6b3d',
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(139,115,85,0.1)',
                      fontFamily: 'monospace', fontSize: '12px',
                      textAlign: 'center' as const
                    }}>
                      {u.totalPoints}
                    </td>
                    <td style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(139,115,85,0.1)',
                      fontFamily: 'monospace', fontSize: '12px',
                      textAlign: 'center' as const
                    }}>
                      {u._count.submissions}
                    </td>
                    <td style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(139,115,85,0.1)',
                      fontFamily: 'monospace', fontSize: '12px',
                      textAlign: 'center' as const
                    }}>
                      {u._count.journals}
                    </td>
                    <td style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(139,115,85,0.1)'
                    }}>
                      <select
                        defaultValue={u.role}
                        onChange={e => changeRole(u.id, e.target.value)}
                        style={{
                          padding: '5px 8px',
                          border: '1px solid rgba(139,115,85,0.25)',
                          borderRadius: '3px', background: '#faf7f2',
                          fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer'
                        }}
                      >
                        <option value="MEMBER">Member</option>
                        <option value="MENTOR">Mentor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TASKS
      ══════════════════════════════════════════════════ */}
      {tab === 'tasks' && (
        <div>
          {/* Create task form */}
          <div style={card}>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: '17px', marginBottom: '20px'
            }}>
              Create New Task
            </div>

            <label style={label}>Task Title *</label>
            <input style={input} type="text"
              placeholder="e.g. Read Chapter 1 of Thinking Fast and Slow"
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
            />

            <label style={label}>Description / Instructions</label>
            <textarea
              style={{ ...input, minHeight: '80px', resize: 'vertical' as const }}
              placeholder="What should members do? Any specific questions to answer?"
              value={newTask.description}
              onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
            />

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            }}>
              <div>
                <label style={label}>Type</label>
                <select style={input} value={newTask.type}
                  onChange={e => setNewTask(p => ({ ...p, type: e.target.value }))}>
                  {['READING','REFLECTION','LECTURE','ESSAY','DISCUSSION'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Due Date *</label>
                <input style={input} type="datetime-local"
                  value={newTask.dueAt}
                  onChange={e => setNewTask(p => ({ ...p, dueAt: e.target.value }))}
                />
              </div>
              <div>
                <label style={label}>Points Value</label>
                <input style={input} type="number"
                  value={newTask.pointsValue}
                  onChange={e => setNewTask(p => ({ ...p, pointsValue: e.target.value }))}
                />
              </div>
            </div>

            <label style={label}>Minimum Word Count (optional)</label>
            <input style={{ ...input, width: '200px' }} type="number"
              placeholder="e.g. 300"
              value={newTask.minWordCount}
              onChange={e => setNewTask(p => ({ ...p, minWordCount: e.target.value }))}
            />

            <label style={label}>Assign To</label>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'Georgia, serif', fontSize: '13px',
                cursor: 'pointer', marginBottom: '10px'
              }}>
                <input type="checkbox" checked={selectAll}
                  onChange={e => {
                    setSelectAll(e.target.checked)
                    setSelectedUsers(e.target.checked
                      ? members.map(u => u.id) : [])
                  }}
                />
                Assign to ALL members ({members.length} members)
              </label>

              {!selectAll && (
                <div style={{
                  maxHeight: '180px', overflowY: 'auto',
                  border: '1px solid rgba(139,115,85,0.2)',
                  borderRadius: '4px', padding: '8px'
                }}>
                  {members.map(u => (
                    <label key={u.id} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontFamily: 'Georgia, serif', fontSize: '12px',
                      padding: '5px', cursor: 'pointer'
                    }}>
                      <input type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={e => {
                          setSelectedUsers(p =>
                            e.target.checked
                              ? [...p, u.id]
                              : p.filter(id => id !== u.id)
                          )
                        }}
                      />
                      {u.name}
                      <span style={{
                        fontFamily: 'monospace', fontSize: '10px', color: '#9e9488'
                      }}>
                        {u.email}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {taskMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '4px', marginBottom: '12px',
                background: taskMsg.startsWith('✓')
                  ? 'rgba(61,107,61,0.1)' : 'rgba(139,32,32,0.08)',
                border: `1px solid ${taskMsg.startsWith('✓')
                  ? 'rgba(61,107,61,0.3)' : 'rgba(139,32,32,0.2)'}`,
                color: taskMsg.startsWith('✓') ? '#3d6b3d' : '#8b2020',
                fontFamily: 'Georgia, serif', fontSize: '13px'
              }}>
                {taskMsg}
              </div>
            )}

            <button onClick={createTask} disabled={creatingTask} style={{
              padding: '11px 28px',
              background: creatingTask ? '#9e9488' : '#1a1714',
              color: '#f5f0e8', border: 'none', borderRadius: '4px',
              fontFamily: 'Georgia, serif', fontSize: '13px',
              cursor: creatingTask ? 'not-allowed' : 'pointer'
            }}>
              {creatingTask ? 'Creating...' : 'Create Task →'}
            </button>
          </div>

          {/* Existing tasks */}
          <div style={card}>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: '17px', marginBottom: '16px'
            }}>
              All Tasks — {tasks.length} total
            </div>
            {tasks.length === 0 ? (
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: '13px',
                color: '#9e9488', fontStyle: 'italic'
              }}>
                No tasks yet. Create one above.
              </p>
            ) : (
              tasks.map(t => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '14px 0', borderBottom: '1px solid rgba(139,115,85,0.1)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontSize: '14px', marginBottom: '4px'
                    }}>
                      {t.title}
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: '9px',
                      color: '#9e9488', letterSpacing: '0.1em'
                    }}>
                      {t.type} · Due {new Date(t.dueAt).toLocaleDateString('en-IN')} · {t.pointsValue} pts
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '11px',
                    color: '#3d6b3d', flexShrink: 0
                  }}>
                    {t._count.submissions} / {t.assignedTo.length} submitted
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          CHAINS
      ══════════════════════════════════════════════════ */}
      {tab === 'chains' && (
        <div>
          {/* Seed chain form */}
          <div style={card}>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: '17px', marginBottom: '20px'
            }}>
              Seed New Knowledge Chain
            </div>

            <label style={label}>Chain Title *</label>
            <input style={input} type="text"
              placeholder="e.g. Is certainty ever epistemically honest?"
              value={newChain.title}
              onChange={e => setNewChain(p => ({ ...p, title: e.target.value }))}
            />

            <label style={label}>Opening Prompt *</label>
            <textarea
              style={{ ...input, minHeight: '100px', resize: 'vertical' as const }}
              placeholder="Write the intellectual provocation that starts the chain..."
              value={newChain.seedPrompt}
              onChange={e => setNewChain(p => ({ ...p, seedPrompt: e.target.value }))}
            />

            <label style={label}>Hours per Link Window</label>
            <input style={{ ...input, width: '120px' }} type="number"
              value={newChain.windowHours}
              onChange={e => setNewChain(p => ({ ...p, windowHours: e.target.value }))}
            />

            {chainMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: '4px', marginBottom: '12px',
                background: chainMsg.startsWith('✓')
                  ? 'rgba(61,107,61,0.1)' : 'rgba(139,32,32,0.08)',
                border: `1px solid ${chainMsg.startsWith('✓')
                  ? 'rgba(61,107,61,0.3)' : 'rgba(139,32,32,0.2)'}`,
                color: chainMsg.startsWith('✓') ? '#3d6b3d' : '#8b2020',
                fontFamily: 'Georgia, serif', fontSize: '13px'
              }}>
                {chainMsg}
              </div>
            )}

            <button onClick={seedChain} disabled={creatingChain} style={{
              padding: '11px 28px',
              background: creatingChain ? '#9e9488' : '#1a1714',
              color: '#f5f0e8', border: 'none', borderRadius: '4px',
              fontFamily: 'Georgia, serif', fontSize: '13px',
              cursor: creatingChain ? 'not-allowed' : 'pointer'
            }}>
              {creatingChain ? 'Seeding...' : 'Seed Chain →'}
            </button>
          </div>

          {/* Existing chains */}
          <div style={card}>
            <div style={{
              fontFamily: 'Georgia, serif', fontSize: '17px', marginBottom: '16px'
            }}>
              All Chains — {chains.length} total
            </div>
            {chains.length === 0 ? (
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: '13px',
                color: '#9e9488', fontStyle: 'italic'
              }}>
                No chains yet. Seed one above.
              </p>
            ) : (
              chains.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '14px 0', borderBottom: '1px solid rgba(139,115,85,0.1)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px'
                    }}>
                      "{c.title}"
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: '9px',
                      color: '#9e9488', marginTop: '3px'
                    }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN')} · {c._count.links} links
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'monospace', fontSize: '9px',
                    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                    padding: '3px 10px', borderRadius: '2px',
                    background: c.status === 'ACTIVE'
                      ? 'rgba(61,107,61,0.1)' : c.status === 'BROKEN'
                      ? 'rgba(139,32,32,0.08)' : 'rgba(139,115,85,0.1)',
                    color: c.status === 'ACTIVE' ? '#3d6b3d'
                      : c.status === 'BROKEN' ? '#8b2020' : '#8b7355',
                    border: `1px solid ${c.status === 'ACTIVE'
                      ? 'rgba(61,107,61,0.25)' : c.status === 'BROKEN'
                      ? 'rgba(139,32,32,0.2)' : 'rgba(139,115,85,0.2)'}`
                  }}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  )
}