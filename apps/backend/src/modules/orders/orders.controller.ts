import { Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Req() req: any) {
    const userId = 'mock-user-id';
    return this.ordersService.createOrder(userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = 'mock-user-id';
    return this.ordersService.findAll(userId);
  }
}
