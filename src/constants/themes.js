// Configurações de temas visuais para o RhythmSecret

export const THEMES = {
  INSTAGRAM: { 
    id: 'INSTAGRAM', 
    name: 'Insta Vibe', 
    colors: {
      // Background com gradiente vertical
      bg: 'bg-gradient-to-br from-[#2E0B18] via-[#1a050d] to-[#000000]',
      // Texto principal
      text: 'text-white',
      // Cor de destaque (títulos, elementos ativos)
      accent: 'text-[#E1306C]',
      // Barras preenchidas na grade
      barFilled: 'bg-[#E1306C]',
      // Barra ativa (com efeito de glow)
      barActive: 'bg-[#E1306C] shadow-[0_0_20px_rgba(225,48,108,0.9)]',
      // Botões principais
      button: 'bg-[#E1306C] hover:bg-[#C13584] border border-[#E1306C]/50',
      // Display de subdivisão (número)
      subDisplay: 'border-[#E1306C]/50 bg-[#E1306C]/20 text-[#E1306C]',
      // Container principal (painel esquerdo)
      container: 'bg-[#E1306C]/5 border-[#E1306C]/20'
    }
  },
  
  FACEBOOK: { 
    id: 'FACEBOOK', 
    name: 'Face Blue', 
    colors: { 
      bg: 'bg-gradient-to-br from-[#001a35] via-[#18191a] to-[#0a0a0b]', 
      text: 'text-[#e4e6eb]', 
      accent: 'text-[#1877F2]', 
      barFilled: 'bg-[#1877F2]',
      barActive: 'bg-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.9)]', 
      button: 'bg-[#1877F2] hover:bg-[#166fe5] border border-[#1877F2]/50', 
      subDisplay: 'border-[#1877F2]/50 bg-[#1877F2]/20 text-[#1877F2]',
      container: 'bg-[#1877F2]/10 border-[#1877F2]/30'
    }
  },
  
  TIKTOK: {
    id: 'TIKTOK', 
    name: 'Tik Glitch',
    colors: { 
      bg: 'bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#000000]', 
      text: 'text-white', 
      accent: 'text-[#00f2ea]', 
      barFilled: 'bg-[#00f2ea]',
      barActive: 'bg-[#00f2ea] shadow-[0_0_20px_rgba(0,242,234,0.9)]', 
      button: 'bg-[#fe2c55] hover:bg-[#d60043] border border-[#00f2ea]/50', 
      subDisplay: 'border-[#00f2ea]/50 bg-[#00f2ea]/20 text-[#00f2ea]',
      container: 'bg-[#00f2ea]/15 border-[#00f2ea]/40'
    }
  },
  
  PRO_GOLD: {
    id: 'PRO_GOLD',
    name: 'Maestro Gold',
    colors: {
      bg: 'bg-gradient-to-br from-[#1a1500] via-[#000000] to-[#1a1500]',
      text: 'text-[#fff8d6]',
      accent: 'text-[#ffd700]',
      barFilled: 'bg-[#ffd700]',
      barActive: 'bg-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.9)]',
      button: 'bg-[#b8860b] hover:bg-[#daa520] border border-[#ffd700]/60',
      subDisplay: 'border-[#ffd700]/80 bg-[#ffd700]/20 text-[#ffd700]',
      container: 'bg-[#ffd700]/5 border-[#ffd700]/30'
    }
  }
};

// Tema padrão inicial
export const DEFAULT_THEME = THEMES.INSTAGRAM;

// Ícones para cada modo de app (serão importados de lucide-react no componente)
export const APP_MODE_ICONS = {
  BEGINNER: 'GraduationCap',
  ADVANCED: 'Settings',
  PRO: 'Crown'
};

// Classes CSS utilitárias para efeitos visuais
export const VISUAL_EFFECTS = {
  // Efeito de pulso para elementos ativos
  PULSE: 'animate-pulse',
  // Efeito de fade in para menus
  FADE_IN: 'animate-in fade-in',
  // Slide para menus que vêm de cima
  SLIDE_FROM_TOP: 'slide-in-from-top-1',
  // Slide para menus que vêm de baixo
  SLIDE_FROM_BOTTOM: 'slide-in-from-bottom-2',
  // Zoom in para expansão
  ZOOM_IN: 'zoom-in-95',
  // Rotação lenta para ícone de loop
  SLOW_SPIN: 'animate-spin-slow',
  // Máscara de fade para números grandes
  MASK_FADE: 'mask-image-fade'
};

// Configurações de z-index para camadas
export const Z_LAYERS = {
  // Base da aplicação
  BASE: 'z-0',
  // Elementos interativos básicos
  DEFAULT: 'z-10',
  // Painéis e containers
  PANELS: 'z-20',
  // Elementos sobrepostos
  OVERLAY: 'z-30',
  // Backdrop (se necessário)
  BACKDROP: 'z-40',
  // Header e controles superiores
  HEADER: 'z-50',
  // Menus dropdown (MAIS ALTO)
  MENUS: 'z-[100]',
  // Toast/notificações (SOBRE TUDO)
  TOAST: 'z-[100]'
};

// Configurações de transição
export const TRANSITIONS = {
  // Transição padrão para mudanças de estado
  DEFAULT: 'transition-all duration-300',
  // Transição rápida para interações
  FAST: 'transition-all duration-100',
  // Transição lenta para mudanças de tema
  SLOW: 'transition-colors duration-700',
  // Transição para elementos visuais do metrônomo
  VISUAL: 'transition-all duration-500',
  // Transição suave para barras de volume
  BAR: 'transition-all duration-75'
};

// Classes para estados de UI
export const UI_STATES = {
  // Quando UI está travada (em reprodução nos modos avançados)
  LOCKED: 'opacity-40 cursor-not-allowed',
  // Quando UI está disponível
  ACTIVE: 'hover:bg-white/5 cursor-pointer',
  // Estado hover padrão
  HOVER: 'hover:bg-white/10',
  // Estado ativo/selecionado
  SELECTED: 'bg-white/20 text-white shadow-sm',
  // Estado inativo
  INACTIVE: 'opacity-40',
  // Estado desabilitado
  DISABLED: 'opacity-30 pointer-events-none'
};

// Classes específicas para o container principal
export const CONTAINER_CLASSES = {
  // Container principal do app
  MAIN: 'h-screen w-full overflow-hidden font-sans flex flex-col items-center py-2 sm:py-6 px-4 select-none relative',
  // Container do painel esquerdo (grade rítmica)
  LEFT_PANEL: 'flex-[2] flex flex-col items-center justify-between rounded-[2.5rem] p-6 border backdrop-blur-md transition-all relative',
  // Container do painel direito (controles)
  RIGHT_PANEL: 'flex-1 w-full md:max-w-[300px] flex flex-col items-center justify-between gap-4 h-full relative',
  // Container do dial de BPM
  BPM_DIAL: 'relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center shrink-0',
  // Container dos controles inferiores
  BOTTOM_CONTROLS: 'w-full flex justify-between items-center px-4 shrink-0 bg-black/20 p-4 rounded-2xl border border-white/5'
};
