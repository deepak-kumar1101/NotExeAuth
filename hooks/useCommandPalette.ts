import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { commandPaletteService } from '../services/commandPaletteService';
import { CommandItemData, CommandGroupData, CommandPaletteContextData } from '../types/commandPalette';

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [contextData, setContextData] = useState<CommandPaletteContextData>(
    commandPaletteService.getContextData()
  );

  const navigate = useNavigate();

  // 1. Subscribe to service context updates
  useEffect(() => {
    const unsubscribe = commandPaletteService.subscribe(() => {
      setContextData(commandPaletteService.getContextData());
    });
    return unsubscribe;
  }, []);

  // 2. Debounce Search Query (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 120);
    return () => clearTimeout(timer);
  }, [query]);

  // 3. Compute Search Groups & Flat Items
  const groups: CommandGroupData[] = useMemo(() => {
    return commandPaletteService.searchAndGroupCommands(debouncedQuery, contextData);
  }, [debouncedQuery, contextData]);

  const flatItems: CommandItemData[] = useMemo(() => {
    return groups.flatMap(g => g.items);
  }, [groups]);

  // 4. Reset selected index when query or items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery, flatItems.length]);

  const openPalette = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedIndex(0);
    setIsOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const togglePalette = useCallback(() => {
    if (isOpen) {
      closePalette();
    } else {
      openPalette();
    }
  }, [isOpen, openPalette, closePalette]);

  const executeItem = useCallback(
    async (item: CommandItemData) => {
      if (!item) return;
      closePalette();

      const params = {
        navigate: (path: string) => navigate(path),
        setTab: contextData.actions?.switchTab,
        setApp: contextData.actions?.selectApp,
        openModal: (modalId: string) => {
          if (modalId === 'user' && contextData.actions?.openCreateUserModal) contextData.actions.openCreateUserModal();
          if (modalId === 'license' && contextData.actions?.openCreateLicenseModal) contextData.actions.openCreateLicenseModal();
          if (modalId === 'app' && contextData.actions?.openCreateAppModal) contextData.actions.openCreateAppModal();
          if (modalId === 'reseller' && contextData.actions?.openCreateResellerModal) contextData.actions.openCreateResellerModal();
        }
      };

      try {
        await item.action(params);
      } catch (err) {
        console.error(`Command execution failed [${item.id}]:`, err);
      }
    },
    [closePalette, navigate, contextData]
  );

  // 5. Global Keyboard Listener (Ctrl+K / Cmd+K, ESC, Navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePalette();
        return;
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
        return;
      }

      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        if (flatItems.length > 0) {
          setSelectedIndex(prev => (prev + 1) % flatItems.length);
        }
        return;
      }

      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        if (flatItems.length > 0) {
          setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          executeItem(flatItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, togglePalette, closePalette, flatItems, selectedIndex, executeItem]);

  return {
    isOpen,
    openPalette,
    closePalette,
    togglePalette,
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    groups,
    flatItems,
    executeItem,
    contextData
  };
}
