import { Module } from '@nestjs/common';
import { OrderEventsConsumer } from './order-events.consumer';
import { NotificationService } from './notification.service';

@Module({
  providers: [OrderEventsConsumer, NotificationService],
})
export class OrderEventsModule {}
