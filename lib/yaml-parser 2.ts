import * as yaml from 'js-yaml';
import { TestSuite, TestStep } from './yaml-generator';

/**
 * YAML məzmununu TestSuite obyektinə çevirir
 * Bu funksiya YAML-dan form state-inə dönüşdürmək üçün istifadə olunur
 */
export function parseYamlToSuite(yamlContent: string): TestSuite {
  try {
    const parsed = yaml.load(yamlContent) as any;

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Yanlış YAML formatı');
    }

    const suite: TestSuite = {
      env: {},
      variables: {},
      tests: [],
    };

    // Parse env
    if (parsed.env && typeof parsed.env === 'object') {
      suite.env = parsed.env;
    }

    // Parse variables
    if (parsed.variables && typeof parsed.variables === 'object') {
      suite.variables = parsed.variables;
    }

    // Parse execution config
    if (parsed.execution) {
      suite.execution = parsed.execution;
    }

    // Parse tests
    if (Array.isArray(parsed.tests)) {
      suite.tests = parsed.tests.map((test: any) => parseTestStep(test));
    }

    return suite;
  } catch (error) {
    console.error('YAML parse xətası:', error);
    throw new Error('YAML parse edilə bilmədi');
  }
}

/**
 * Tək bir test step-i parse edir
 */
function parseTestStep(stepData: any): TestStep {
  const step: TestStep = {
    name: stepData.name || 'Unnamed Step',
    type: stepData.type || 'REST',
  };

  // Optional fields
  if (stepData.id) step.id = stepData.id;
  if (stepData.dependsOn) step.dependsOn = stepData.dependsOn;
  if (stepData.continueOnError) step.continueOnError = stepData.continueOnError;
  if (stepData.maxRetries) step.maxRetries = stepData.maxRetries;
  if (stepData.retryInterval) step.retryInterval = stepData.retryInterval;

  // Type-specific configs
  if (stepData.rest) {
    step.rest = {
      url: stepData.rest.url || '',
      method: stepData.rest.method || 'GET',
      headers: stepData.rest.headers,
      queryParams: stepData.rest.queryParams,
      body: stepData.rest.body,
      multipart: stepData.rest.multipart,
    };
  }

  if (stepData.grpc) {
    step.grpc = {
      host: stepData.grpc.host || '',
      port: stepData.grpc.port || 50051,
      service: stepData.grpc.service || '',
      method: stepData.grpc.method || '',
      protoPath: stepData.grpc.protoPath || '',
      request: stepData.grpc.request,
    };
  }

  if (stepData.bash) {
    step.bash = {
      command: stepData.bash.command || '',
    };
  }

  if (stepData.set) {
    step.set = {
      variables: stepData.set.variables || {},
    };
  }

  if (stepData.wait) {
    step.wait = {
      duration: stepData.wait.duration,
      condition: stepData.wait.condition,
      maxRetries: stepData.wait.maxRetries,
      retryInterval: stepData.wait.retryInterval,
    };
  }

  if (stepData.loop) {
    step.loop = {
      items: stepData.loop.items,
      itemsFrom: stepData.loop.itemsFrom,
      dataSource: stepData.loop.dataSource,
      variable: stepData.loop.variable || 'item',
      indexVariable: stepData.loop.indexVariable,
      continueOnError: stepData.loop.continueOnError,
      steps: stepData.loop.steps ? stepData.loop.steps.map((s: any) => parseTestStep(s)) : [],
    };
  }

  if (stepData.ifConfig) {
    step.ifConfig = {
      condition: stepData.ifConfig.condition || '',
      then: stepData.ifConfig.then ? stepData.ifConfig.then.map((s: any) => parseTestStep(s)) : [],
      elseIf: stepData.ifConfig.elseIf,
      elseSteps: stepData.ifConfig.elseSteps ? stepData.ifConfig.elseSteps.map((s: any) => parseTestStep(s)) : [],
    };
  }

  // Extract
  if (stepData.extract) {
    step.extract = stepData.extract;
  }

  // Expect
  if (stepData.expect) {
    step.expect = {
      status: stepData.expect.status,
      body: stepData.expect.body,
      json: stepData.expect.json,
      performance: stepData.expect.performance,
    };
  }

  return step;
}

/**
 * TestSuite-in keçərliliyini yoxlayır
 */
export function validateSuite(suite: TestSuite): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!suite.tests || suite.tests.length === 0) {
    errors.push('Heç bir test step yoxdur');
  }

  suite.tests.forEach((step, index) => {
    if (!step.name || step.name.trim() === '') {
      errors.push(`Step ${index + 1}: Ad tələb olunur`);
    }

    if (!step.type) {
      errors.push(`Step ${index + 1}: Tip tələb olunur`);
    }

    // Type-specific validations
    if (step.type === 'REST' && step.rest) {
      if (!step.rest.url || step.rest.url.trim() === '') {
        errors.push(`Step ${index + 1}: URL tələb olunur`);
      }
      if (!step.rest.method) {
        errors.push(`Step ${index + 1}: HTTP metod tələb olunur`);
      }
    }

    if (step.type === 'BASH' && step.bash) {
      if (!step.bash.command || step.bash.command.trim() === '') {
        errors.push(`Step ${index + 1}: Bash əmri tələb olunur`);
      }
    }

    if (step.type === 'GRPC' && step.grpc) {
      if (!step.grpc.host || !step.grpc.service || !step.grpc.method || !step.grpc.protoPath) {
        errors.push(`Step ${index + 1}: gRPC konfiqurasiyası natamamdır`);
      }
    }

    if (step.type === 'LOOP' && step.loop) {
      if (!step.loop.variable) {
        errors.push(`Step ${index + 1}: Loop variable tələb olunur`);
      }
      if (!step.loop.items && !step.loop.itemsFrom && !step.loop.dataSource) {
        errors.push(`Step ${index + 1}: Loop məlumat mənbəyi tələb olunur`);
      }
    }

    if (step.type === 'IF' && step.ifConfig) {
      if (!step.ifConfig.condition || step.ifConfig.condition.trim() === '') {
        errors.push(`Step ${index + 1}: IF şərti tələb olunur`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
