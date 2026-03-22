import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import TaskList from '@/components/TaskList'

export default async function TasksPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = (session.user as any).id
  const role   = (session.user as any).role

  // Admins see all tasks — members see only their assigned tasks
  const tasks = await prisma.task.findMany({
    where: role === 'ADMIN' ? {} : { assignedTo: { has: userId } },
    orderBy: { dueAt: 'asc' },
    include: {
      submissions: {
        where: { userId },
        select: { id: true, submittedAt: true, mentorScore: true }
      }
    }
  })

  return (
    <div style={{ padding: '40px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '28px',
          fontWeight: '300',
          color: '#1a1714'
        }}>
          Tasks
        </h1>
        <p style={{ fontSize: '13px', color: '#9e9488', fontStyle: 'italic', marginTop: '4px' }}>
          {tasks.length} tasks assigned · complete before the deadline
        </p>
      </div>

      {/* TaskList is a client component that handles submission */}
      <TaskList tasks={tasks} userId={userId} userRole={role} />
    </div>
  )
}