import React from 'react';
import { CommandGroupData, CommandItemData } from '../types/commandPalette';
import { CommandItem } from './CommandItem';

interface CommandGroupProps {
  group: CommandGroupData;
  selectedIndex: number;
  itemIndexOffset: number;
  onSelect: (item: CommandItemData) => void;
  onMouseEnterItem: (globalIndex: number) => void;
}

export const CommandGroup: React.FC<CommandGroupProps> = React.memo(({
  group,
  selectedIndex,
  itemIndexOffset,
  onSelect,
  onMouseEnterItem
}) => {
  if (!group.items || group.items.length === 0) return null;

  return (
    <div role="group" aria-label={group.category} className="space-y-1 py-1.5">
      <div className="px-4 py-1 flex items-center gap-2">
        <span className="text-[10px] font-black uppercase font-mono tracking-widest text-indigo-400/80">
          {group.category}
        </span>
        <div className="flex-1 h-[1px] bg-white/[0.06]" />
      </div>
      <div className="space-y-1">
        {group.items.map((item, idx) => {
          const globalIndex = itemIndexOffset + idx;
          const isSelected = selectedIndex === globalIndex;
          return (
            <CommandItem
              key={item.id}
              item={item}
              isSelected={isSelected}
              onSelect={onSelect}
              onMouseEnter={() => onMouseEnterItem(globalIndex)}
            />
          );
        })}
      </div>
    </div>
  );
});

CommandGroup.displayName = 'CommandGroup';
