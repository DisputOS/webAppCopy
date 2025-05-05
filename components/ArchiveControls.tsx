'use client';

import { useState } from 'react';

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

  return (
    <div className="mt-6">
      {archived ? (
        <div className="bg-yellow-800 text-yellow-100 p-4 rounded flex justify-between items-center">
          <span>This dispute has been archived.</span>
          {undoAvailable && (
            <button
              onClick={() => handleArchiveToggle(false)}
              className="ml-4 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
            >
              Undo
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => handleArchiveToggle(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Archive Dispute
        </button>
      )}
    </div>
  );
}
