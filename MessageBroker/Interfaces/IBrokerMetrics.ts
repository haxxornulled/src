interface IBrokerMetrics {
  published: number;
  delivered: number;
  errors: number;
  lastError: any;
  lastPublishTime: number;
}
