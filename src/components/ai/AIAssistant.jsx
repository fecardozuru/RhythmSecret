// /src/components/ai/AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Brain, 
  Music, 
  Volume2,
  Zap,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { geminiService } from '../../services/gemini';
import { useTheme } from '../../constants/themes';

const AIAssistant = ({ 
  currentPattern = null,
  onPatternGenerated = () => {},
  onPatternApplied = () => {},
  compact = false 
}) => {
  const { currentTheme, themeClasses } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'generate', 'analyze'
  const [generationSettings, setGenerationSettings] = useState({
    style: 'funk',
    complexity: 'medium',
    timeSignature: '4/4'
  });
  const messagesEndRef = useRef(null);

  // Inicializar chat
  useEffect(() => {
    initializeChat();
  }, []);

  // Scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      await geminiService.initializeChat();
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: 'Olá! Sou seu assistente musical de IA. Posso ajudar a criar padrões rítmicos, analisar seu groove ou sugerir exercícios. Como posso ajudar?',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.chatWithAssistant(input);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePattern = async () => {
    setIsLoading(true);
    
    try {
      const description = `Padrão ${generationSettings.style} em ${generationSettings.timeSignature} com complexidade ${generationSettings.complexity}`;
      
      const pattern = await geminiService.generateRhythmPattern(
        description,
        generationSettings.timeSignature,
        generationSettings.complexity
      );

      const message = {
        id: Date.now(),
        role: 'assistant',
        content: `Gerei um padrão "${pattern.name}"! ${pattern.description}`,
        timestamp: new Date(),
        pattern: pattern,
        isPattern: true
      };

      setMessages(prev => [...prev, message]);
      onPatternGenerated(pattern);
    } catch (error) {
      console.error('Erro ao gerar padrão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzePattern = async () => {
    if (!currentPattern) return;
    
    setIsLoading(true);
    
    try {
      const analysis = await geminiService.analyzeRhythmPattern(
        currentPattern.volumes || [],
        currentPattern.timeSignature || '4/4',
        currentPattern.bpm || 120
      );

      const message = {
        id: Date.now(),
        role: 'assistant',
        content: `Analisei seu padrão! Pontuação musical: ${analysis.analysis.musicalityScore}/10`,
        timestamp: new Date(),
        analysis: analysis,
        isAnalysis: true
      };

      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Erro ao analisar padrão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPatternToGrid = (pattern) => {
    if (pattern && pattern.volumes) {
      onPatternApplied(pattern.volumes);
      
      const message = {
        id: Date.now(),
        role: 'assistant',
        content: `Padrão "${pattern.name}" aplicado à grade! BPM sugerido: ${pattern.bpmSuggestion}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, message]);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`
          fixed bottom-6 right-6
          w-14 h-14 rounded-full
          flex items-center justify-center
          bg-gradient-to-r from-blue-500 to-purple-500
          shadow-2xl hover:scale-110
          transition-all duration-300
          z-40
        `}
        aria-label="Abrir assistente de IA"
      >
        <Sparkles className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
      </button>
    );
  }

  return (
    <div className={`
      ${isExpanded ? 'fixed inset-4 md:inset-20' : ''}
      ${compact ? 'fixed bottom-24 right-6 w-96' : ''}
      rounded-2xl
      ${themeClasses.surface}
      ${themeClasses.border}
      backdrop-blur-xl
      shadow-2xl
      transition-all duration-300
      z-50
      overflow-hidden
      ${isExpanded ? 'border-2 border-blue-500/30' : ''}
    `}>
      {/* Header */}
      <div className={`
        p-4
        bg-gradient-to-r from-blue-500/20 to-purple-500/20
        border-b ${themeClasses.border}
        flex items-center justify-between
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl
            flex items-center justify-center
            bg-gradient-to-r from-blue-500 to-purple-500
            ${isLoading ? 'animate-pulse' : ''}
          `}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>
          
          <div>
            <h3 className="font-bold text-lg">Assistente Musical IA</h3>
            <p className="text-xs opacity-75">
              Gemini AI • Rhythm Trainer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={isExpanded ? "Minimizar" : "Expandir"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          
          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('chat')}
          className={`
            flex-1 py-3 text-sm font-medium
            transition-colors duration-200
            ${activeTab === 'chat' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'opacity-50 hover:opacity-75'
            }
          `}
        >
          <Brain className="w-4 h-4 inline mr-2" />
          Chat
        </button>
        
        <button
          onClick={() => setActiveTab('generate')}
          className={`
            flex-1 py-3 text-sm font-medium
            transition-colors duration-200
            ${activeTab === 'generate' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'opacity-50 hover:opacity-75'
            }
          `}
        >
          <Music className="w-4 h-4 inline mr-2" />
          Gerar
        </button>
        
        <button
          onClick={handleAnalyzePattern}
          disabled={!currentPattern || isLoading}
          className={`
            flex-1 py-3 text-sm font-medium
            transition-colors duration-200
            ${activeTab === 'analyze' 
              ? 'text-green-400 border-b-2 border-green-400' 
              : 'opacity-50 hover:opacity-75'
            }
            ${(!currentPattern || isLoading) ? 'opacity-30 cursor-not-allowed' : ''}
          `}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Analisar
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col h-[500px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-2xl p-4
                  ${message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-br-none'
                    : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-bl-none'
                  }
                  ${message.isError ? 'border border-red-500/30' : ''}
                  transition-all duration-200
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.role === 'assistant' ? (
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  )}
                  <span className="text-xs opacity-75">
                    {message.role === 'user' ? 'Você' : 'Assistente IA'}
                  </span>
                  <span className="text-xs opacity-50 ml-auto">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {message.pattern && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-purple-300">
                        {message.pattern.name}
                      </h4>
                      <button
                        onClick={() => applyPatternToGrid(message.pattern)}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-medium hover:scale-105 transition-transform"
                      >
                        Aplicar
                      </button>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="opacity-75">BPM:</span>
                        <span className="font-semibold">{message.pattern.bpmSuggestion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-75">Dificuldade:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          message.pattern.difficultyLevel === 'beginner' ? 'bg-green-500/20 text-green-300' :
                          message.pattern.difficultyLevel === 'intermediate' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {message.pattern.difficultyLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {message.analysis && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <h4 className="font-semibold text-green-300 mb-2">Análise do Padrão</h4>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="opacity-75">Complexidade:</span>
                          <span className="font-semibold capitalize">{message.analysis.analysis.complexity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Groove:</span>
                          <span className="font-semibold capitalize">{message.analysis.analysis.grooveType}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="opacity-75">Dificuldade:</span>
                          <span className="font-semibold">{message.analysis.analysis.technicalDifficulty}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-75">Musicalidade:</span>
                          <span className="font-semibold">{message.analysis.analysis.musicalityScore}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    title="Copiar"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {message.role === 'assistant' && !message.isError && (
                    <>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {activeTab === 'chat' ? (
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pergunte sobre ritmo, padrões ou exercícios..."
                className={`
                  flex-1 px-4 py-3 rounded-xl
                  ${themeClasses.surface}
                  ${themeClasses.border}
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-all duration-200
                `}
                disabled={isLoading}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className={`
                  px-4 py-3 rounded-xl
                  bg-gradient-to-r from-blue-500 to-purple-500
                  text-white font-medium
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2
                `}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setInput('Sugira um padrão funk para 4/4')}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-xs hover:scale-105 transition-transform"
              >
                Sugira um padrão
              </button>
              <button
                onClick={() => setInput('Como melhorar minha precisão rítmica?')}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-xs hover:scale-105 transition-transform"
              >
                Dicas de precisão
              </button>
              <button
                onClick={() => setInput('Explique polirritmos')}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-xs hover:scale-105 transition-transform"
              >
                Explicar conceito
              </button>
            </div>
          </div>
        ) : activeTab === 'generate' ? (
          <div className="p-4 border-t border-white/10">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estilo</label>
                <select
                  value={generationSettings.style}
                  onChange={(e) => setGenerationSettings(prev => ({ ...prev, style: e.target.value }))}
                  className={`
                    w-full px-4 py-3 rounded-xl
                    ${themeClasses.surface}
                    ${themeClasses.border}
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-all duration-200
                  `}
                >
                  <option value="rock">Rock</option>
                  <option value="funk">Funk</option>
                  <option value="jazz">Jazz</option>
                  <option value="latin">Latin</option>
                  <option value="electronic">Eletrônico</option>
                  <option value="hiphop">Hip Hop</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Compasso</label>
                  <select
                    value={generationSettings.timeSignature}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, timeSignature: e.target.value }))}
                    className={`
                      w-full px-4 py-3 rounded-xl
                      ${themeClasses.surface}
                      ${themeClasses.border}
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      transition-all duration-200
                    `}
                  >
                    <option value="4/4">4/4</option>
                    <option value="3/4">3/4</option>
                    <option value="6/8">6/8</option>
                    <option value="7/8">7/8</option>
                    <option value="5/4">5/4</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Complexidade</label>
                  <select
                    value={generationSettings.complexity}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, complexity: e.target.value }))}
                    className={`
                      w-full px-4 py-3 rounded-xl
                      ${themeClasses.surface}
                      ${themeClasses.border}
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      transition-all duration-200
                    `}
                  >
                    <option value="beginner">Iniciante</option>
                    <option value="medium">Médio</option>
                    <option value="advanced">Avançado</option>
                    <option value="pro">PRO</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleGeneratePattern}
                disabled={isLoading}
                className={`
                  w-full px-6 py-3 rounded-xl
                  bg-gradient-to-r from-purple-500 to-pink-500
                  text-white font-semibold
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Padrão Personalizado
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between text-xs opacity-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Gemini AI • Rhythm Trainer</span>
          </div>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
