import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename parametri tələb olunur' },
        { status: 400 }
      );
    }

    // Construct path to HTML report
    const testReportsDir = join(process.cwd(), 'test-reports');
    const htmlFilePath = join(testReportsDir, filename);

    // Check if file exists
    if (!existsSync(htmlFilePath)) {
      return NextResponse.json(
        { error: 'HTML report faylı tapılmadı' },
        { status: 404 }
      );
    }

    // Read HTML file
    const htmlContent = readFileSync(htmlFilePath, 'utf-8');

    // Return HTML with proper headers
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('HTML report oxunarkən xəta:', error);
    return NextResponse.json(
      {
        error: error.message || 'HTML report oxuna bilmədi'
      },
      { status: 500 }
    );
  }
}
