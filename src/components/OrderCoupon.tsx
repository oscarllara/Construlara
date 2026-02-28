"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface OrderCouponProps {
  order: any;
  className?: string;
}

const OrderCoupon = ({ order, className }: OrderCouponProps) => {
  if (!order) return null;

  const today = new Date().toLocaleDateString('pt-BR');
  const items = order.items || [];

  return (
    <div 
      id="printable-coupon" 
      className={cn(
        "bg-white text-black font-mono leading-tight text-[10px] p-4 w-[80mm] mx-auto border border-dashed border-slate-300 print:border-none print:p-0 print:w-full",
        className
      )}
    >
      <div className="text-center space-y-1 mb-4">
        <p className="font-bold text-sm">CONSTRULARA</p>
        <p className="text-[8px]">BTM Comércio de Mat. de Construção</p>
        <p className="text-[8px]">CNPJ: 16.403.481/0001-16</p>
        <p className="text-[8px]">Rio das Mortes - MG</p>
        <div className="border-b border-black border-dashed my-2"></div>
        <p className="font-bold">CUPOM DE PEDIDO: {order.id}</p>
        <p>Data: {order.date || today}</p>
      </div>

      <div className="space-y-1 mb-4">
        <p><strong>CLIENTE:</strong> {order.clientName || 'Consumidor'}</p>
        <p><strong>PAGAMENTO:</strong> {order.paymentMethod}</p>
      </div>

      <div className="border-b border-black border-dashed mb-2"></div>
      
      <table className="w-full text-left mb-4">
        <thead>
          <tr className="border-b border-black border-dotted">
            <th className="py-1">Item</th>
            <th className="py-1 text-right">Qtd</th>
            <th className="py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-black border-dotted">
              <td className="py-1 max-w-[40mm] truncate">{item.name}</td>
              <td className="py-1 text-right">{item.isFractional ? item.totalAmount : item.quantity}</td>
              <td className="py-1 text-right">R$ {((item.promoPrice || item.price) * (item.isFractional ? item.totalAmount : item.quantity)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right space-y-1">
        <p className="text-sm font-bold">TOTAL: R$ {Number(order.total).toFixed(2)}</p>
        {order.paidAmount > 0 && (
          <p className="text-[8px]">Pago: R$ {Number(order.paidAmount).toFixed(2)}</p>
        )}
      </div>

      <div className="border-b border-black border-dashed my-4"></div>

      <div className="text-center space-y-2 mt-4">
        <p className="text-[8px] italic">"Um passo a frente em sua obra!"</p>
        <p className="text-[7px]">Obrigado pela preferência!</p>
      </div>
    </div>
  );
};

export default OrderCoupon;