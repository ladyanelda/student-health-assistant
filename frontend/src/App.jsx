import { useState } from 'react'
import './App.css'

function App() {
  // state variables
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])

  // function that sends message to API
  const sendMessage = async () => {
    if (!question.trim()) return 

    const userMessage = { role: "user", content: question }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setQuestion('')

    const response = await fetch('http://localhost:8080/ask', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({
        question: question, 
        history: messages
      })
    })
    const data = await response.json()
    setMessages([...updatedMessages, { role: "assistant", content: data.answer}])
  }

  // what displays on screen
  return (
    <div className="container">
      <h1>Gustavus Health Assistant</h1>
      
      <div className="chat-box">
        {messages.map((msg, index) => ( // this is like a for loop
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { // so the e is a keyboard event; so contains info abt which key was pressed.
            if (e.key === 'Enter' && !e.shiftKey) { // so the e.key to the enter checks if you pressed enter; 
              // the !e.shiftkey means Shift is not being held
              e.preventDefault() // normally enter in an inpust does form submit / adds a new line -- so this stops that default behavior
              sendMessage()
            }
          }}
          placeholder="Ask a health question..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default App