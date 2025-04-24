import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import Image from 'next/image';

export default function ChatBotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Xin chào! Tôi là trợ lý ảo của CandleBliss. Tôi có thể giúp gì cho bạn hôm nay?' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate API call delay
    try {
      // Gửi đến API của bạn
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.result };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Fallback response if API fails
      const aiMessage = {
        role: 'assistant',
        content: 'Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Vui lòng thử lại sau hoặc liên hệ đội hỗ trợ của chúng tôi.'
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Icon bong bóng */}
      <button
        className="fixed bottom-6 right-6 bg-[#553C26] hover:bg-[#442C08] text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110"
        onClick={() => setIsOpen(true)}
        aria-label="Mở trợ lý ảo"
      >
        <MessageCircle size={24} />
      </button>

      {/* Modal Chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 sm:w-96 h-[480px] bg-white rounded-xl shadow-xl flex flex-col z-50 border border-[#E8E2D9] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#553C26] text-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 relative rounded-full bg-white overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="CandleBliss Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span className="font-medium">Trợ lý CandleBliss</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-[#442C08] p-1 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F1EEE9]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 relative rounded-full bg-white mr-2 flex-shrink-0 overflow-hidden">
                    <Image
                      src="/images/logo.png"
                      alt="CandleBliss"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.role === 'user'
                      ? 'bg-[#DDA15E] text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-6 h-6 relative rounded-full bg-white mr-2 flex-shrink-0 overflow-hidden">
                  <Image
                    src="/images/logo.png"
                    alt="CandleBliss"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#E8E2D9] bg-white flex items-center">
            <input
              type="text"
              className="flex-1 border border-[#E8E2D9] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#DDA15E]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Nhập câu hỏi của bạn..."
              aria-label="Nhập tin nhắn"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`ml-2 rounded-lg text-white p-2.5 ${input.trim() ? 'bg-[#553C26] hover:bg-[#442C08]' : 'bg-[#553C26] opacity-50 cursor-not-allowed'
                } transition-colors`}
              aria-label="Gửi tin nhắn"
            >
              <Send size={18} />
            </button>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-[#F1EEE9] text-xs text-center text-gray-500">
            <p>© CandleBliss - Trợ lý AI đang trong giai đoạn thử nghiệm</p>
          </div>
        </div>
      )}
    </>
  );
}
