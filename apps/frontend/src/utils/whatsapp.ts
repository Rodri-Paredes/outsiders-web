import { CartItem } from '@/store/cartStore';

const WHATSAPP_CBB = '59164884458';
const WHATSAPP_SCZ = '59176978023';

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

export function sendWhatsAppOrder(items: CartItem[], total: number, branchPhone?: string): void {
  const message = generateWhatsAppMessage(items, total);
  const encodedMessage = encodeURIComponent(message);
  const number = branchPhone ?? WHATSAPP_CBB;
  const url = `https://wa.me/${number}?text=${encodedMessage}`;
  
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;
  } else {
    window.open(url, '_blank');
  }
}
