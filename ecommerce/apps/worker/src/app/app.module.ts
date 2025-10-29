import { Module } from '@nestjs/common';
import { SharedModule } from '@ecommerce/shared';
import { OrderEventsModule } from './order-events/order-events.module';

@Module({
  imports: [SharedModule, OrderEventsModule],
})
export class AppModule {}
