import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { stockService } from '../../services/stockService';
import { branchService } from '../../services/branchService';
import { Branch } from '../../lib/types';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Toast from '../ui/Toast';

interface TransferStockModalProps {
  stockItem: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransferStockModal({ stockItem, onClose, onSuccess }: TransferStockModalProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await branchService.getBranches();
      const otherBranches = data.filter((b) => b.id !== stockItem.branch_id);
      setBranches(otherBranches);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetBranchId) {
      Toast.error('Selecciona la sucursal destino');
      return;
    }

    if (quantity <= 0 || quantity > stockItem.quantity) {
      Toast.error('Cantidad inválida');
      return;
    }

    try {
      setLoading(true);
      await stockService.transferStock(
        stockItem.variant_id,
        stockItem.branch_id,
        targetBranchId,
        quantity
      );
      Toast.success('Transferencia realizada');
      onSuccess();
    } catch (error: any) {
      Toast.error(error.message || 'Error al transferir stock');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Transferir Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Producto</p>
            <p className="font-semibold">{stockItem.variant?.product?.name}</p>
            <p className="text-sm">Talla: {stockItem.variant?.size}</p>
            <p className="text-sm text-gray-600 mt-2">
              Stock disponible: <span className="font-bold">{stockItem.quantity}</span>
            </p>
          </div>

          <Select
            label="Sucursal destino"
            options={branchOptions}
            value={targetBranchId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetBranchId(e.target.value)}
            required
          />

          <Input
            label="Cantidad a transferir"
            type="number"
            min="1"
            max={stockItem.quantity}
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(parseInt(e.target.value) || 1)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Transferir
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
