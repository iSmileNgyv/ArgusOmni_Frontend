import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Delete specific test files by timestamp
async function deleteTestFilesByTimestamp(timestamp: string) {
  const projectRoot = process.cwd();
  const folders = ["test-reports", "test-logs", "test-results"];
  const deletedFiles: string[] = [];

  // Parse timestamp to Date object
  const date = new Date(timestamp);

  // Format for HTML files: 20251229_194736
  const htmlFormat =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    '_' +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');

  // Format for JSON files: 2025-12-29_19-47-36
  const jsonFormat =
    date.getFullYear().toString() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0') +
    '_' +
    String(date.getHours()).padStart(2, '0') +
    '-' +
    String(date.getMinutes()).padStart(2, '0') +
    '-' +
    String(date.getSeconds()).padStart(2, '0');

  for (const folder of folders) {
    const folderPath = path.join(projectRoot, folder);

    try {
      // Check if folder exists
      await fs.access(folderPath);

      // Read all files in the folder
      const files = await fs.readdir(folderPath);

      // Find and delete files matching the timestamp
      for (const file of files) {
        if (file.includes(htmlFormat) || file.includes(jsonFormat)) {
          const filePath = path.join(folderPath, file);
          await fs.unlink(filePath);
          deletedFiles.push(`${folder}/${file}`);
        }
      }
    } catch (error) {
      // Folder doesn't exist or other error, continue
      continue;
    }
  }

  return deletedFiles;
}

// Delete all test files
async function deleteAllTestFiles() {
  const projectRoot = process.cwd();
  const folders = ["test-reports", "test-logs", "test-results"];
  const deletedFiles: string[] = [];

  for (const folder of folders) {
    const folderPath = path.join(projectRoot, folder);

    try {
      // Check if folder exists
      await fs.access(folderPath);

      // Read all files in the folder
      const files = await fs.readdir(folderPath);

      // Delete all files
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile()) {
          await fs.unlink(filePath);
          deletedFiles.push(`${folder}/${file}`);
        }
      }
    } catch (error) {
      // Folder doesn't exist or other error, continue
      continue;
    }
  }

  return deletedFiles;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, timestamp } = body;

    let deletedFiles: string[] = [];

    if (action === "deleteAll") {
      deletedFiles = await deleteAllTestFiles();
    } else if (action === "deleteOne" && timestamp) {
      deletedFiles = await deleteTestFilesByTimestamp(timestamp);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action or missing timestamp" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedFiles,
      count: deletedFiles.length,
    });
  } catch (error) {
    console.error("Error deleting test files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete test files" },
      { status: 500 }
    );
  }
}
