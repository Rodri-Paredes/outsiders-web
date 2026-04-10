const fs = require('fs');
const code = fs.readFileSync('../frontend/src/components/cart/CartDrawer.tsx', 'utf-8');

const target = `    items.forEach((item, index) => {
      message += \`\\n\${index + 1}. \${item.name}\\n\`;
      message += \`   Talla: \${item.size}\\n\`;
      message += \`   Cantidad: \${item.quantity}\\n\`;
      message += \`   Precio: $\${item.price.toFixed(2)}\\n\`;
      message += \`   Total: $\${(item.price * item.quantity).toFixed(2)}\\n\`;
    });`;

const replace = `    items.forEach((item, index) => {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://outsiders.bo';
      const productLink = \`\${baseUrl}/producto/\${item.productId}\`;
      const imageUrl = item.image_url ? item.image_url : '';

      message += \`\\n\${index + 1}. \${imageUrl ? \`[Imagen: \${imageUrl}]\\n   \` : ''}\${item.name}\\n\`;
      message += \`   Talla: \${item.size}\\n\`;
      message += \`   Cantidad: \${item.quantity}\\n\`;
      message += \`   Precio: Bs \${item.price.toFixed(2)}\\n\`;
      message += \`   Total: Bs \${(item.price * item.quantity).toFixed(2)}\\n\`;
      message += \`   Ver producto: \${productLink}\\n\`;
    });`;

fs.writeFileSync('../frontend/src/components/cart/CartDrawer.tsx', code.replace(target, replace), 'utf-8');
console.log('done fixing cart map');
