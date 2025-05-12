'use client';

import { useState } from 'react';
import { Archive, Undo2 } from 'lucide-react';


export function ArchiveControls({
  disputeId,
  isArchived,
}: {
  disputeId: string;
  isArchived: boolean;
}) {
  const [archived, setArchived] = useState(isArchived);
  const [undoAvailable, setUndoAvailable] = useState(false);

  const handleArchiveToggle = async (toArchive: boolean) => {
    const res = await fetch(
      toArchive ? '/api/disputes/archive' : '/api/disputes/undo-archive',
      {
        method: 'POST',
        body: new URLSearchParams({ dispute_id: disputeId }),
      }
    );

    if (res.ok) {
      setArchived(toArchive);
      setUndoAvailable(!toArchive);
    }
  };

  if (archived) {
    return (
      <button
        onClick={() => handleArchiveToggle(false)}
        className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 transition w-full px-2 py-1"
      >
        <Undo2 className="w-4 h-4" />
        Undo Archive
      </button>
    );
  }

  return (
    <button
      onClick={() => handleArchiveToggle(true)}
      className="flex items-center gap-2 text-sm text-gray-300 hover:text-gray-100 transition w-full px-2 py-1"
    >
      <Archive className="w-4 h-4" />
      Archive
    </button>
  );
}
