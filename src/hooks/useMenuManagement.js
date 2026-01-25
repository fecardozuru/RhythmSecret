// /src/hooks/useMenuManagement.js

/**
 * Hook para gerenciamento de menus dropdown com clique fora e z-index
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Níveis de z-index para diferentes tipos de menus
const Z_INDEX_LEVELS = {
  THEME_PICKER: 100,
  MODE_SELECTOR: 90,
  TIME_SIG_PICKER: 80,
  BPM_STEP_SELECTOR: 70,
  PRO_FEATURES: 60,
  PRESET_MANAGER: 50,
  LOOP_CONTROL: 40,
  VOLUME_COLUMN: 30,
};

// Estado global para gerenciar qual menu está aberto
let globalMenuState = {
  openMenuId: null,
  zIndexCounter: 1000, // Base z-index que incrementa
};

/**
 * Hook para gerenciar um menu dropdown
 * @param {string} menuId - ID único do menu
 * @param {Object} options - Opções de configuração
 * @returns {Object} Estado e controles do menu
 */
export function useMenuManagement(menuId, options = {}) {
  const {
    initialOpen = false,
    closeOnClickOutside = true,
    closeOnEsc = true,
    autoZIndex = true,
    zIndexLevel = 50,
    onOpen = null,
    onClose = null,
  } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [zIndex, setZIndex] = useState(zIndexLevel);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Fecha o menu quando outro é aberto
  useEffect(() => {
    const handleGlobalMenuChange = () => {
      if (globalMenuState.openMenuId !== menuId && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };

    // Escuta mudanças no estado global
    window.addEventListener('menuStateChange', handleGlobalMenuChange);
    
    return () => {
      window.removeEventListener('menuStateChange', handleGlobalMenuChange);
    };
  }, [isOpen, menuId, onClose]);

  // Gerencia clique fora do menu
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (event) => {
      // Verifica se o clique foi fora do menu e do trigger
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
      const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(event.target);
      
      if (isOutsideMenu && isOutsideTrigger) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, closeOnClickOutside]);

  // Gerencia tecla ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEsc]);

  // Atualiza z-index quando o menu abre
  useEffect(() => {
    if (isOpen && autoZIndex) {
      globalMenuState.zIndexCounter += 10;
      setZIndex(globalMenuState.zIndexCounter);
    }
  }, [isOpen, autoZIndex]);

  const openMenu = useCallback(() => {
    // Fecha menu anterior se houver
    if (globalMenuState.openMenuId && globalMenuState.openMenuId !== menuId) {
      const event = new CustomEvent('menuStateChange');
      window.dispatchEvent(event);
    }
    
    // Atualiza estado global
    globalMenuState.openMenuId = menuId;
    
    setIsOpen(true);
    onOpen?.();
  }, [menuId, onOpen]);

  const closeMenu = useCallback(() => {
    if (globalMenuState.openMenuId === menuId) {
      globalMenuState.openMenuId = null;
    }
    
    setIsOpen(false);
    onClose?.();
  }, [menuId, onClose]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  // Fecha todos os menus (função global)
  const closeAllMenus = useCallback(() => {
    globalMenuState.openMenuId = null;
    globalMenuState.zIndexCounter = 1000;
    
    const event = new CustomEvent('menuStateChange');
    window.dispatchEvent(event);
  }, []);

  // Verifica se este é o menu ativo globalmente
  const isActiveMenu = globalMenuState.openMenuId === menuId;

  return {
    // Estado
    isOpen,
    zIndex,
    isActiveMenu,
    
    // Refs
    menuRef,
    triggerRef,
    
    // Controles
    openMenu,
    closeMenu,
    toggleMenu,
    closeAllMenus,
    
    // Utilitários
    Z_INDEX_LEVELS,
  };
}

/**
 * Hook para gerenciar múltiplos menus com dependências
 * Útil para menus que devem fechar quando outros abrem
 */
export function useMultiMenuManagement(menuConfigs) {
  const [activeMenu, setActiveMenu] = useState(null);
  
  const menus = {};
  
  // Cria gerenciadores para cada menu
  Object.keys(menuConfigs).forEach(menuId => {
    const config = menuConfigs[menuId];
    
    // Hook personalizado para cada menu
    const useMenu = () => {
      const [isOpen, setIsOpen] = useState(false);
      const menuRef = useRef(null);
      const triggerRef = useRef(null);
      
      const open = useCallback(() => {
        setActiveMenu(menuId);
        setIsOpen(true);
        config.onOpen?.();
      }, [menuId, config]);
      
      const close = useCallback(() => {
        if (activeMenu === menuId) {
          setActiveMenu(null);
        }
        setIsOpen(false);
        config.onClose?.();
      }, [menuId, activeMenu, config]);
      
      const toggle = useCallback(() => {
        if (isOpen) {
          close();
        } else {
          open();
        }
      }, [isOpen, open, close]);
      
      // Efeito para clique fora
      useEffect(() => {
        if (!isOpen || !config.closeOnClickOutside) return;
        
        const handleClickOutside = (event) => {
          const isOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
          const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(event.target);
          
          if (isOutsideMenu && isOutsideTrigger) {
            close();
          }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }, [isOpen, config.closeOnClickOutside, close]);
      
      // Efeito para ESC
      useEffect(() => {
        if (!isOpen || !config.closeOnEsc) return;
        
        const handleEscape = (event) => {
          if (event.key === 'Escape') {
            close();
          }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }, [isOpen, config.closeOnEsc, close]);
      
      return {
        isOpen,
        menuRef,
        triggerRef,
        open,
        close,
        toggle,
      };
    };
    
    menus[menuId] = useMenu;
  });
  
  // Fecha todos os menus
  const closeAllMenus = useCallback(() => {
    setActiveMenu(null);
    // Dispara evento para que cada menu se feche
    const event = new CustomEvent('closeAllMenus');
    window.dispatchEvent(event);
  }, []);
  
  return {
    activeMenu,
    menus,
    closeAllMenus,
  };
}

/**
 * Hook para criar um overlay quando qualquer menu está aberto
 * Útil para escurecer o fundo
 */
export function useMenuOverlay() {
  const [showOverlay, setShowOverlay] = useState(false);
  
  useEffect(() => {
    const handleMenuStateChange = () => {
      setShowOverlay(globalMenuState.openMenuId !== null);
    };
    
    window.addEventListener('menuStateChange', handleMenuStateChange);
    
    return () => {
      window.removeEventListener('menuStateChange', handleMenuStateChange);
    };
  }, []);
  
  const closeAllMenus = useCallback(() => {
    globalMenuState.openMenuId = null;
    const event = new CustomEvent('menuStateChange');
    window.dispatchEvent(event);
  }, []);
  
  return {
    showOverlay,
    closeAllMenus,
  };
}

/**
 * Componente de overlay para menus
 * Pode ser usado para escurecer o fundo quando um menu está aberto
 */
export function MenuOverlay({ onClick, zIndex = 40 }) {
  const { showOverlay } = useMenuOverlay();
  
  if (!showOverlay) return null;
  
  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
      style={{ zIndex }}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

/**
 * Utilitário para calcular posição de dropdown
 * Garante que o menu não saia da tela
 */
export function calculateDropdownPosition(triggerRect, menuWidth = 200, menuHeight = 300) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const positions = {
    top: triggerRect.top - menuHeight - 8,
    bottom: triggerRect.bottom + 8,
    left: triggerRect.left,
    right: triggerRect.right - menuWidth,
  };
  
  // Decide se posiciona acima ou abaixo
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  
  const verticalPosition = spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? 'bottom' : 'top';
  const verticalValue = positions[verticalPosition];
  
  // Decide se posiciona à esquerda ou direita
  const spaceRight = viewportWidth - triggerRect.left;
  const spaceLeft = triggerRect.right;
  
  let horizontalPosition = 'left';
  let horizontalValue = positions.left;
  
  if (spaceRight < menuWidth && spaceLeft >= spaceRight) {
    horizontalPosition = 'right';
    horizontalValue = positions.right;
  }
  
  // Ajusta para não sair da tela
  const finalLeft = Math.max(8, Math.min(horizontalValue, viewportWidth - menuWidth - 8));
  const finalTop = Math.max(8, Math.min(verticalValue, viewportHeight - menuHeight - 8));
  
  return {
    position: `${verticalPosition}-${horizontalPosition}`,
    top: finalTop,
    left: finalLeft,
    transformOrigin: `${horizontalPosition} ${verticalPosition}`,
  };
}

/**
 * Hook para dropdown posicionado dinamicamente
 */
export function usePositionedDropdown(menuId, options = {}) {
  const menu = useMenuManagement(menuId, options);
  const [position, setPosition] = useState({ top: 0, left: 0, transformOrigin: 'left bottom' });
  
  const updatePosition = useCallback(() => {
    if (!menu.triggerRef.current || !menu.isOpen) return;
    
    const triggerRect = menu.triggerRef.current.getBoundingClientRect();
    const calculated = calculateDropdownPosition(
      triggerRect,
      options.menuWidth,
      options.menuHeight
    );
    
    setPosition(calculated);
  }, [menu.isOpen, menu.triggerRef, options.menuWidth, options.menuHeight]);
  
  // Atualiza posição quando o menu abre
  useEffect(() => {
    if (menu.isOpen) {
      updatePosition();
      
      // Atualiza em redimensionamento
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [menu.isOpen, updatePosition]);
  
  return {
    ...menu,
    position,
    updatePosition,
  };
}

export default {
  useMenuManagement,
  useMultiMenuManagement,
  useMenuOverlay,
  usePositionedDropdown,
  MenuOverlay,
  calculateDropdownPosition,
  Z_INDEX_LEVELS,
};
