const fs = require('fs');
const path = '../frontend/src/components/cart/CartDrawer.tsx';

let content = fs.readFileSync(path, 'utf8');

const regex = /items\.forEach\(\(item, index\) => \{[^\}]+\}\);/s;

const replacement = `items.forEach((item, index) => {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://outsiders.bo';
      const productLink = \`\${baseUrl}/producto/\${item.productId}\`;
      const imageUrl = item.image_url ? item.image_url : 'Sin imagen';

      message += \`\\n\${index + 1}. [Imagen: \${imageUrl}] \${item.name}\\n\`;
      message += \`   Talla: \${item.size}\\n\`;
      message += \`   Cantidad: \${item.quantity}\\n\`;
      message += \`   Precio: Bs \${item.price.toFixed(2)}\\n\`;
      message += \`   Total: Bs \${(item.price * item.quantity).toFixed(2)}\\n\`;
      message += \`   Ver producto: \${productLink}\\n\`;
    });`;

content = content.replace(regex, replacement);

content = content.replace('message += `\\n*Subtotal: $${subtotal.toFixed(2)}*\\n\\n`;', 'message += `\\n*Subtotal: Bs ${subtotal.toFixed(2)}*\\n\\n`;');

fs.writeFileSync(path, content, 'utf8');

console.log('CartDrawer.tsx updated.');
