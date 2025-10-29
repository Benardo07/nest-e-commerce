export interface AppConfig {
  app: {
    nodeEnv: string;
    port: number;
    globalPrefix: string;
    allowedOrigins: string[];
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
    ttlSeconds: number;
  };
  kafka: {
    clientId: string;
    brokers: string[];
    orderEventsTopic: string;
    consumerGroupPrefix: string;
  };
  auth: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenTtl: string;
    refreshTokenTtl: string;
  };
  mail: {
    fromAddress: string;
  };
}
