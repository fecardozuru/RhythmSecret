// Temas visuais e modos de app — RhythmSecret
import { GraduationCap, Settings, Crown } from 'lucide-react';

export const THEMES = {
  INSTAGRAM: {
    id: 'INSTAGRAM', name: 'Insta Vibe',
    colors: {
      bg: 'bg-gradient-to-br from-[#2E0B18] via-[#1a050d] to-[#000000]',
      text: 'text-white', accent: 'text-[#E1306C]', barFilled: 'bg-[#E1306C]',
      barActive: 'bg-[#E1306C] shadow-[0_0_20px_rgba(225,48,108,0.8)]',
      button: 'bg-[#E1306C] hover:bg-[#C13584] border border-[#E1306C]/50 shadow-[0_0_15px_rgba(225,48,108,0.4)]',
      subDisplay: 'border-[#E1306C]/50 bg-[#E1306C]/20 text-[#E1306C] shadow-[inset_0_0_10px_rgba(225,48,108,0.3)]',
      container: 'bg-[#E1306C]/5 border-[#E1306C]/20 backdrop-blur-md'
    }
  },
  FACEBOOK: {
    id: 'FACEBOOK', name: 'Face Blue',
    colors: {
      bg: 'bg-gradient-to-br from-[#001a35] via-[#18191a] to-[#0a0a0b]',
      text: 'text-[#e4e6eb]', accent: 'text-[#1877F2]', barFilled: 'bg-[#1877F2]',
      barActive: 'bg-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.8)]',
      button: 'bg-[#1877F2] hover:bg-[#166fe5] border border-[#1877F2]/50 shadow-[0_0_15px_rgba(24,119,242,0.4)]',
      subDisplay: 'border-[#1877F2]/50 bg-[#1877F2]/20 text-[#1877F2] shadow-[inset_0_0_10px_rgba(24,119,242,0.3)]',
      container: 'bg-[#1877F2]/10 border-[#1877F2]/30 backdrop-blur-md'
    }
  },
  TIKTOK: {
    id: 'TIKTOK', name: 'Tik Glitch',
    colors: {
      bg: 'bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#000000]',
      text: 'text-white', accent: 'text-[#00f2ea]', barFilled: 'bg-[#00f2ea]',
      barActive: 'bg-[#00f2ea] shadow-[0_0_20px_rgba(0,242,234,0.8)]',
      button: 'bg-[#fe2c55] hover:bg-[#d60043] border border-[#00f2ea]/50 shadow-[0_0_15px_rgba(254,44,85,0.4)]',
      subDisplay: 'border-[#00f2ea]/50 bg-[#00f2ea]/20 text-[#00f2ea] shadow-[inset_0_0_10px_rgba(0,242,234,0.3)]',
      container: 'bg-[#00f2ea]/15 border-[#00f2ea]/40 backdrop-blur-md'
    }
  },
  PRO_GOLD: {
    id: 'PRO_GOLD', name: 'Maestro Gold',
    colors: {
      bg: 'bg-gradient-to-br from-[#1a1500] via-[#000000] to-[#1a1500]',
      text: 'text-[#fff8d6]', accent: 'text-[#ffd700]', barFilled: 'bg-[#ffd700]',
      barActive: 'bg-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.8)]',
      button: 'bg-[#b8860b] hover:bg-[#daa520] border border-[#ffd700]/60 shadow-[0_0_20px_rgba(255,215,0,0.4)]',
      subDisplay: 'border-[#ffd700]/80 bg-[#ffd700]/20 text-[#ffd700] shadow-[inset_0_0_15px_rgba(255,215,0,0.2)]',
      container: 'bg-[#ffd700]/5 border-[#ffd700]/30 backdrop-blur-md'
    }
  }
};

// APP_MODES usa os ícones reais do lucide-react
export const APP_MODES = {
  BEGINNER: { id: 'BEGINNER', label: 'Iniciante',   icon: GraduationCap },
  ADVANCED: { id: 'ADVANCED', label: 'Avançado',    icon: Settings },
  PRO:      { id: 'PRO',      label: 'PRO Maestro', icon: Crown }
};
