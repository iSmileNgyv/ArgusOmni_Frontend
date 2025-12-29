export interface TestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  yaml: string;
}

export const testTemplates: TestTemplate[] = [
  {
    id: 'rest-basic',
    name: 'Sadə REST API Testi',
    description: 'Sadə GET sorğusu ilə REST API test nümunəsi',
    category: 'REST',
    yaml: `# Sadə REST API Test
tests:
  - name: "GET Request Test"
    type: REST
    rest:
      url: "https://jsonplaceholder.typicode.com/posts/1"
      method: GET
    expect:
      status: 200
      body:
        jsonPath:
          $.id:
            equals: 1
          $.title:
            exists: true`,
  },
  {
    id: 'rest-post',
    name: 'REST POST İstək',
    description: 'JSON məlumat göndərən POST sorğusu',
    category: 'REST',
    yaml: `# REST POST Test
tests:
  - name: "Create User"
    type: REST
    rest:
      url: "https://jsonplaceholder.typicode.com/users"
      method: POST
      headers:
        Content-Type: "application/json"
      body: |
        {
          "name": "Test User",
          "email": "test@example.com",
          "phone": "1234567890"
        }
    extract:
      userId: "$.id"
    expect:
      status: 201`,
  },
  {
    id: 'rest-auth',
    name: 'Authentication Flow',
    description: 'Login və sonra authentication ilə sorğu',
    category: 'REST',
    yaml: `# Authentication Flow Test
env:
  baseUrl: "https://api.example.com"

tests:
  - name: "Login"
    type: REST
    rest:
      url: "{{baseUrl}}/auth/login"
      method: POST
      headers:
        Content-Type: "application/json"
      body: |
        {
          "username": "testuser",
          "password": "testpass"
        }
    extract:
      authToken: "$.token"
    expect:
      status: 200

  - name: "Get Protected Resource"
    type: REST
    rest:
      url: "{{baseUrl}}/users/me"
      method: GET
      headers:
        Authorization: "Bearer {{authToken}}"
    expect:
      status: 200`,
  },
  {
    id: 'loop-csv',
    name: 'CSV Data-Driven Test',
    description: 'CSV faylından məlumat oxuyaraq test',
    category: 'LOOP',
    yaml: `# CSV Data-Driven Test
tests:
  - name: "Test Multiple Users"
    type: LOOP
    loop:
      items:
        - {name: "Alice", age: 25, email: "alice@example.com"}
        - {name: "Bob", age: 30, email: "bob@example.com"}
        - {name: "Charlie", age: 35, email: "charlie@example.com"}
      variable: "user"
      steps:
        - name: "Validate User {{user.name}}"
          type: ASSERT
          expect:
            equals:
              name: "{{user.name}}"`,
  },
  {
    id: 'conditional',
    name: 'Conditional Test',
    description: 'IF/ELSE şərti testlər',
    category: 'CONTROL FLOW',
    yaml: `# Conditional Test Example
env:
  environment: "dev"

tests:
  - name: "Environment Check"
    type: IF
    ifConfig:
      condition: "environment == 'dev'"
      then:
        - name: "Dev Environment Setup"
          type: SET
          set:
            variables:
              apiUrl: "https://dev-api.example.com"
              debugMode: true
      elseSteps:
        - name: "Prod Environment Setup"
          type: SET
          set:
            variables:
              apiUrl: "https://api.example.com"
              debugMode: false

  - name: "Test API"
    type: REST
    rest:
      url: "{{apiUrl}}/health"
      method: GET
    expect:
      status: 200`,
  },
  {
    id: 'mock-server',
    name: 'Mock Server Test',
    description: 'WireMock istifadə edərək mock server testi',
    category: 'MOCK',
    yaml: `# Mock Server Test
tests:
  - name: "Start Mock Server"
    type: MOCK
    mock:
      action: start
      port: 8089
      baseUrlVariable: "mockUrl"

  - name: "Create Mock Endpoint"
    type: MOCK
    mock:
      action: stub
      stub:
        request:
          method: GET
          urlPath: /api/users/123
        response:
          status: 200
          jsonBody:
            id: 123
            name: "Mock User"
            email: "mock@example.com"

  - name: "Test Mock Endpoint"
    type: REST
    rest:
      url: "{{mockUrl}}/api/users/123"
      method: GET
    expect:
      status: 200
      body:
        jsonPath:
          $.name:
            equals: "Mock User"

  - name: "Stop Mock Server"
    type: MOCK
    mock:
      action: stop`,
  },
  {
    id: 'parallel',
    name: 'Parallel Execution',
    description: 'Paralel test icraları',
    category: 'ADVANCED',
    yaml: `# Parallel Execution Example
execution:
  parallel:
    enabled: true
    threads: 4
    timeout: 30000
    failFast: false

tests:
  - id: "test1"
    name: "Independent Test 1"
    type: REST
    rest:
      url: "https://jsonplaceholder.typicode.com/posts/1"
      method: GET
    expect:
      status: 200

  - id: "test2"
    name: "Independent Test 2"
    type: REST
    rest:
      url: "https://jsonplaceholder.typicode.com/users/1"
      method: GET
    expect:
      status: 200

  - id: "test3"
    name: "Dependent Test"
    dependsOn: ["test1"]
    type: REST
    rest:
      url: "https://jsonplaceholder.typicode.com/comments/1"
      method: GET
    expect:
      status: 200`,
  },
  {
    id: 'comprehensive',
    name: 'Tam Test Suite',
    description: 'Bütün xüsusiyyətləri əhatə edən kompleks test',
    category: 'ADVANCED',
    yaml: `# Comprehensive Test Suite
env:
  baseUrl: "https://jsonplaceholder.typicode.com"

variables:
  testUser: "John Doe"

execution:
  parallel:
    enabled: true
    threads: 2

tests:
  - id: "setup"
    name: "Setup Test Data"
    type: SET
    set:
      variables:
        testEmail: "test@example.com"
        testAge: 25

  - id: "create"
    name: "Create Resource"
    dependsOn: ["setup"]
    type: REST
    rest:
      url: "{{baseUrl}}/posts"
      method: POST
      headers:
        Content-Type: "application/json"
      body: |
        {
          "title": "Test Post",
          "body": "Test content",
          "userId": 1
        }
    extract:
      postId: "$.id"
    expect:
      status: 201
      body:
        jsonPath:
          $.title:
            equals: "Test Post"

  - id: "verify"
    name: "Verify Created Resource"
    dependsOn: ["create"]
    type: REST
    rest:
      url: "{{baseUrl}}/posts/{{postId}}"
      method: GET
    expect:
      status: 200
      body:
        jsonPath:
          $.id:
            equals: "{{postId}}"`,
  },
];

export function getTemplatesByCategory(category: string): TestTemplate[] {
  return testTemplates.filter((t) => t.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(testTemplates.map((t) => t.category)));
}
