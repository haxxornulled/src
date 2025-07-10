interface FieldValidationResultPayload {
  formId: string;
  name: string;
  result: { valid: boolean; message?: string };
}