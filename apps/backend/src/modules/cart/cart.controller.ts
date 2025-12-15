import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

// In a real app, use @UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    // Mock user ID for demonstration. In real app: req.user.id
    const userId = 'mock-user-id'; 
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = 'mock-user-id';
    return this.cartService.addToCart(userId, dto);
  }

  @Delete('items/:itemId')
  removeFromCart(@Req() req: any, @Param('itemId') itemId: string) {
    const userId = 'mock-user-id';
    return this.cartService.removeFromCart(userId, itemId);
  }
}
