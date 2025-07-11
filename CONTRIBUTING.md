# Contributing to FormValidationV1

Thank you for your interest in contributing to FormValidationV1! This document provides guidelines for contributing.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install dependencies**: `npm install`
4. **Make changes** in a feature branch
5. **Test**: `npx tsc --noEmit` (TypeScript check)
6. **Submit** a pull request

## 📋 Development Guidelines

### Code Style
- **TypeScript**: All code must be TypeScript with strict typing
- **JSDoc**: Document all public classes, interfaces, and methods
- **Dependency Injection**: Use InversifyJS for all service registration
- **Testing**: Add tests for new validators or features

### Architecture Principles
- **HTTP-only**: Remote validation uses HTTP transport only
- **Configuration-driven**: Support runtime config updates
- **Extensible**: Easy to add custom validators and middleware
- **Type-safe**: Strong interfaces and compile-time checking

### Adding New Validators
```typescript
@injectable()
export class CustomValidator implements IValidator {
  name = "custom";
  
  async validate(value: any, rule: IRuleDescriptor): Promise<IValidationResult> {
    // Your validation logic here
    return {
      valid: true,
      isValid: true,
      errorMessage: ""
    };
  }
}
```

### Adding New Features
1. **Update interfaces** if needed
2. **Add to DI container** registration
3. **Update documentation** in `/docs`
4. **Add examples** if applicable
5. **Update tests**

## 🧪 Testing

- **TypeScript compilation**: `npx tsc --noEmit`
- **Manual testing**: Use the demo HTML files
- **Integration testing**: Test with real HTTP endpoints

## 📝 Pull Request Process

1. **Create feature branch** from `main`
2. **Make focused changes** (one feature per PR)
3. **Update documentation** if needed
4. **Test thoroughly** before submitting
5. **Write clear PR description** explaining the changes

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment**: Browser, OS, version
- **Steps to reproduce**: Clear, numbered steps
- **Expected vs actual behavior**
- **Console errors** if any
- **Configuration** being used

## 💡 Feature Requests

For feature requests:
- **Describe the use case** clearly
- **Explain the benefit** to users
- **Consider implementation complexity**
- **Check if it fits the HTTP-only architecture**

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🎯 Areas for Contribution

- **New validators** for common use cases
- **Middleware** for logging, analytics, etc.
- **Documentation** improvements
- **Examples** for specific industries
- **Performance optimizations**
- **Browser compatibility** improvements

Thank you for contributing to FormValidationV1! 🎉 