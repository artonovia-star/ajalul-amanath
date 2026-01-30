import { useState, useRef, useEffect } from "react";
import "./ChatBot.css";
import zakathQA from "./zakathQA";

export default function ChatBot({ onBack }) {
  const suggestions = [
    "What is the Nisab for Zakah?",
    "How is Zakah calculated on gold?",
    "What are the conditions for Zakah?",
    "Who are the eligible recipients of Zakah?"
  ];

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "السلام عليكم ورحمة الله وبركاته\n\nI am your Zakath assistant, trained specifically on Shafi'ee fiqh from classical texts including Fathul Mueen. Ask me any question about Zakah according to the Shafi'ee madhhab.",
      source: "Shafi'ee Fiqh Knowledge Base"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSuggestion = (text) => {
    setInput(text);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    setInput("");
    
    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);
    // Find matching Q&A
const lowerText = userText.toLowerCase();

const matchedQA = zakathQA.find(item =>
  item.keywords.some(keyword =>
    lowerText.includes(keyword.toLowerCase())
  )
);

const handleSend = async () => {
  if (!input.trim() || isLoading) return;

  const userText = input.trim();
  setInput("");

  setMessages((prev) => [...prev, { role: "user", text: userText }]);
  setIsLoading(true);

  // 👇 OFFLINE Q&A LOGIC (zakathQA)
  // (PASTED CODE IS HERE)
};

setTimeout(() => {
  if (matchedQA) {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: matchedQA.answer,
        source: matchedQA.source
      }
    ]);
  } else {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text:
          "According to the Shafi'ee madhhab, Zakah rulings are considers from classical sources such as fathul mueen. Please ask a clear question related to Zakah. For complex cases, consult a qualified Shafi'ee scholar.",
        source: "Fathul Mueen"
      }
    ]);
  }

  setIsLoading(false);
}, 700);


  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="zakath-chat-container">
      {/* Header */}
      <header className="chat-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>
        
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" 
                    fill="url(#headerGradient)" stroke="currentColor" strokeWidth="1.5"/>
              <defs>
                <linearGradient id="headerGradient" x1="2" y1="2" x2="20" y2="20">
                  <stop offset="0%" stopColor="#2ec4b6"/>
                  <stop offset="100%" stopColor="#1fa89c"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="header-text">
            <h1>Zakath Assistant</h1>
            <p>Shafi'ee Madhhab · AI-Powered</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="messages-container">
        <div className="messages-inner">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className={`message-bubble ${msg.role}`}>
                <div className="message-content">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                {msg.source && (
                  <div className="message-source">{msg.source}</div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endRef} />
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="input-section">
        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="suggestions-container">
            <div className="suggestions-scroll">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="suggestion-chip"
                  onClick={() => handleSuggestion(suggestion)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11l3 3 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="input-bar">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any Zakah Related..."
              rows="1"
              disabled={isLoading}
            />
            <button 
              className="send-button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="input-footer">
            <span className="disclaimer">Answers based on Shafi'ee Madhhab fiqh Kithabs · Always verify with qualified scholars</span>
          </div>
        </div>
      </div>
    </div>
  );
}