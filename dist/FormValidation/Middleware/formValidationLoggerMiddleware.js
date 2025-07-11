export function formValidationLoggerMiddleware(label = "FormValidation") {
    return (msg, next) => {
        if (["FormSubmit", "FieldChanged", "FieldBlurred", "FieldValidationResult", "FormSubmitted"].includes(msg.type)) {
            console.log(`[${label} Middleware] Intercepted:`, msg);
        }
        next(msg);
    };
}
//# sourceMappingURL=formValidationLoggerMiddleware.js.map