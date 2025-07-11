import { validationErrorHandler } from '../Utils/ErrorHandler';
/**
 * JSON Schema Parser for FormValidation
 * Converts between JSON Schema format and internal validation schemas
 */
export class JsonSchemaParser {
    constructor() { }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!JsonSchemaParser.instance) {
            JsonSchemaParser.instance = new JsonSchemaParser();
        }
        return JsonSchemaParser.instance;
    }
    /**
     * Parse JSON Schema to internal FormSchema format
     */
    parseJsonSchema(jsonSchema, formId) {
        try {
            const fields = [];
            const initialValues = {};
            // Process each property in the JSON schema
            for (const [fieldName, fieldSchema] of Object.entries(jsonSchema.properties)) {
                const field = this.parseFieldSchema(fieldName, fieldSchema);
                fields.push(field);
                // Set initial value based on schema
                initialValues[fieldName] = this.getInitialValue(fieldSchema);
            }
            const formSchema = {
                formId,
                formName: jsonSchema.formConfig?.formName,
                config: jsonSchema.formConfig,
                fields,
                initialValues,
                dependencies: jsonSchema.dependencies
            };
            return formSchema;
        }
        catch (error) {
            const errorResult = validationErrorHandler.handleParserError(error, jsonSchema, formId);
            if (errorResult.fallbackResult) {
                // Return a minimal valid schema as fallback
                return {
                    formId,
                    fields: [],
                    initialValues: {},
                    config: {
                        validateOnBlur: true,
                        validateOnSubmit: true,
                        showErrorsImmediately: true
                    }
                };
            }
            throw error;
        }
    }
    /**
     * Convert internal FormSchema to JSON Schema format
     */
    toJsonSchema(formSchema) {
        const properties = {};
        for (const field of formSchema.fields) {
            properties[field.name] = this.fieldToJsonSchema(field);
        }
        return {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties,
            required: this.extractRequiredFields(formSchema.fields),
            dependencies: formSchema.dependencies,
            formConfig: formSchema.config
        };
    }
    /**
     * Parse HTML form attributes to JSON Schema
     */
    parseHtmlFormToJsonSchema(form) {
        const properties = {};
        const required = [];
        const fields = Array.from(form.elements).filter(element => element instanceof HTMLInputElement ||
            element instanceof HTMLSelectElement ||
            element instanceof HTMLTextAreaElement);
        for (const field of fields) {
            if (!field.name)
                continue;
            const fieldSchema = this.parseHtmlFieldToJsonSchema(field);
            properties[field.name] = fieldSchema;
            // Check if field is required
            if (field.hasAttribute('required') ||
                field.getAttribute('data-rule-required') === 'true') {
                required.push(field.name);
            }
        }
        return {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties,
            required,
            formConfig: {
                validateOnBlur: true,
                validateOnSubmit: true,
                showErrorsImmediately: true
            }
        };
    }
    /**
     * Generate HTML attributes from JSON Schema
     */
    generateHtmlAttributes(fieldSchema) {
        const attributes = {};
        for (const rule of fieldSchema.rules) {
            switch (rule.type) {
                case 'required':
                    attributes['required'] = 'true';
                    break;
                case 'minlength':
                    attributes['data-rule-minlength'] = rule.value?.toString() || '';
                    break;
                case 'maxlength':
                    attributes['data-rule-maxlength'] = rule.value?.toString() || '';
                    break;
                case 'pattern':
                    attributes['data-rule-pattern'] = rule.value?.toString() || '';
                    break;
                case 'email':
                    attributes['data-rule-email'] = 'true';
                    break;
                case 'remote':
                    attributes['data-rule-remote'] = 'true';
                    if (rule.provider) {
                        attributes['data-rule-remote-provider'] = rule.provider;
                    }
                    if (rule.endpoint) {
                        attributes['data-rule-remote-endpoint'] = rule.endpoint;
                    }
                    break;
                default:
                    attributes[`data-rule-${rule.type}`] = rule.value?.toString() || 'true';
            }
        }
        return attributes;
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    /**
     * Parse individual field schema from JSON Schema
     */
    parseFieldSchema(fieldName, fieldSchema) {
        const rules = [];
        // Parse type-based rules
        if (fieldSchema.type) {
            rules.push(...this.parseTypeRules(fieldSchema));
        }
        // Parse format rules
        if (fieldSchema.format) {
            rules.push(...this.parseFormatRules(fieldSchema.format));
        }
        // Parse length rules
        if (fieldSchema.minLength !== undefined) {
            rules.push({
                type: 'minlength',
                value: fieldSchema.minLength,
                message: `Minimum length is ${fieldSchema.minLength} characters`
            });
        }
        if (fieldSchema.maxLength !== undefined) {
            rules.push({
                type: 'maxlength',
                value: fieldSchema.maxLength,
                message: `Maximum length is ${fieldSchema.maxLength} characters`
            });
        }
        // Parse pattern rules
        if (fieldSchema.pattern) {
            rules.push({
                type: 'pattern',
                value: fieldSchema.pattern,
                message: 'Value does not match required pattern'
            });
        }
        // Parse enum rules
        if (fieldSchema.enum) {
            rules.push({
                type: 'enum',
                value: fieldSchema.enum,
                message: `Value must be one of: ${fieldSchema.enum.join(', ')}`
            });
        }
        // Parse custom rules
        if (fieldSchema.custom) {
            rules.push(...this.parseCustomRules(fieldSchema.custom));
        }
        return {
            name: fieldName,
            type: this.mapJsonTypeToFieldType(fieldSchema.type),
            rules,
            label: fieldSchema.properties?.label,
            placeholder: fieldSchema.properties?.placeholder
        };
    }
    /**
     * Parse type-based validation rules
     */
    parseTypeRules(fieldSchema) {
        const rules = [];
        switch (fieldSchema.type) {
            case 'string':
                if (fieldSchema.format === 'email') {
                    rules.push({
                        type: 'email',
                        message: 'Please enter a valid email address'
                    });
                }
                break;
            case 'number':
            case 'integer':
                if (fieldSchema.minimum !== undefined) {
                    rules.push({
                        type: 'min',
                        value: fieldSchema.minimum,
                        message: `Minimum value is ${fieldSchema.minimum}`
                    });
                }
                if (fieldSchema.maximum !== undefined) {
                    rules.push({
                        type: 'max',
                        value: fieldSchema.maximum,
                        message: `Maximum value is ${fieldSchema.maximum}`
                    });
                }
                break;
            case 'boolean':
                // Boolean fields are typically checkboxes
                break;
            case 'array':
                if (fieldSchema.minItems !== undefined) {
                    rules.push({
                        type: 'minselected',
                        value: fieldSchema.minItems,
                        message: `Please select at least ${fieldSchema.minItems} items`
                    });
                }
                if (fieldSchema.maxItems !== undefined) {
                    rules.push({
                        type: 'maxselected',
                        value: fieldSchema.maxItems,
                        message: `Please select no more than ${fieldSchema.maxItems} items`
                    });
                }
                break;
        }
        return rules;
    }
    /**
     * Parse format-based validation rules
     */
    parseFormatRules(format) {
        const rules = [];
        switch (format) {
            case 'email':
                rules.push({
                    type: 'email',
                    message: 'Please enter a valid email address'
                });
                break;
            case 'uri':
            case 'url':
                rules.push({
                    type: 'url',
                    message: 'Please enter a valid URL'
                });
                break;
            case 'date':
                rules.push({
                    type: 'date',
                    message: 'Please enter a valid date'
                });
                break;
            case 'date-time':
                rules.push({
                    type: 'datetime',
                    message: 'Please enter a valid date and time'
                });
                break;
            case 'time':
                rules.push({
                    type: 'time',
                    message: 'Please enter a valid time'
                });
                break;
            case 'phone':
                rules.push({
                    type: 'phone',
                    message: 'Please enter a valid phone number'
                });
                break;
        }
        return rules;
    }
    /**
     * Parse custom validation rules
     */
    parseCustomRules(custom) {
        const rules = [];
        for (const [ruleType, ruleConfig] of Object.entries(custom)) {
            if (typeof ruleConfig === 'object') {
                rules.push({
                    type: ruleType,
                    ...ruleConfig
                });
            }
            else {
                rules.push({
                    type: ruleType,
                    value: ruleConfig
                });
            }
        }
        return rules;
    }
    /**
     * Map JSON Schema types to field types
     */
    mapJsonTypeToFieldType(jsonType) {
        const typeMap = {
            'string': 'text',
            'number': 'number',
            'integer': 'number',
            'boolean': 'checkbox',
            'array': 'select-multiple',
            'object': 'hidden'
        };
        return typeMap[jsonType] || 'text';
    }
    /**
     * Get initial value from field schema
     */
    getInitialValue(fieldSchema) {
        if (fieldSchema.properties?.default !== undefined) {
            return fieldSchema.properties.default;
        }
        // Return appropriate default based on type
        switch (fieldSchema.type) {
            case 'string':
                return '';
            case 'number':
            case 'integer':
                return 0;
            case 'boolean':
                return false;
            case 'array':
                return [];
            case 'object':
                return {};
            default:
                return null;
        }
    }
    /**
     * Extract required fields from field schemas
     */
    extractRequiredFields(fields) {
        return fields
            .filter(field => field.rules.some(rule => rule.type === 'required'))
            .map(field => field.name);
    }
    /**
     * Convert field schema to JSON Schema
     */
    fieldToJsonSchema(field) {
        const jsonSchema = {
            type: this.mapFieldTypeToJsonType(field.type)
        };
        // Convert validation rules to JSON Schema properties
        for (const rule of field.rules) {
            switch (rule.type) {
                case 'minlength':
                    jsonSchema.minLength = rule.value;
                    break;
                case 'maxlength':
                    jsonSchema.maxLength = rule.value;
                    break;
                case 'pattern':
                    jsonSchema.pattern = rule.value;
                    break;
                case 'email':
                    jsonSchema.format = 'email';
                    break;
                case 'url':
                    jsonSchema.format = 'uri';
                    break;
                case 'min':
                    jsonSchema.minimum = rule.value;
                    break;
                case 'max':
                    jsonSchema.maximum = rule.value;
                    break;
                case 'minselected':
                    jsonSchema.minItems = rule.value;
                    break;
                case 'maxselected':
                    jsonSchema.maxItems = rule.value;
                    break;
                default:
                    // Store custom rules in custom property
                    if (!jsonSchema.custom) {
                        jsonSchema.custom = {};
                    }
                    jsonSchema.custom[rule.type] = rule.value;
            }
        }
        // Add field metadata
        if (field.label || field.placeholder) {
            jsonSchema.properties = {
                ...jsonSchema.properties,
                label: field.label,
                placeholder: field.placeholder
            };
        }
        return jsonSchema;
    }
    /**
     * Map field types to JSON Schema types
     */
    mapFieldTypeToJsonType(fieldType) {
        const typeMap = {
            'text': 'string',
            'email': 'string',
            'password': 'string',
            'number': 'number',
            'tel': 'string',
            'url': 'string',
            'checkbox': 'boolean',
            'radio': 'string',
            'select-one': 'string',
            'select-multiple': 'array',
            'textarea': 'string',
            'date': 'string',
            'datetime-local': 'string',
            'time': 'string',
            'file': 'string',
            'hidden': 'string'
        };
        return typeMap[fieldType] || 'string';
    }
    /**
     * Parse HTML field to JSON Schema
     */
    parseHtmlFieldToJsonSchema(field) {
        const jsonSchema = {
            type: this.mapFieldTypeToJsonType(field.type)
        };
        // Parse HTML attributes to JSON Schema properties
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
            if (field.minLength) {
                jsonSchema.minLength = field.minLength;
            }
            if (field.maxLength) {
                jsonSchema.maxLength = field.maxLength;
            }
        }
        if (field instanceof HTMLInputElement) {
            if (field.pattern) {
                jsonSchema.pattern = field.pattern;
            }
        }
        if (field instanceof HTMLInputElement) {
            if (field.type === 'email') {
                jsonSchema.format = 'email';
            }
            if (field.type === 'url') {
                jsonSchema.format = 'uri';
            }
            if (field.type === 'number') {
                if (field.min) {
                    jsonSchema.minimum = parseFloat(field.min);
                }
                if (field.max) {
                    jsonSchema.maximum = parseFloat(field.max);
                }
            }
        }
        // Parse data-rule attributes
        const customRules = {};
        for (let i = 0; i < field.attributes.length; i++) {
            const attr = field.attributes[i];
            if (attr.name.startsWith('data-rule-')) {
                const ruleType = attr.name.replace('data-rule-', '');
                customRules[ruleType] = attr.value;
            }
        }
        if (Object.keys(customRules).length > 0) {
            jsonSchema.custom = customRules;
        }
        return jsonSchema;
    }
}
/**
 * Global JSON Schema parser instance
 */
export const jsonSchemaParser = JsonSchemaParser.getInstance();
//# sourceMappingURL=JsonSchemaParser.js.map