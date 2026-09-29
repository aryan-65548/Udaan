import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
} from 'lucide-react';
import type { SupportedLanguage } from '../i18n/translations';
import {
  type ChatMessage,
  SUGGESTED_QUESTION,
  CHAT_UI_LABELS,
  isSupportedQuestion,
  DETAILED_ANSWER_CONTENT,
} from '../data/sahayakChatData';

interface SahayakChatbotProps {
  language?: SupportedLanguage;
}

export const SahayakChatbot: React.FC<SahayakChatbotProps> = ({
  language = 'en',
}) => {
  const labels = CHAT_UI_LABELS[language] || CHAT_UI_LABELS.en;
  const suggestedQ = SUGGESTED_QUESTION[language] || SUGGESTED_QUESTION.en;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: labels.welcomeMessage,
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (questionText?: string) => {
    const textToSend = (questionText || inputText).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const matches = isSupportedQuestion(textToSend);

    // Typing delay: 1.6s for detailed response, 1.2s for unsupported response
    const delay = matches ? 1700 : 1200;

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: matches
          ? (DETAILED_ANSWER_CONTENT[language] || DETAILED_ANSWER_CONTENT.en)
          : labels.unsupportedResponse,
        isDetailedAnswer: matches,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Rich formatted renderer for the structured answer
  const renderFormattedContent = (content: string, isDetailed?: boolean) => {
    if (!isDetailed) {
      return (
        <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
          {content}
        </p>
      );
    }

    // Parse sections and markdown headers from the detailed answer
    const lines = content.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.93rem', lineHeight: 1.65 }}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} style={{ height: '4px' }} />;
          }

          // Main Step Headers: ### STEP 1:...
          if (trimmed.startsWith('### STEP') || trimmed.startsWith('### कदम') || trimmed.startsWith('### પગલું')) {
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(6, 214, 160, 0.12)',
                  borderLeft: '4px solid #06d6a0',
                  padding: '8px 14px',
                  borderRadius: '0 8px 8px 0',
                  marginTop: '10px',
                  marginBottom: '2px',
                }}
              >
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#06d6a0' }}>
                  {trimmed.replace(/^###\s*/, '')}
                </h4>
              </div>
            );
          }

          // Section Header: ### WHAT YOU SHOULD DO TODAY
          if (trimmed.startsWith('### WHAT YOU SHOULD DO TODAY') || trimmed.startsWith('### आज आपको क्या करना चाहिए') || trimmed.startsWith('### આજે તમારે શું કરવું જોઈએ')) {
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  borderLeft: '4px solid #f59e0b',
                  padding: '10px 14px',
                  borderRadius: '0 8px 8px 0',
                  marginTop: '14px',
                }}
              >
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>
                  {trimmed.replace(/^###\s*/, '')}
                </h4>
              </div>
            );
          }

          // Formula Highlight
          if (trimmed.startsWith('**DSCR =') || trimmed.startsWith('DSCR =')) {
            return (
              <div
                key={idx}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  color: '#38bdf8',
                  margin: '4px 0',
                  fontWeight: 700,
                }}
              >
                {trimmed.replace(/\*\*/g, '')}
              </div>
            );
          }

          // Bullet points
          if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
            const itemText = trimmed.replace(/^[•*-]\s*/, '');
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '6px' }}>
                <span style={{ color: '#06d6a0', fontWeight: 800, fontSize: '0.9rem', lineHeight: '1.4' }}>•</span>
                <span
                  style={{ color: '#e2e8f0' }}
                  dangerouslySetInnerHTML={{
                    __html: itemText
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em style="color: #94a3b8;">$1</em>'),
                  }}
                />
              </div>
            );
          }

          // Numbered list items: 1. 2. 3.
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\.\s/)?.[1] || '';
            const rest = trimmed.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingLeft: '4px' }}>
                <span
                  style={{
                    background: '#06d6a0',
                    color: '#0b132b',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {num}
                </span>
                <span
                  style={{ color: '#e2e8f0' }}
                  dangerouslySetInnerHTML={{
                    __html: rest
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em style="color: #94a3b8;">$1</em>'),
                  }}
                />
              </div>
            );
          }

          // Disclaimer / Remember note
          if (trimmed.startsWith('Remember:') || trimmed.startsWith('याद रखें:') || trimmed.startsWith('યાદ રાખો:')) {
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginTop: '12px',
                  fontSize: '0.86rem',
                  color: '#cbd5e1',
                  fontStyle: 'italic',
                }}
              >
                {trimmed}
              </div>
            );
          }

          // Standard paragraph with bold tags parsed
          return (
            <p
              key={idx}
              style={{ margin: 0, color: '#e2e8f0' }}
              dangerouslySetInnerHTML={{
                __html: trimmed
                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em style="color: #94a3b8;">$1</em>'),
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="report-sec-sahayak-chat"
      style={{
        background: 'linear-gradient(145deg, #1c2541 0%, #0b132b 100%)',
        border: '1px solid rgba(6, 214, 160, 0.35)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Glow decorative backgrounds */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(6, 214, 160, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(6, 214, 160, 0.25) 0%, rgba(28, 37, 65, 0.9) 100%)',
              border: '1.5px solid #06d6a0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06d6a0',
              boxShadow: '0 0 16px rgba(6, 214, 160, 0.3)',
            }}
          >
            <Bot size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {labels.title}
              </h3>
              <span
                style={{
                  background: 'rgba(6, 214, 160, 0.15)',
                  border: '1px solid rgba(6, 214, 160, 0.4)',
                  color: '#06d6a0',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#06d6a0',
                    display: 'inline-block',
                  }}
                />
                Live Guide
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
              {labels.subtitle}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '8px' }}>
            Predefined Advisory Demo
          </span>
        </div>
      </div>

      {/* Suggested Question Chip */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={13} color="#06d6a0" />
          <span>{labels.suggestedChipLabel}:</span>
        </div>

        <button
          type="button"
          onClick={() => handleSendMessage(suggestedQ)}
          disabled={isTyping}
          style={{
            background: 'linear-gradient(135deg, rgba(6, 214, 160, 0.12) 0%, rgba(28, 37, 65, 0.6) 100%)',
            border: '1px solid rgba(6, 214, 160, 0.4)',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: isTyping ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'left',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            if (!isTyping) {
              e.currentTarget.style.borderColor = '#06d6a0';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(6, 214, 160, 0.25)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(6, 214, 160, 0.4)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          <Lightbulb size={16} color="#06d6a0" style={{ flexShrink: 0 }} />
          <span>"{suggestedQ}"</span>
        </button>
      </div>

      {/* Messages Stream Container */}
      <div
        style={{
          background: 'rgba(11, 19, 43, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          maxHeight: '520px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: '12px',
                maxWidth: '100%',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isUser ? '#2563eb' : '#06d6a0',
                  color: isUser ? '#ffffff' : '#0b132b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  flexShrink: 0,
                  marginTop: '2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {isUser ? <User size={16} /> : <Bot size={18} />}
              </div>

              {/* Chat Bubble */}
              <div
                style={{
                  maxWidth: isUser ? '80%' : '92%',
                  background: isUser
                    ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'
                    : 'rgba(28, 37, 65, 0.95)',
                  border: isUser
                    ? '1px solid rgba(59, 130, 246, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  padding: isUser ? '12px 16px' : '18px 20px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  color: '#ffffff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: isUser ? '4px' : '8px',
                    borderBottom: !isUser && msg.isDetailedAnswer ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    paddingBottom: !isUser && msg.isDetailedAnswer ? '8px' : 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isUser ? '#93c5fd' : '#06d6a0',
                    }}
                  >
                    {isUser ? 'You' : 'Sahayak Advisor'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{msg.timestamp}</span>
                </div>

                {renderFormattedContent(msg.content, msg.isDetailedAnswer)}
              </div>
            </div>
          );
        })}

        {/* Animated Typing Indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#06d6a0',
                color: '#0b132b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem',
                flexShrink: 0,
              }}
            >
              <Bot size={18} />
            </div>

            <div
              style={{
                background: 'rgba(28, 37, 65, 0.95)',
                border: '1px solid rgba(6, 214, 160, 0.3)',
                borderRadius: '16px 16px 16px 2px',
                padding: '12px 18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#06d6a0',
                    display: 'inline-block',
                    animation: 'pulse 1s infinite alternate',
                  }}
                />
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#06d6a0',
                    display: 'inline-block',
                    animation: 'pulse 1s infinite 0.2s alternate',
                  }}
                />
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#06d6a0',
                    display: 'inline-block',
                    animation: 'pulse 1s infinite 0.4s alternate',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                {labels.typingIndicator}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input row & Action buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={labels.inputPlaceholder}
          disabled={isTyping}
          style={{
            flex: 1,
            background: 'rgba(11, 19, 43, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '12px 18px',
            color: '#ffffff',
            fontSize: '0.92rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#06d6a0')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isTyping}
          style={{
            background: !inputText.trim() || isTyping
              ? 'rgba(255, 255, 255, 0.1)'
              : 'linear-gradient(135deg, #06d6a0 0%, #059669 100%)',
            color: !inputText.trim() || isTyping ? '#64748b' : '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 22px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: !inputText.trim() || isTyping ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: !inputText.trim() || isTyping ? 'none' : '0 4px 14px rgba(6, 214, 160, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>{labels.sendBtn}</span>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
