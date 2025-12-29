import * as yaml from 'js-yaml';

export interface Variable {
  key: string;
  value: string;
}

export interface EnvVariable {
  key: string;
  value: string;
}

export interface RestStepConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: string;
  multipart?: Record<string, any>;
}

export interface GrpcStepConfig {
  host: string;
  port: number;
  service: string;
  method: string;
  protoPath: string;
  request?: Record<string, any>;
}

export interface BashStepConfig {
  command: string;
}

export interface SetStepConfig {
  variables: Record<string, any>;
}

export interface WaitStepConfig {
  duration?: number;
  condition?: {
    variable: string;
    equals?: string;
    exists?: boolean;
  };
  maxRetries?: number;
  retryInterval?: number;
}

export interface LoopStepConfig {
  items?: any[];
  itemsFrom?: string;
  dataSource?: {
    type: 'CSV' | 'JSON';
    file: string;
    path?: string;
  };
  variable: string;
  indexVariable?: string;
  continueOnError?: boolean;
  steps: TestStep[];
}

export interface IfStepConfig {
  condition: string;
  then: TestStep[];
  elseIf?: Array<{
    condition: string;
    then: TestStep[];
  }>;
  elseSteps?: TestStep[];
}

export interface AssertStepConfig {
  equals?: Record<string, any>;
}

export interface ExpectConfig {
  status?: number;
  body?: {
    jsonPath?: Record<string, any>;
  };
  json?: Record<string, any>;
  performance?: {
    maxDuration?: number;
  };
}

export interface ExtractConfig {
  [key: string]: string;
}

export interface TestStep {
  id?: string;
  name: string;
  type: 'REST' | 'GRPC' | 'BASH' | 'SET' | 'WAIT' | 'LOOP' | 'IF' | 'ASSERT' | 'TRANSFORM' | 'MOCK' | 'FS';
  dependsOn?: string[];
  continueOnError?: boolean;
  maxRetries?: number;
  retryInterval?: number;

  // Step-specific configs
  rest?: RestStepConfig;
  grpc?: GrpcStepConfig;
  bash?: BashStepConfig;
  set?: SetStepConfig;
  wait?: WaitStepConfig;
  loop?: LoopStepConfig;
  ifConfig?: IfStepConfig;

  // Common fields
  extract?: ExtractConfig;
  expect?: ExpectConfig;
}

export interface TestSuite {
  env?: Record<string, string>;
  variables?: Record<string, any>;
  execution?: {
    parallel?: {
      enabled: boolean;
      threads?: number;
      timeout?: number;
      failFast?: boolean;
    };
  };
  tests: TestStep[];
}

export function generateYaml(suite: TestSuite): string {
  const yamlObj: any = {};

  // Add env
  if (suite.env && Object.keys(suite.env).length > 0) {
    yamlObj.env = suite.env;
  }

  // Add variables
  if (suite.variables && Object.keys(suite.variables).length > 0) {
    yamlObj.variables = suite.variables;
  }

  // Add execution config
  if (suite.execution) {
    yamlObj.execution = suite.execution;
  }

  // Add tests
  yamlObj.tests = suite.tests.map(step => {
    const stepObj: any = {
      name: step.name,
      type: step.type,
    };

    if (step.id) stepObj.id = step.id;
    if (step.dependsOn && step.dependsOn.length > 0) stepObj.dependsOn = step.dependsOn;
    if (step.continueOnError) stepObj.continueOnError = step.continueOnError;
    if (step.maxRetries) stepObj.maxRetries = step.maxRetries;
    if (step.retryInterval) stepObj.retryInterval = step.retryInterval;

    // Add type-specific config
    if (step.rest) stepObj.rest = cleanObject(step.rest);
    if (step.grpc) stepObj.grpc = cleanObject(step.grpc);
    if (step.bash) stepObj.bash = cleanObject(step.bash);
    if (step.set) stepObj.set = cleanObject(step.set);
    if (step.wait) stepObj.wait = cleanObject(step.wait);
    if (step.loop) stepObj.loop = cleanLoopConfig(step.loop);
    if (step.ifConfig) stepObj.ifConfig = cleanIfConfig(step.ifConfig);

    // Add extract
    if (step.extract && Object.keys(step.extract).length > 0) {
      stepObj.extract = step.extract;
    }

    // Add expect
    if (step.expect) {
      stepObj.expect = cleanObject(step.expect);
    }

    return stepObj;
  });

  return yaml.dump(yamlObj, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });
}

function cleanObject(obj: any): any {
  if (!obj) return obj;

  const cleaned: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanObject(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else if (Array.isArray(value) && value.length > 0) {
        cleaned[key] = value;
      } else if (typeof value !== 'object') {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

function cleanLoopConfig(loop: LoopStepConfig): any {
  const cleaned: any = {
    variable: loop.variable,
  };

  if (loop.items && loop.items.length > 0) cleaned.items = loop.items;
  if (loop.itemsFrom) cleaned.itemsFrom = loop.itemsFrom;
  if (loop.dataSource) cleaned.dataSource = loop.dataSource;
  if (loop.indexVariable) cleaned.indexVariable = loop.indexVariable;
  if (loop.continueOnError) cleaned.continueOnError = loop.continueOnError;
  if (loop.steps && loop.steps.length > 0) {
    cleaned.steps = loop.steps.map(s => cleanObject(s));
  }

  return cleaned;
}

function cleanIfConfig(ifConfig: IfStepConfig): any {
  const cleaned: any = {
    condition: ifConfig.condition,
  };

  if (ifConfig.then && ifConfig.then.length > 0) {
    cleaned.then = ifConfig.then.map(s => cleanObject(s));
  }

  if (ifConfig.elseIf && ifConfig.elseIf.length > 0) {
    cleaned.elseIf = ifConfig.elseIf.map(ei => ({
      condition: ei.condition,
      then: ei.then.map(s => cleanObject(s)),
    }));
  }

  if (ifConfig.elseSteps && ifConfig.elseSteps.length > 0) {
    cleaned.elseSteps = ifConfig.elseSteps.map(s => cleanObject(s));
  }

  return cleaned;
}
