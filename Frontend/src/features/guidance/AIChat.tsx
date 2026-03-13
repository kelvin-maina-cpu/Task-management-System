import { useState, useRef, useEffect } from 'react';
import { useSendAIMessageMutation } from './guidanceApi';
import { Send, Bot, User, Code, Lightbulb, AlertCircle, Copy, Check } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  code?: Array<{ language: string; code: string }>;
  confidence?: number;
  timestamp: Date;
}

interface AIChatProps {
  projectId: string;
  currentFile?: string;
}

export const AIChat = ({ projectId, currentFile }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sendMessage] = useSendAIMessageMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await sendMessage({
        projectId,
        query: input,
        currentFile,
      }).unwrap();

      const aiMessage: Message = {
        role: 'assistant',
        content: response.answer,
        code: response.suggestedCode,
        confidence: response.confidence,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderMessage = (msg: Message, idx: number) => {
    switch (msg.role) {
      case 'user':
        return (
          <div key={idx} className="flex items-start gap-3 justify-end">
            <div className="bg-blue-600 text-white rounded-lg p-3 max-w-[80%]">
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            <User className="w-8 h-8 text-gray-400 flex-shrink-0" />
          </div>
        );
      
      case 'assistant':
        return (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div className="bg-white border rounded-lg p-4 max-w-[80%] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-purple-600">AI Mentor</span>
                {msg.confidence !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    msg.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                    msg.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {Math.round(msg.confidence * 100)}% confidence
                  </span>
                )}
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{msg.content}</p>
              </div>
              
              {msg.code && msg.code.length > 0 && msg.code.map((codeBlock, codeIdx) => (
                <div key={codeIdx} className="mt-3 bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <span className="text-xs text-gray-400">{codeBlock.language}</span>
                    <button 
                      onClick={() => copyToClipboard(codeBlock.code, idx * 100 + codeIdx)}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedIndex === idx * 100 + codeIdx ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                      {codeBlock.code}
                    </code>
                  </pre>
                </div>
              ))}
              
              <div className="flex gap-4 mt-3">
                <button 
                  onClick={() => setInput('Explain more about this')}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                >
                  <Lightbulb className="w-4 h-4" />
                  Explain more
                </button>
                <button 
                  onClick={() => setInput('Show me an example')}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                >
                  <Code className="w-4 h-4" />
                  Show example
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div key={idx} className="flex items-center gap-2 justify-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {msg.content}
          </div>
        );
    }
  };

  const suggestions = [
    "Explain this error",
    "Review my code",
    "Suggest architecture",
    "Help me debug"
  ];

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          <span className="font-semibold">AI Coding Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Powered by AI</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">How can I help you today?</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 bg-white border rounded-full text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-sm ml-11">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>AI is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about your code, architecture, or errors..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Tip: Share code snippets for better assistance. Current file: {currentFile || 'None selected'}
        </p>
      </div>
    </div>
  );
};

