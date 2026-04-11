'use client';

import { Package, ShoppingCart, Truck, Users } from 'lucide-react';

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock?: number;
  supplier?: {
    name: string;
  };
  onAddToCart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  sku,
  stock,
  supplier,
  onAddToCart,
  onEdit,
  onDelete,
  showActions = false,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
        <Package className="w-16 h-16 text-blue-600" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
          {stock !== undefined && (
            <span className={`text-sm px-2 py-1 rounded ${
              stock > 10 ? 'bg-green-100 text-green-800' :
              stock > 0 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>SKU: {sku}</span>
          {supplier && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {supplier.name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-2xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          
          {showActions ? (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          ) : onAddToCart && (
            <button
              onClick={onAddToCart}
              disabled={stock === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
