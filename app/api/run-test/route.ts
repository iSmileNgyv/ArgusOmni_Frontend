import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { yamlContent } = await request.json();

    if (!yamlContent) {
      return NextResponse.json(
        { error: 'YAML məzmunu tələb olunur' },
        { status: 400 }
      );
    }

    // Müvəqqəti YAML faylı yarat
    const timestamp = Date.now();
    const tempFileName = `test-${timestamp}.yml`;
    const tempFilePath = join(process.cwd(), 'test-results', tempFileName);

    // test-results qovluğunu yarat (yoxdursa)
    try {
      const { mkdirSync } = await import('fs');
      mkdirSync(join(process.cwd(), 'test-results'), { recursive: true });
    } catch (e) {
      // Qovluq artıq mövcuddursa, xətanı görmə
    }

    // YAML məzmununu fayla yaz
    writeFileSync(tempFilePath, yamlContent);

    // Java CLI-nı işə sal
    const jarPath = '/Users/ismile/IdeaProjects/Java_CoreScaffold/ArgusOmni-CLI/build/libs/ArgusOmni-CLI-1.0.0.jar';
    const command = `java -jar "${jarPath}" run "${tempFilePath}"`;

    console.log('İcra olunan əmr:', command);

    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 dəqiqə timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      const duration = Date.now() - startTime;

      // test-logs qovluğundan JSON faylını tap və oxu
      let jsonOutput = stdout; // Default olaraq stdout
      const testLogsDir = join(process.cwd(), 'test-logs');

      try {
        if (existsSync(testLogsDir)) {
          const files = readdirSync(testLogsDir);
          const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
          if (jsonFiles.length > 0) {
            // Ən son yaradılan JSON faylını oxu
            const jsonFilePath = join(testLogsDir, jsonFiles[0]);
            const jsonContent = readFileSync(jsonFilePath, 'utf-8');
            jsonOutput = jsonContent;
            console.log('JSON fayl oxundu:', jsonFiles[0]);
          }
        }
      } catch (e) {
        console.error('JSON fayl oxunarkən xəta:', e);
      }

      // test-reports qovluğundan HTML faylını tap
      let htmlReportPath: string | undefined;
      const testReportsDir = join(process.cwd(), 'test-reports');

      try {
        if (existsSync(testReportsDir)) {
          const files = readdirSync(testReportsDir);
          const htmlFiles = files.filter(f => f.endsWith('.html')).sort().reverse();
          if (htmlFiles.length > 0) {
            // Ən son yaradılan HTML faylını götür və HTTP URL-i yarat
            const htmlFileName = htmlFiles[0];
            htmlReportPath = `/api/html-report?filename=${encodeURIComponent(htmlFileName)}`;
            console.log('HTML report tapıldı:', htmlFileName);
          }
        }
      } catch (e) {
        console.error('HTML report tapılmadı:', e);
      }

      // Müvəqqəti faylı sil
      try {
        unlinkSync(tempFilePath);
      } catch (e) {
        console.error('Müvəqqəti fayl silinə bilmədi:', e);
      }

      return NextResponse.json({
        success: true,
        output: jsonOutput,
        error: stderr,
        duration,
        timestamp: new Date().toISOString(),
        htmlReportPath,
      });
    } catch (execError: any) {
      const duration = Date.now() - startTime;

      // Müvəqqəti faylı sil
      try {
        unlinkSync(tempFilePath);
      } catch (e) {
        console.error('Müvəqqəti fayl silinə bilmədi:', e);
      }

      return NextResponse.json({
        success: false,
        output: execError.stdout || '',
        error: execError.stderr || execError.message,
        duration,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Test icrasında xəta:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Naməlum xəta baş verdi'
      },
      { status: 500 }
    );
  }
}
