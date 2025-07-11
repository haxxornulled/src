/**
 * FormValidation Test Suite
 * 
 * Comprehensive tests for the FormValidation system components
 * Uses a simple testing framework for browser compatibility
 */

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

class TestRunner {
  private suites: TestSuite[] = [];

  /**
   * Run a test function and capture results
   */
  private async runTest(name: string, testFn: () => void | Promise<void>): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      await testFn();
      const duration = performance.now() - startTime;
      
      return {
        name,
        passed: true,
        duration
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      return {
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
    }
  }

  /**
   * Define a test suite
   */
  describe(name: string, testSuiteFn: () => void | Promise<void>): void {
    const suite: TestSuite = {
      name,
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      duration: 0
    };

    this.suites.push(suite);
    
    // Store current suite context
    const originalIt = this.it.bind(this);
    this.it = (testName: string, testFn: () => void | Promise<void>) => {
      originalIt(testName, testFn, suite);
    };

    // Run the test suite
    testSuiteFn();
  }

  /**
   * Define a test case
   */
  it(name: string, testFn: () => void | Promise<void>, suite?: TestSuite): void {
    if (!suite) {
      throw new Error('Test must be defined within a describe block');
    }

    suite.totalTests++;
    
    // Run the test asynchronously
    this.runTest(name, testFn).then(result => {
      suite.tests.push(result);
      if (result.passed) {
        suite.passedTests++;
      } else {
        suite.failedTests++;
      }
      suite.duration += result.duration;
    });
  }

  /**
   * Assertion helper
   */
  expect(actual: any) {
    return {
      toBe: (expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      },
      toContain: (expected: any) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toBeGreaterThan: (expected: number) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toThrow: () => {
        try {
          actual();
          throw new Error('Expected function to throw an error');
        } catch (error) {
          // Expected to throw
        }
      }
    };
  }

  /**
   * Run all test suites and report results
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting FormValidation Test Suite...\n');

    for (const suite of this.suites) {
      console.log(`📋 Running suite: ${suite.name}`);
      
      // Wait for all tests in the suite to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      for (const test of suite.tests) {
        const status = test.passed ? '✅' : '❌';
        const duration = test.duration.toFixed(2);
        console.log(`  ${status} ${test.name} (${duration}ms)`);
        
        if (!test.passed && test.error) {
          console.log(`    Error: ${test.error}`);
        }
      }
      
      console.log(`  Summary: ${suite.passedTests}/${suite.totalTests} tests passed\n`);
    }

    // Overall summary
    const totalTests = this.suites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.suites.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = this.suites.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalDuration = this.suites.reduce((sum, suite) => sum + suite.duration, 0);

    console.log('📊 Test Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${totalPassed}`);
    console.log(`  Failed: ${totalFailed}`);
    console.log(`  Duration: ${totalDuration.toFixed(2)}ms`);
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
    }
  }
}

// Global test runner instance
const testRunner = new TestRunner();

// ============================================================================
// VALIDATOR TESTS
// ============================================================================

testRunner.describe('RequiredValidator', () => {
  let validator: any;

  testRunner.it('should validate text fields correctly', () => {
    validator = new (require('../Validators/RequiredFieldValidator').default)();
    
    testRunner.expect(validator.validate('hello', { type: 'required' }).valid).toBe(true);
    testRunner.expect(validator.validate('', { type: 'required' }).valid).toBe(false);
    testRunner.expect(validator.validate('   ', { type: 'required' }).valid).toBe(true); // Non-empty string
  });

  testRunner.it('should validate arrays correctly', () => {
    testRunner.expect(validator.validate(['option1'], { type: 'required' }).valid).toBe(true);
    testRunner.expect(validator.validate([], { type: 'required' }).valid).toBe(false);
    testRunner.expect(validator.validate(['a', 'b', 'c'], { type: 'required' }).valid).toBe(true);
  });

  testRunner.it('should validate booleans correctly', () => {
    testRunner.expect(validator.validate(true, { type: 'required' }).valid).toBe(true);
    testRunner.expect(validator.validate(false, { type: 'required' }).valid).toBe(false);
  });

  testRunner.it('should validate null/undefined correctly', () => {
    testRunner.expect(validator.validate(null, { type: 'required' }).valid).toBe(false);
    testRunner.expect(validator.validate(undefined, { type: 'required' }).valid).toBe(false);
  });

  testRunner.it('should use custom error messages', () => {
    const result = validator.validate('', { 
      type: 'required', 
      message: 'Custom error message' 
    });
    
    testRunner.expect(result.valid).toBe(false);
    testRunner.expect(result.message).toBe('Custom error message');
  });
});

testRunner.describe('EmailValidator', () => {
  let validator: any;

  testRunner.it('should validate email formats correctly', () => {
    validator = new (require('../Validators/EmailValidator').EmailValidator)();
    
    testRunner.expect(validator.validate('test@example.com', { type: 'email' }).valid).toBe(true);
    testRunner.expect(validator.validate('invalid-email', { type: 'email' }).valid).toBe(false);
    testRunner.expect(validator.validate('test@domain.co.uk', { type: 'email' }).valid).toBe(true);
    testRunner.expect(validator.validate('', { type: 'email' }).valid).toBe(false);
  });
});

testRunner.describe('LengthValidators', () => {
  let minLengthValidator: any;
  let maxLengthValidator: any;

  testRunner.it('should validate minimum length correctly', () => {
    minLengthValidator = new (require('../Validators/MinLengthValidator').default)();
    
    testRunner.expect(minLengthValidator.validate('hello', { type: 'minlength', value: 3 }).valid).toBe(true);
    testRunner.expect(minLengthValidator.validate('hi', { type: 'minlength', value: 3 }).valid).toBe(false);
    testRunner.expect(minLengthValidator.validate('', { type: 'minlength', value: 0 }).valid).toBe(true);
  });

  testRunner.it('should validate maximum length correctly', () => {
    maxLengthValidator = new (require('../Validators/MaxLengthValidator').MaxLengthValidator)();
    
    testRunner.expect(maxLengthValidator.validate('hello', { type: 'maxlength', value: 10 }).valid).toBe(true);
    testRunner.expect(maxLengthValidator.validate('very long string', { type: 'maxlength', value: 10 }).valid).toBe(false);
    testRunner.expect(maxLengthValidator.validate('', { type: 'maxlength', value: 5 }).valid).toBe(true);
  });
});

testRunner.describe('PatternValidator', () => {
  let validator: any;
  testRunner.it('should validate matching pattern', () => {
    validator = new (require('../Validators/PatternValidator').PatternValidator)();
    testRunner.expect(validator.validate('abc123', { type: 'pattern', value: '^abc\\d+$' }).valid).toBe(true);
    testRunner.expect(validator.validate('xyz', { type: 'pattern', value: '^abc\\d+$' }).valid).toBe(false);
  });
  testRunner.it('should handle empty pattern', () => {
    validator = new (require('../Validators/PatternValidator').PatternValidator)();
    testRunner.expect(validator.validate('anything', { type: 'pattern', value: '' }).valid).toBe(true);
  });
});

testRunner.describe('MatchValidator', () => {
  let validator: any;
  testRunner.it('should validate matching fields', () => {
    validator = new (require('../Validators/MatchValidator').MatchValidator)();
    const allValues = { password: 'abc123', confirmPassword: 'abc123' };
    testRunner.expect(validator.validate('abc123', { type: 'match', value: 'password' }, allValues).valid).toBe(true);
    testRunner.expect(validator.validate('wrong', { type: 'match', value: 'password' }, allValues).valid).toBe(false);
  });
  testRunner.it('should handle missing field to match', () => {
    validator = new (require('../Validators/MatchValidator').MatchValidator)();
    const allValues = { confirmPassword: 'abc123' };
    const result = validator.validate('abc123', { type: 'match', value: 'password' }, allValues);
    testRunner.expect(result.valid).toBe(false);
    testRunner.expect(result.message).toContain('No field to match');
  });
  testRunner.it('should handle empty rule value', () => {
    validator = new (require('../Validators/MatchValidator').MatchValidator)();
    const allValues = { password: 'abc123', confirmPassword: 'abc123' };
    const result = validator.validate('abc123', { type: 'match', value: '' }, allValues);
    testRunner.expect(result.valid).toBe(false);
  });
});

testRunner.describe('MinCheckedValidator', () => {
  let validator: any;
  testRunner.it('should validate minimum checked', () => {
    validator = new (require('../Validators/MinCheckedValidator').MinCheckedValidator)();
    testRunner.expect(validator.validate(['a', 'b'], { type: 'minchecked', value: 2 }).valid).toBe(true);
    testRunner.expect(validator.validate(['a'], { type: 'minchecked', value: 2 }).valid).toBe(false);
  });
  testRunner.it('should handle empty array', () => {
    validator = new (require('../Validators/MinCheckedValidator').MinCheckedValidator)();
    testRunner.expect(validator.validate([], { type: 'minchecked', value: 1 }).valid).toBe(false);
  });
});

testRunner.describe('MaxCheckedValidator', () => {
  let validator: any;
  testRunner.it('should validate maximum checked', () => {
    validator = new (require('../Validators/MaxCheckedValidator').MaxCheckedValidator)();
    testRunner.expect(validator.validate(['a'], { type: 'maxchecked', value: 2 }).valid).toBe(true);
    testRunner.expect(validator.validate(['a', 'b', 'c'], { type: 'maxchecked', value: 2 }).valid).toBe(false);
  });
  testRunner.it('should handle empty array', () => {
    validator = new (require('../Validators/MaxCheckedValidator').MaxCheckedValidator)();
    testRunner.expect(validator.validate([], { type: 'maxchecked', value: 1 }).valid).toBe(true);
  });
});

testRunner.describe('MinSelectedValidator', () => {
  let validator: any;
  testRunner.it('should validate minimum selected', () => {
    validator = new (require('../Validators/MinSelectedValidator').MinSelectedValidator)();
    testRunner.expect(validator.validate(['a', 'b'], { type: 'minselected', value: 2 }).valid).toBe(true);
    testRunner.expect(validator.validate(['a'], { type: 'minselected', value: 2 }).valid).toBe(false);
  });
  testRunner.it('should handle empty array', () => {
    validator = new (require('../Validators/MinSelectedValidator').MinSelectedValidator)();
    testRunner.expect(validator.validate([], { type: 'minselected', value: 1 }).valid).toBe(false);
  });
});

testRunner.describe('MaxSelectedValidator', () => {
  let validator: any;
  testRunner.it('should validate maximum selected', () => {
    validator = new (require('../Validators/MaxSelectedValidator').MaxSelectedValidator)();
    testRunner.expect(validator.validate(['a'], { type: 'maxselected', value: 2 }).valid).toBe(true);
    testRunner.expect(validator.validate(['a', 'b', 'c'], { type: 'maxselected', value: 2 }).valid).toBe(false);
  });
  testRunner.it('should handle empty array', () => {
    validator = new (require('../Validators/MaxSelectedValidator').MaxSelectedValidator)();
    testRunner.expect(validator.validate([], { type: 'maxselected', value: 1 }).valid).toBe(true);
  });
});

testRunner.describe('RemoteValidator', () => {
  let validator: any;
  testRunner.it('should handle missing transport gracefully', async () => {
    // Simulate missing transport provider
    validator = new (require('../Validators/RemoteValidator').RemoteValidator)(null, null);
    const result = await validator.validate('test', { type: 'remote', value: true });
    testRunner.expect(result.valid).toBe(false);
  });
  // Add more tests for actual HTTP mocking if needed
});

// ============================================================================
// ERROR HANDLER TESTS
// ============================================================================

testRunner.describe('ValidationErrorHandler', () => {
  let errorHandler: any;

  testRunner.it('should create structured errors correctly', () => {
    errorHandler = require('../Utils/ErrorHandler').ValidationErrorHandler.getInstance();
    
    const error = errorHandler.createError(
      'VALIDATION_FAILED',
      'TEST_ERROR',
      'Test error message'
    );
    
    testRunner.expect(error.type).toBe('VALIDATION_FAILED');
    testRunner.expect(error.code).toBe('TEST_ERROR');
    testRunner.expect(error.message).toBe('Test error message');
    testRunner.expect(error.timestamp).toBeTruthy();
  });

  testRunner.it('should handle validation errors with recovery', () => {
    const result = errorHandler.handleValidationError(
      new Error('Test error'),
      'testField',
      'required'
    );
    
    testRunner.expect(result.handled).toBe(true);
    testRunner.expect(result.error).toBeTruthy();
    testRunner.expect(result.fallbackResult).toBeTruthy();
  });
});

// ============================================================================
// JSON SCHEMA PARSER TESTS
// ============================================================================

testRunner.describe('JsonSchemaParser', () => {
  let parser: any;

  testRunner.it('should parse JSON schema to form schema', () => {
    parser = require('../Services/JsonSchemaParser').JsonSchemaParser.getInstance();
    
    const jsonSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          minLength: 5
        },
        password: {
          type: 'string',
          minLength: 8
        }
      },
      required: ['email']
    };
    
    const formSchema = parser.parseJsonSchema(jsonSchema, 'testForm');
    
    testRunner.expect(formSchema.formId).toBe('testForm');
    testRunner.expect(formSchema.fields.length).toBe(2);
    testRunner.expect(formSchema.fields[0].name).toBe('email');
    testRunner.expect(formSchema.fields[0].rules.length).toBeGreaterThan(0);
  });

  testRunner.it('should convert form schema to JSON schema', () => {
    const formSchema = {
      formId: 'testForm',
      fields: [
        {
          name: 'email',
          type: 'email',
          rules: [
            { type: 'required' },
            { type: 'email' }
          ]
        }
      ],
      initialValues: {}
    };
    
    const jsonSchema = parser.toJsonSchema(formSchema);
    
    testRunner.expect(jsonSchema.type).toBe('object');
    testRunner.expect(jsonSchema.properties.email).toBeTruthy();
    testRunner.expect(jsonSchema.required).toContain('email');
  });
});

// ============================================================================
// TYPE GUARD TESTS
// ============================================================================

testRunner.describe('Type Guards', () => {
  testRunner.it('should validate ValidatableElement correctly', () => {
    const { isValidatableElement } = require('../Types');
    
    const input = document.createElement('input');
    const div = document.createElement('div');
    
    testRunner.expect(isValidatableElement(input)).toBe(true);
    testRunner.expect(isValidatableElement(div)).toBe(false);
  });

  testRunner.it('should validate ValidationRule correctly', () => {
    const { isValidValidationRule } = require('../Types');
    
    const validRule = { type: 'required', value: true };
    const invalidRule = { value: true }; // Missing type
    
    testRunner.expect(isValidValidationRule(validRule)).toBe(true);
    testRunner.expect(isValidValidationRule(invalidRule)).toBe(false);
  });
});

// ============================================================================
// RUN TESTS
// ============================================================================

// Run all tests when the script loads
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('DOMContentLoaded', () => {
    testRunner.runAllTests();
  });
} else {
  // Node.js environment
  testRunner.runAllTests();
}

// Export for manual testing
export { testRunner }; 