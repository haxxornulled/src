interface StatusOrErrorPayload {
  field: string;
  message: string;
  level?: "info" | "success" | "error";
}