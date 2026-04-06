import { useState } from 'react' // so this one is using state varibles like importing a tool from toolbox
import './App.css' 
import ReactMarkdown from 'react-markdown'

// Converts any raw URLs the LLM forgot to wrap into markdown links.
// The negative lookbehind (?<!\]\() skips URLs already inside [text](url) so we never double-convert.
const convertUrlsToMarkdown = (text) => {
  return text.replace(/(?<!\]\()https?:\/\/[^\s)\]"']+/g, (url) => `[${url}](${url})`)
}

function App() { // a python function that returns UI
  const [question, setQuestion] = useState(' ') // starts as empty string question, then updates
  const [messages, setMessages] = useState([]) // starts as empty list, everytime you type question then it updates, react automatically re-renders the chat bubbles
  const [isDark, setIsDark] = useState(false) // tracks the dark mode, starts as false meaning light mode is one and if the button is toggle then it flips to true
  const [isLoading, setIsLoading] = useState(false) //Tracks whether we're waiting for the API. Starts false. When you hit send it becomes true and the three bouncing dots appear. When the answer comes back it becomes false again and dots disappear.

  const sendMessage = async () => { //The async means this function will do something that takes time (waiting for the API). You need async whenever you use await.
    if (!question.trim()) return //! means "not". So this says — if the question is empty or just spaces, stop here and do nothing. Stops blank messages being sent.

    const userMessage = { role: "user", content: question} //Creating a message object with two things; who sent it , what they said
    const updatedMessages = [...messages, userMessage] //...messages is called a spread operator — it's like saying "copy everything already in messages". Then add the new userMessage at the end. So you get a new list with all old messages plus the new one.
    setMessages(updatedMessages) //update the messages state with the new list. This is what makes your bubble appear on screen instantly
    setQuestion('')//Clear the input box immediately after sending.
    setIsLoading(true)//Turn on the loading state — this makes the three bouncing dots appear while waiting for the API response.

    const response = await fetch('http://localhost:8080/ask', { //fetch is JavaScript's built in tool for making API calls. Think of it like a messenger that goes to your FastAPI and comes back with an answer. await means "wait here until the messenger comes back before moving to the next line." Without await your code would keep running before the response arrives.
      method: 'POST', //Telling fetch to make a POST request
      headers: { 'Content-Type': 'application/json' }, //telling the server "I'm sending you JSON data." Like putting a label on a package so the receiver knows what's inside.
      body: JSON.stringify({
        question: question,
        history: messages
        //This is the actual data being sent. JSON.stringify converts your JavaScript object into a JSON string that can travel over the internet. You're sending two things — the current question and the conversation history.
      })
    })

    const data = await response.json() //The response comes back as raw data. .json() converts it into a JavaScript object you can actually use. await again because this also takes a moment.
    setMessages([...updatedMessages, { role: "assistant", content: data.answer}])
    //Adding the assistant's answer to the messages list. data.answer is the actual text that came back from your FastAPI. This is what makes the response bubble appear on screen.
    setIsLoading(false) //Turn off loading — the three bouncing dots disappear because the answer has arrived.
  }

  return (
    <div className={`page ${isDark ? 'dark' : ''}`}>
      {/* This is a ternary operator — a shorthand if/else. It's saying "if isDark is true, add the class dark, otherwise add nothing." So when dark mode is on, this div gets the class dark and your CSS will use that to change all the colors. */}
      <div className="card">
        <img className="watermark" src="/gustavus-adolphus-college_logo.jpg" alt="" />
        {/* loading Gustavus logo from the public folderas a background */}
        <div className="header">
          <div className="header-top">
            <div>
              <h1 className="header-title">Gustavus Health Assistant</h1>
              <p className="header-sub">Your campus health companion</p>
            </div>
            <button className="toggle-btn" onClick={() => setIsDark(!isDark)}>
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
          <div className="gold-line" />
        </div>

        <div className="status-bar">
          <div className="status-dot" />
          <span className="status-text">Health Services · Mon–Fri, 8:00am – 3:45pm</span>
        </div>

        <div className="messages">
          <div className="msg-row assistant">
            <div className="bubble-row">
              <div className="avatar assistant">G</div>
              <div className="bubble assistant">
                Welcome to Gustavus Health Assistant. How can I support your health today?
              </div>
            </div>
          </div>

          {messages.map((msg, index) => (
            <div key={index} className={`msg-row ${msg.role}`}>
              <div className="bubble-row">
                {msg.role === 'assistant' && <div className="avatar assistant">G</div>}
                <div className={`bubble ${msg.role}`}>
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                      )
                    }}
                  >{convertUrlsToMarkdown(msg.content)}</ReactMarkdown>
                </div>
                {msg.role === 'user' && <div className="avatar user">Y</div>}
              </div>
            </div>
          ))}
          {/* so the message above so show a bubble. If it's from the assistant, show the G avatar on the left. If it's from the user, show the Y avatar on the right. That's what gives you the WhatsApp style layout.  */}
            {/*this one(isLoading) is for only show this if isLoading is true. */}
          {isLoading && ( 
            
            <div className="msg-row assistant">
              <div className="bubble-row">
                <div className="avatar assistant">G</div>
                <div className="typing">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="input-wrap">
          <div className="input-row">
            <input
              className="inp"
              placeholder="Ask a health question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <button className="send-btn" onClick={sendMessage}>
              <svg className="send-icon" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}

export default App



