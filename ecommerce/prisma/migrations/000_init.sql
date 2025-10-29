-- Create enum type for order status lifecycle
CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED'
);

-- Users table
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX "User_createdAt_idx" ON "User" ("createdAt");

-- Products table
CREATE TABLE "Product" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" NUMERIC(12, 2) NOT NULL,
  "stock" INTEGER NOT NULL,
  "sellerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "isArchived" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX "Product_seller_created_idx" ON "Product" ("sellerId", "createdAt" DESC);
CREATE INDEX "Product_isArchived_idx" ON "Product" ("isArchived");

-- Orders table
CREATE TABLE "Order" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "buyerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "sellerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "trackingId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX "Order_buyer_created_idx" ON "Order" ("buyerId", "createdAt" DESC);
CREATE INDEX "Order_seller_created_idx" ON "Order" ("sellerId", "createdAt" DESC);
CREATE INDEX "Order_product_idx" ON "Order" ("productId");
CREATE INDEX "Order_status_idx" ON "Order" ("status");

-- Chat messages
CREATE TABLE "ChatMessage" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "senderId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "receiverId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX "ChatMessage_product_created_idx" ON "ChatMessage" ("productId", "createdAt" DESC);
CREATE INDEX "ChatMessage_sender_created_idx" ON "ChatMessage" ("senderId", "createdAt" DESC);
CREATE INDEX "ChatMessage_receiver_created_idx" ON "ChatMessage" ("receiverId", "createdAt" DESC);

-- Notifications table
CREATE TABLE "Notification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipientId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "orderId" UUID REFERENCES "Order"("id") ON DELETE SET NULL,
  "type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "readAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX "Notification_recipient_created_idx" ON "Notification" ("recipientId", "createdAt" DESC);
CREATE INDEX "Notification_order_idx" ON "Notification" ("orderId");

-- Order timelines
CREATE TABLE "OrderTimelineEntry" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "status" "OrderStatus" NOT NULL,
  "detail" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX "OrderTimelineEntry_order_created_idx" ON "OrderTimelineEntry" ("orderId", "createdAt" DESC);

-- Outbox table for reliable Kafka publishing
CREATE TABLE "OrderEventOutbox" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "occurredAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "processedAt" TIMESTAMP WITH TIME ZONE,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "lockedAt" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX "OrderEventOutbox_processed_idx" ON "OrderEventOutbox" ("processedAt");
CREATE INDEX "OrderEventOutbox_order_idx" ON "OrderEventOutbox" ("orderId");
CREATE INDEX "OrderEventOutbox_type_idx" ON "OrderEventOutbox" ("eventType");
CREATE INDEX "OrderEventOutbox_locked_idx" ON "OrderEventOutbox" ("lockedAt");
