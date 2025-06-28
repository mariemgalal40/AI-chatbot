
import { useState } from 'react';
import { Upload, MessageSquare, Sparkles, FileText, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DocumentUploader from '@/components/DocumentUploader';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleDocumentUpload = (success: boolean) => {
    setDocumentUploaded(success);
    setShowChat(success);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-full">
                  <Brain className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Your Smart
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Assistant</span>
              <br />
              is Here
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform any PDF document into an intelligent Q&A experience powered by LLaMA 3. Upload your files and let our AI create 
              interactive questions with highlighted answers for enhanced learning.
            </p>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Easy PDF Upload</h3>
                <p className="text-gray-600">Drag & drop your PDF documents. Our backend processes them using advanced vector embeddings.</p>
              </Card>

              <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">LLaMA 3 Powered</h3>
                <p className="text-gray-600">Powered by LLaMA 3 via Ollama for accurate answers and intelligent document understanding.</p>
              </Card>

              <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Highlighting</h3>
                <p className="text-gray-600">Get precise answers with source document references for better comprehension.</p>
              </Card>
            </div>

            {!showChat && (
              <div className="max-w-2xl mx-auto">
                <DocumentUploader onUpload={handleDocumentUpload} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && documentUploaded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              <FileText className="h-4 w-4 mr-2" />
              Document processed successfully!
            </div>
          </div>
          <ChatInterface />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Smart Assistant. Powered by LLaMA 3 and FastAPI for enhanced learning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
