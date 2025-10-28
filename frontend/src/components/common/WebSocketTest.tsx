// frontend/src/components/common/WebSocketTest.tsx
import React, { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useParams } from 'react-router-dom'

export function WebSocketTest() {
  const { id } = useParams()
  const { lastMessage } = useWebSocket(id)
  const [messageHistory, setMessageHistory] = useState<any[]>([])

  useEffect(() => {
    console.log('WebSocket Message Received:', lastMessage)
    if (lastMessage) {
      setMessageHistory((prev) => [
        ...prev,
        {
          ...lastMessage,
          receivedAt: new Date().toLocaleTimeString(),
        },
      ])
    }
  }, [lastMessage])

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>     

      <div style={{ marginTop: '20px' }}>
        <h4>📨 WebSocket Messages ({messageHistory.length}):</h4>
        {messageHistory.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No WebSocket messages yet. Send a POST request from Postman.
          </p>
        ) : (
          messageHistory
            .map((msg, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e0e0e0',
                  margin: '10px 0',
                  padding: '10px',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>🕒 {msg.receivedAt}</strong> |
                  <strong> 📧 Event: {msg.type || 'post:created'}</strong>
                </div>
                <pre
                  style={{
                    fontSize: '12px',
                    margin: '5px 0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(msg, null, 2)}
                </pre>
              </div>
            ))
            .reverse()
        )}
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
        }}
      >
        <h4>🔍 Debug Checklist:</h4>
        <ol style={{ textAlign: 'left' }}>
          <li>Send POST request from Postman</li>
          <li>Check server logs for WebSocket emission</li>
          <li>Watch for WebSocket message above</li>
          <li>Verify your main app updates automatically</li>
        </ol>
      </div>
    </div>
  )
}
