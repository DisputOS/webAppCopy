'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { DeleteButton } from '@/components/DeleteButton';
import { ArchiveControls } from '@/components/ArchiveControls';

export function DisputeActionsMenu({
  disputeId,
  isArchived,
}: {
  disputeId: string;
  isArchived: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-800 transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded shadow-lg z-50">
          <div className="px-4 py-2">
            <ArchiveControls disputeId={disputeId} isArchived={isArchived} />
          </div>
          <div className="border-t border-gray-700 px-4 py-2">
            <DeleteButton disputeId={disputeId} />
          </div>
        </div>
      )}
    </div>
  );
}
