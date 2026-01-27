// /src/services/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Sua chave da Gemini Studio
const GEMINI_API_KEY = 'AIzaSyDzlm9EAx8z5oy03NFRKZ20C5A9ilgbeA0';
const PROJECT_ID = '280346608489';
const PROJECT_NUMBER = '280346608489';

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Modelos disponíveis
export const GEMINI_MODELS = {
  GEMINI_PRO: 'gemini-pro',
  GEMINI_PRO_VISION: 'gemini-pro-vision'
};

/**
 * Serviço de IA para Rhythm Trainer
 * Recursos inteligentes para músicos
 */
class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: GEMINI_MODELS.GEMINI_PRO,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    this.chat = null;
    this.history = [];
  }

  /**
   * Inicializar chat com contexto musical
   */
  async initializeChat() {
    const systemInstruction = `
      Você é um assistente musical especializado em ritmo, metrônomo e treino musical.
      Você ajuda músicos a:
      1. Criar padrões rítmicos complexos
      2. Sugerir exercícios de subdivisão
      3. Analisar padrões de groove
      4. Explicar conceitos rítmicos
      5. Gerar sequências para prática
      
      Sempre responda em português brasileiro.
      Seja claro, técnico mas acessível.
      Use exemplos práticos.
      Sugira BPMs adequados para cada exercício.
      
      Usuário está usando o Rhythm Trainer, um metrônomo inteligente com:
      - Grade de volumes (1-9 subdivisões)
      - Modos: Iniciante, Avançado, PRO
      - Features: Permutação, Ghost Notes, Gaps
      - Compassos: 4/4, 3/4, 6/8, 7/8, 5/4
    `;

    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }]
        },
        {
          role: "model",
          parts: [{ text: "Entendido! Sou seu assistente musical especializado. Estou pronto para ajudar com ritmo, metrônomo e treino musical. Como posso ajudar você hoje?" }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    return this.chat;
  }

  /**
   * Gerar padrão rítmico baseado em descrição
   */
  async generateRhythmPattern(description, timeSignature = "4/4", complexity = "medium") {
    try {
      const prompt = `
        Gere um padrão rítmico para ${timeSignature} baseado na descrição: "${description}"
        
        Complexidade: ${complexity}
        
        Retorne um objeto JSON com:
        {
          "name": "Nome do padrão",
          "description": "Descrição técnica",
          "timeSignature": "${timeSignature}",
          "bpmSuggestion": número (60-180),
          "subdivisions": número (1-9),
          "volumes": array[9] com valores 0.0-1.0,
          "accentPositions": array com posições acentuadas,
          "practiceTips": array de dicas,
          "difficultyLevel": "beginner" | "intermediate" | "advanced" | "pro"
        }
        
        Exemplo de volumes: [1.0, 0.3, 0.6, 0.2, 0.8, 0.4, 0.5, 0.2, 0.7]
        
        Faça o padrão musicalmente interessante e adequado para prática.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Resposta não contém JSON válido');
    } catch (error) {
      console.error('Erro ao gerar padrão:', error);
      return this.getFallbackPattern(timeSignature, complexity);
    }
  }

  /**
   * Analisar padrão existente e dar feedback
   */
  async analyzeRhythmPattern(volumes, timeSignature, bpm) {
    try {
      const prompt = `
        Analise este padrão rítmico:
        
        Time Signature: ${timeSignature}
        BPM: ${bpm}
        Volumes: ${JSON.stringify(volumes)}
        
        Forneça análise em JSON:
        {
          "analysis": {
            "balance": "balanced" | "left-heavy" | "right-heavy" | "scattered",
            "complexity": "simple" | "moderate" | "complex",
            "grooveType": "straight" | "syncopated" | "polyrhythmic" | "swing",
            "technicalDifficulty": 1-10,
            "musicalityScore": 1-10
          },
          "strengths": array de strings,
          "improvements": array de strings,
          "practiceExercises": array de objetos { "name": string, "description": string, "focus": string },
          "similarPatterns": array de nomes de padrões conhecidos
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Resposta não contém JSON válido');
    } catch (error) {
      console.error('Erro ao analisar padrão:', error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Gerar exercício de prática
   */
  async generatePracticeExercise(focus, duration, level) {
    try {
      const prompt = `
        Crie um exercício de prática de ritmo:
        
        Foco: ${focus}
        Duração: ${duration} minutos
        Nível: ${level}
        
        Retorne JSON:
        {
          "title": "Título do exercício",
          "description": "Descrição detalhada",
          "focusAreas": array de áreas focadas,
          "steps": array de passos,
          "bpmRange": { "start": número, "end": número },
          "timeSignatures": array de compassos,
          "tips": array de dicas,
          "progression": array de como progredir
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Resposta não contém JSON válido');
    } catch (error) {
      console.error('Erro ao gerar exercício:', error);
      return this.getFallbackExercise();
    }
  }

  /**
   * Chat musical com o assistente
   */
  async chatWithAssistant(message) {
    try {
      if (!this.chat) {
        await this.initializeChat();
      }

      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      
      this.history.push({
        role: 'user',
        content: message
      }, {
        role: 'assistant',
        content: response.text()
      });

      // Limitar histórico
      if (this.history.length > 20) {
        this.history = this.history.slice(-20);
      }

      return {
        text: response.text(),
        history: this.history
      };
    } catch (error) {
      console.error('Erro no chat:', error);
      throw error;
    }
  }

  /**
   * Gerar padrões fallback
   */
  getFallbackPattern(timeSignature, complexity) {
    const patterns = {
      "4/4": {
        beginner: {
          name: "Batida Básica Rock",
          description: "Batida simples de rock com backbeat",
          bpmSuggestion: 100,
          subdivisions: 4,
          volumes: [1.0, 0.3, 0.8, 0.3, 0.6, 0.3, 0.8, 0.3, 0.4],
          accentPositions: [1, 3],
          difficultyLevel: "beginner"
        },
        intermediate: {
          name: "Funk Syncopado",
          description: "Padrão funk com síncopes",
          bpmSuggestion: 110,
          subdivisions: 8,
          volumes: [1.0, 0.2, 0.7, 0.3, 0.8, 0.2, 0.6, 0.4, 0.9],
          accentPositions: [1, 3, 5, 7],
          difficultyLevel: "intermediate"
        }
      }
    };

    return patterns[timeSignature]?.[complexity] || patterns["4/4"]["beginner"];
  }

  getFallbackAnalysis() {
    return {
      analysis: {
        balance: "balanced",
        complexity: "moderate",
        grooveType: "straight",
        technicalDifficulty: 5,
        musicalityScore: 6
      },
      strengths: ["Boa estrutura básica", "Clareza rítmica"],
      improvements: ["Adicionar mais variação", "Trabalhar síncopes"],
      practiceExercises: [
        {
          name: "Subdivisão em colcheias",
          description: "Pratique subdividindo cada tempo em colcheias",
          focus: "Precisão rítmica"
        }
      ],
      similarPatterns: ["Basic Rock Beat", "Four-on-the-floor"]
    };
  }

  getFallbackExercise() {
    return {
      title: "Exercício de Subdivisão",
      description: "Pratique subdivisões em diferentes tempos",
      focusAreas: ["Precisão", "Consistência"],
      steps: [
        "Comece com 60 BPM",
        "Toque semicolcheias",
        "Aumente gradualmente o BPM"
      ],
      bpmRange: { start: 60, end: 120 },
      timeSignatures: ["4/4"],
      tips: ["Use metrônomo", "Mantenha relaxado"],
      progression: ["60-80 BPM", "80-100 BPM", "100-120 BPM"]
    };
  }

  /**
   * Limpar histórico
   */
  clearHistory() {
    this.history = [];
    this.chat = null;
  }
}

// Exportar instância única
export const geminiService = new GeminiService();
export default geminiService;
