
import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  highlightedText?: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "Hello! I've processed your document and I'm ready to help you explore its content. You can ask me questions about the document, and I'll provide answers with relevant text highlighting. What would you like to know?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // You can change this to your FastAPI backend URL
  const API_BASE_URL = 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sampleQuestions = [
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the important findings?",
    "Are there any recommendations mentioned?"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ask-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Question response:', result);

      const assistantMessage: Message = {
        type: 'assistant',
        content: result.answer || result.response || 'I received your question but got an unexpected response format.',
        highlightedText: result.source_documents ? result.source_documents.join('\n\n') : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Question error:', error);
      
      const errorMessage: Message = {
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please make sure your FastAPI server is running and try again.'
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to the AI backend. Please check if your FastAPI server is running.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    setInputMessage(question);
    // Auto-send the question
    setTimeout(() => {
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      document.dispatchEvent(event);
    }, 100);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Chat Section */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col bg-white/70 backdrop-blur-sm shadow-xl">
          <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm opacity-90">Powered by LLaMA 3 via FastAPI</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.highlightedText && (
                      <div className="mt-3 p-3 bg-yellow-100 border-l-4 border-yellow-400 rounded">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Source from document:</p>
                        <p className="text-sm text-yellow-700 whitespace-pre-wrap">{message.highlightedText}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-6 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question about your document..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="p-6 bg-white/70 backdrop-blur-sm shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Suggested Questions</h3>
          </div>
          <div className="space-y-2">
            {sampleQuestions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full text-left justify-start p-3 h-auto hover:bg-purple-50"
                onClick={() => handleQuestionClick(question)}
              >
                <div className="text-sm text-gray-700">{question}</div>
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white/70 backdrop-blur-sm shadow-xl">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Upload New Document
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
