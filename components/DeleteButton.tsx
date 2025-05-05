'use client';

export function DeleteButton({ disputeId }: { disputeId: string }) {
  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to permanently delete this dispute? This action cannot be undone.');
    if (!confirmed) return;

    const res = await fetch('/api/disputes/delete', {
      method: 'POST',
      body: new URLSearchParams({ dispute_id: disputeId }),
    });

    if (res.ok) {
      window.location.href = '/cases';
    } else {
      alert('Failed to delete dispute');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
    >
      Delete Dispute
    </button>
  );
}
