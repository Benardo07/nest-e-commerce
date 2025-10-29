export type OrderEventType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_completed';

export interface OrderEventPayloadBase {
  orderId: string;
  buyerId: string;
  sellerId: string;
}

export interface OrderPlacedPayload extends OrderEventPayloadBase {
  productId: string;
}

export interface OrderShippedPayload extends OrderEventPayloadBase {
  trackingId: string;
}

export type OrderEventPayloadMap = {
  order_placed: OrderPlacedPayload;
  order_confirmed: OrderEventPayloadBase;
  order_shipped: OrderShippedPayload;
  order_completed: OrderEventPayloadBase;
};

export interface OrderEventEnvelope<
  TEvent extends OrderEventType = OrderEventType,
> {
  eventType: TEvent;
  orderId: string;
  occurredAt: string;
  payload: OrderEventPayloadMap[TEvent];
  version: string;
}

export const ORDER_EVENT_VERSION = '1.0.0';
export const ORDER_EVENT_TYPES: OrderEventType[] = [
  'order_placed',
  'order_confirmed',
  'order_shipped',
  'order_completed',
];
