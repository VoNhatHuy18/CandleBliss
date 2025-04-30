import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  url: string;
  description?: string;
  rating: number; // Thêm trường rating
  hasRating?: boolean; // Thêm flag để biết có đánh giá thực sự hay không
};

// Cập nhật component StarDisplay
const StarDisplay = ({ rating, showText = false }: { rating: number, showText?: boolean }) => {
  // Nếu rating là 0, hiển thị khác
  if (rating === 0) {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 text-gray-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {showText && <span className="ml-1 text-xs text-gray-500">Chưa có đánh giá</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {showText && rating > 0 && <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>}
    </div>
  );
};

export default function ChatBotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý ảo của CandleBliss. Tôi có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi tôi về sản phẩm nến thơm nhé!' }
  ]);
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

  // Format giá theo định dạng VND
  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      // Kiểm tra nếu có thông tin sản phẩm trả về
      const aiMessage: Message = {
        role: 'assistant',
        content: data.result,
        products: data.products
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      // Fallback response if API fails
      const aiMessage: Message = {
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
        <div className="fixed bottom-20 right-6 w-80 sm:w-96 lg:w-[500px] h-[600px] bg-white rounded-xl shadow-xl flex flex-col z-50 border border-[#E8E2D9] overflow-hidden">
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
              <div key={idx} className="flex flex-col">
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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

                {/* Hiển thị sản phẩm nếu có - Được thiết kế giống như ProductCard ở trang Products */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="text-xs text-gray-500 col-span-full mb-1">Sản phẩm tìm thấy:</div>
                    {msg.products.map((product) => (
                      <Link
                        key={product.id}
                        href={product.url}
                        className="block bg-white rounded-lg border border-[#E8E2D9] hover:shadow-md transition-shadow overflow-hidden"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="relative aspect-square overflow-hidden group">
                          <Image
                            src={product.image || '/images/product-placeholder.png'}
                            alt={product.name}
                            height={150}
                            width={150}
                            className="h-full w-full object-cover transition-all duration-300 group-hover:blur-sm"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="bg-white/90 hover:bg-white text-gray-800 px-3 py-1.5 text-sm rounded-full flex items-center gap-1 transition-colors duration-200 border border-black">
                              <Eye className="w-3 h-3" />
                              <span>Xem chi tiết</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-2">
                          <h3 className="text-xs font-medium text-gray-700 mb-0.5 truncate">{product.name}</h3>
                          <div className="flex items-center mb-1">
                            <StarDisplay rating={product.rating} showText={true} />
                          </div>
                          <div>
                            <span className="text-red-600 text-xs font-medium">{formatPrice(product.price)}đ</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
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
              placeholder="Nhập câu hỏi hoặc tìm sản phẩm..."
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
            <p>© CandleBliss - Trợ lý AI có thể tìm kiếm sản phẩm giúp bạn</p>
          </div>
        </div>
      )}
    </>
  );
}
