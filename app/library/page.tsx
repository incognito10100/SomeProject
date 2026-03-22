import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const items = await prisma.libraryItem.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const categories = [...new Set(items.map(i => i.category))]

  return (
    <div style={{ padding: '40px', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '28px',
          fontWeight: '300',
          color: '#1a1714',
          margin: 0
        }}>
          Knowledge Library
        </h1>

        <p style={{
          fontSize: '13px',
          color: '#9e9488',
          fontStyle: 'italic',
          marginTop: '6px'
        }}>
          {items.length} resources
        </p>
      </div>

      {items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          border: '1px solid rgba(139,115,85,0.2)',
          borderRadius: '6px',
          background: '#f5f0e8'
        }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            fontWeight: '300',
            color: '#1a1714',
            marginBottom: '8px'
          }}>
            Library is empty
          </div>

          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: '#9e9488',
            fontStyle: 'italic'
          }}>
            Your Admin will add books and articles soon.
          </p>
        </div>

      ) : (

        categories.map(cat => (
          <div key={cat} style={{ marginBottom: '36px' }}>

            <div style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#9e9488',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(139,115,85,0.2)'
            }}>
              {cat}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>

              {items
                .filter(i => i.category === cat)
                .map(item => (

                  <a
                    key={item.id}
                    href={item.externalUrl ?? item.fileUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#f5f0e8',
                      border: '1px solid rgba(139,115,85,0.2)',
                      borderRadius: '6px',
                      padding: '20px',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'border-color 0.15s'
                    }}
                  >

                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '8px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#c9973a',
                      marginBottom: '8px'
                    }}>
                      {item.type}
                    </div>

                    <div style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#1a1714',
                      lineHeight: 1.3,
                      marginBottom: '6px'
                    }}>
                      {item.title}
                    </div>

                    {item.author && (
                      <div style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '12px',
                        fontStyle: 'italic',
                        color: '#8b7355'
                      }}>
                        {item.author}
                      </div>
                    )}

                  </a>

                ))}
            </div>
          </div>
        ))

      )}
    </div>
  )
}