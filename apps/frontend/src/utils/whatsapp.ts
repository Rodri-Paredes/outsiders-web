import { CartItem } from '@/store/cartStore';

const WHATSAPP_NUMBER = '59178788416'; // Reemplaza con tu número

export function generateWhatsAppMessage(items: CartItem[], total: number): string {
  const header = 'Hola! Quiero hacer el siguiente pedido:\n\n';
  
  const itemsList = items
    .map((item) => {
      const subtotal = item.price * item.quantity;
      return `• ${item.name} (Talla ${item.size}) x${item.quantity} - Bs. ${subtotal.toFixed(2)}`;
    })
    .join('\n');
  
  const footer = `\n\n*Total: Bs. ${total.toFixed(2)}*\n\nGracias!`;
  
  return header + itemsList + footer;
}

export function sendWhatsAppOrder(items: CartItem[], total: number): void {
  const message = generateWhatsAppMessage(items, total);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  window.open(url, '_blank');
}
