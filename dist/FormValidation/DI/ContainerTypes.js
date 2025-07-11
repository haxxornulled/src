export const ContainerTypes = {
    // MessageBroker
    MessageBroker: Symbol.for("MessageBroker"),
    Subscriber: Symbol.for("Subscriber"),
    MessageFilterRegistry: Symbol.for("MessageFilterRegistry"),
    TransportProviderRegistry: Symbol.for("TransportProviderRegistry"),
    // Transports
    HttpTransportProvider: Symbol.for("HttpTransportProvider"),
    InMemoryTransportProvider: Symbol.for("InMemoryTransportProvider"),
    HttpClientFactory: Symbol.for("HttpClientFactory"),
    // FormValidation Core
    FormValidationService: Symbol.for("FormValidationService"),
    RealTimeValidationService: Symbol.for("RealTimeValidationService"),
    ValidationManager: Symbol.for("ValidationManager"),
    FormValidationMiddleware: Symbol.for("FormValidationMiddleware"),
    FormEventBinder: Symbol.for("FormEventBinder"),
    UIBinder: Symbol.for("UIBinder"),
    // Parsing and Services
    RuleParser: Symbol.for("RuleParser"),
    FormParsingService: Symbol.for("FormParsingService"),
    DynamicFormSchemaService: Symbol.for("DynamicFormSchemaService"),
    ConfigurationService: Symbol.for("ConfigurationService"),
    // Validation
    ValidatorRegistry: Symbol.for("ValidatorRegistry"),
    ValidatorDispatcher: Symbol.for("ValidatorDispatcher"),
    RemoteValidator: Symbol.for("RemoteValidator"),
    // Validators
    RequiredValidator: Symbol.for("RequiredValidator"),
    EmailValidator: Symbol.for("EmailValidator"),
    MinLengthValidator: Symbol.for("MinLengthValidator"),
    MaxLengthValidator: Symbol.for("MaxLengthValidator"),
    PatternValidator: Symbol.for("PatternValidator"),
    MatchValidator: Symbol.for("MatchValidator"),
    MinCheckedValidator: Symbol.for("MinCheckedValidator"),
    MaxCheckedValidator: Symbol.for("MaxCheckedValidator"),
    MinSelectedValidator: Symbol.for("MinSelectedValidator"),
    MaxSelectedValidator: Symbol.for("MaxSelectedValidator"),
    // Components
    EchoLoggerComponent: Symbol.for("EchoLoggerComponent"),
    FormLoggerComponent: Symbol.for("FormLoggerComponent"),
};
export default ContainerTypes;
//# sourceMappingURL=ContainerTypes.js.map