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
      text: "السلام عليكم ورحمة الله وبركاته\n\nI am your Zakath assistant, trained specifically on Shāfiʿī fiqh from classical texts including Fatḥ al-Muʿīn. Ask me any question about Zakah according to the Shāfiʿī madhhab.",
      source: "Shāfiʿī Fiqh Knowledge Base"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSuggestion = (text) => {
    setInput(text);
  };

  // Function to find relevant answers from knowledge base
  const findRelevantAnswers = (userQuestion) => {
    const questionLower = userQuestion.toLowerCase();
    const matches = [];

    zakathQA.forEach(qa => {
      const relevanceScore = qa.keywords.reduce((score, keyword) => {
        if (questionLower.includes(keyword.toLowerCase())) {
          return score + 1;
        }
        return score;
      }, 0);

      if (relevanceScore > 0) {
        matches.push({ ...qa, relevanceScore });
      }
    });

    // Sort by relevance score (highest first)
    matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return matches.slice(0, 3); // Return top 3 matches
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    setInput("");
    
    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      // First, find relevant answers from knowledge base
      const relevantQAs = findRelevantAnswers(userText);
      
      // Prepare context from knowledge base
      let knowledgeContext = "";
      if (relevantQAs.length > 0) {
        knowledgeContext = "\n\nRELEVANT KNOWLEDGE BASE ENTRIES:\n";
        relevantQAs.forEach((qa, idx) => {
          knowledgeContext += `\n${idx + 1}. ${qa.answer}\nSource: ${qa.source}\n`;
        });
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a specialized Zakah assistant trained exclusively on the Shāfiʿī madhhab (school of Islamic jurisprudence). Your knowledge comes from classical Shāfiʿī fiqh texts, particularly Fatḥ al-Muʿīn and related authoritative sources.

STRICT GUIDELINES:
1. ONLY answer questions related to Zakah (Islamic almsgiving/charity)
2. ONLY provide rulings according to the Shāfiʿī madhhab
3. If asked about other madhāhib (schools), politely state that you specialize in Shāfiʿī fiqh only
4. If asked non-Zakah questions, politely redirect to Zakah topics
5. Always prioritize information from the KNOWLEDGE BASE entries provided
6. When using knowledge base entries, cite the exact source mentioned (e.g., "Fatḥ al-Muʿīn")
7. Be respectful, clear, and concise
8. Use Islamic terminology appropriately (e.g., niṣāb, ḥawl, zakāh)
9. If you don't know a specific ruling, recommend consulting a qualified Shāfiʿī scholar
10. If the question asks about something NOT in the knowledge base and you're unsure, say so honestly

ANSWER STRUCTURE:
- If knowledge base entries are provided, USE THEM as your primary source
- Synthesize information from multiple entries if relevant
- Add clarification or context from your general Shāfiʿī knowledge only if it complements the knowledge base
- Always cite sources properly
- Keep answers focused and practical

CORE KNOWLEDGE AREAS:
- Conditions of Zakah obligation (niṣāb, ḥawl, ownership)
- Zakah on gold, silver, cash, and trade goods
- Zakah calculation methods
- Recipients of Zakah (8 categories)
- Rulings on debts, jewelry, mixed wealth
- Timing of payment and advance payment
- Intentions and conditions for validity

Remember: You represent authentic Shāfiʿī scholarship. Be accurate, humble, and helpful.${knowledgeContext}`,
          messages: [
            { role: "user", content: userText }
          ],
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.content[0].text,
            source: "Fatḥ al-Muʿīn · Shāfiʿī Fiqh"
          }
        ]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. If the issue persists, please consult a qualified Shāfiʿī scholar directly.",
          source: "System Error"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
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
            <p>Shāfiʿī Madhhab · AI-Powered</p>
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
              placeholder="Ask about Zakah in Shāfiʿī fiqh..."
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
            <span className="disclaimer">Answers based on Shāfiʿī fiqh · Always verify with qualified scholars</span>
          </div>
        </div>
      </div>
    </div>
  );
}