import { Product } from '../lib/database.types'

const MOCK_PRODUCTS: any[] = [
  {
    id: '1',
    name: 'Star Boxy Tee White',
    description: 'Heavyweight 100% cotton boxy tee. Oversized fit.',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=750&fit=crop',
    category: 'Camisetas',
    is_visible: true,
    stock: 20,
    hasStock: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Valentine\'s Tee Black',
    description: 'Special edition graphic tee in premium cotton.',
    price: 50,
    image_url: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=750&fit=crop',
    category: 'Camisetas',
    is_visible: true,
    stock: 15,
    hasStock: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Ice Cube Tee White',
    description: 'Relaxed fit printed tee with custom artwork.',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop',
    category: 'Camisetas',
    is_visible: true,
    stock: 50,
    hasStock: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'A New Star Hoodie Black',
    description: 'Heavyweight french terry zip hoodie.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop',
    category: 'Sudaderas',
    is_visible: true,
    stock: 10,
    hasStock: true,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'A New Star Hoodie Light Grey',
    description: 'Heavyweight french terry hoodie. Everyday essential.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=750&fit=crop',
    category: 'Sudaderas',
    is_visible: true,
    stock: 0,
    hasStock: false,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'A New Star Joggers Black',
    description: 'Relaxed fit joggers with embroidery detail.',
    price: 100,
    image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop',
    category: 'Pantalones',
    is_visible: true,
    stock: 25,
    hasStock: true,
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'A New Star Joggers Light Grey',
    description: 'Relaxed fit joggers with embroidery detail.',
    price: 100,
    image_url: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=600&h=750&fit=crop',
    category: 'Pantalones',
    is_visible: true,
    stock: 30,
    hasStock: true,
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Star Boxy Tee Navy',
    description: 'Heavyweight 100% cotton boxy tee. Oversized fit.',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1623876229339-0df13d6a0027?w=600&h=750&fit=crop',
    category: 'Camisetas',
    is_visible: true,
    stock: 5,
    hasStock: true,
    created_at: new Date().toISOString()
  }
]

export const productsService = {
  async getProducts(): Promise<Product[]> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PRODUCTS;
  },

  async getAll(): Promise<Product[]> {
    return this.getProducts();
  },

  async getById(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    return product || null;
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    throw new Error("Mock service: Cannot create products");
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    throw new Error("Mock service: Cannot update products");
  },

  async delete(id: string): Promise<void> {
    throw new Error("Mock service: Cannot delete products");
  }
}
