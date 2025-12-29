export interface SavedTestCase {
  id: string;
  name: string;
  description?: string;
  yamlContent: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

const STORAGE_KEY = 'argusomni_saved_tests';

export class TestCaseStorage {
  // Bütün test case'ləri əldə et
  static getAll(): SavedTestCase[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Test case\'lər oxunarkən xəta:', error);
      return [];
    }
  }

  // ID ilə test case əldə et
  static getById(id: string): SavedTestCase | null {
    const tests = this.getAll();
    return tests.find(test => test.id === id) || null;
  }

  // Yeni test case saxla
  static save(testCase: Omit<SavedTestCase, 'id' | 'createdAt' | 'updatedAt'>): SavedTestCase {
    const tests = this.getAll();
    const now = new Date().toISOString();

    const newTestCase: SavedTestCase = {
      ...testCase,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    tests.push(newTestCase);
    this.saveAll(tests);

    return newTestCase;
  }

  // Mövcud test case'i yenilə
  static update(id: string, updates: Partial<Omit<SavedTestCase, 'id' | 'createdAt'>>): SavedTestCase | null {
    const tests = this.getAll();
    const index = tests.findIndex(test => test.id === id);

    if (index === -1) return null;

    tests[index] = {
      ...tests[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveAll(tests);
    return tests[index];
  }

  // Test case sil
  static delete(id: string): boolean {
    const tests = this.getAll();
    const filtered = tests.filter(test => test.id !== id);

    if (filtered.length === tests.length) return false;

    this.saveAll(filtered);
    return true;
  }

  // Hamısını sil
  static deleteAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  // Axtarış
  static search(query: string): SavedTestCase[] {
    const tests = this.getAll();
    const lowerQuery = query.toLowerCase();

    return tests.filter(test =>
      test.name.toLowerCase().includes(lowerQuery) ||
      test.description?.toLowerCase().includes(lowerQuery) ||
      test.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Export - Hamısını JSON olaraq
  static exportAll(): string {
    const tests = this.getAll();
    return JSON.stringify(tests, null, 2);
  }

  // Import - JSON-dan yüklə
  static importAll(jsonData: string): { success: boolean; count: number; error?: string } {
    try {
      const tests = JSON.parse(jsonData) as SavedTestCase[];

      if (!Array.isArray(tests)) {
        return { success: false, count: 0, error: 'Yanlış format' };
      }

      // Validate structure
      const validTests = tests.filter(test =>
        test.id && test.name && test.yamlContent && test.createdAt
      );

      if (validTests.length === 0) {
        return { success: false, count: 0, error: 'Heç bir keçərli test tapılmadı' };
      }

      const existing = this.getAll();
      const merged = [...existing, ...validTests];

      this.saveAll(merged);

      return { success: true, count: validTests.length };
    } catch (error) {
      return { success: false, count: 0, error: 'JSON parse xətası' };
    }
  }

  // Tək test case export (YML faylı)
  static exportAsYaml(id: string): { success: boolean; yaml?: string; filename?: string; error?: string } {
    const testCase = this.getById(id);

    if (!testCase) {
      return { success: false, error: 'Test case tapılmadı' };
    }

    const filename = `${testCase.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.yml`;

    return {
      success: true,
      yaml: testCase.yamlContent,
      filename,
    };
  }

  // YML import
  static importFromYaml(name: string, yamlContent: string, description?: string): SavedTestCase {
    return this.save({
      name,
      description,
      yamlContent,
      tags: ['imported'],
    });
  }

  // Private helpers
  private static saveAll(tests: SavedTestCase[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  }

  private static generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
