import { Trash2 } from 'lucide-react';

export function DeleteButton({ disputeId }: { disputeId: string }) {
  const handleDelete = async () => {
    const confirmed = confirm(
      'Are you sure you want to permanently delete this dispute? This action cannot be undone.'
    );
    if (!confirmed) return;

    const res = await fetch('/api/disputes/delete', {
      method: 'POST',
      body: new URLSearchParams({ dispute_id: disputeId }),
    });

    if (res.ok) {
      // Сброс кеша перед редиректом
      localStorage.removeItem('cachedDisputes');
      localStorage.removeItem('disputesLastFetch');
    
      // Перейти обратно к списку
      window.location.href = '/cases';
    
    } else {
      const result = await res.json();
      alert(result.error || 'Failed to delete dispute');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition w-full px-2 py-1"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  );
}
