"use client";

import { useTranslations } from "next-intl";
import { Editor } from "@monaco-editor/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FolderOpen } from "lucide-react";

interface YamlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
  onOpenEditor?: () => void;
}

export function YamlEditor({ value, onChange, readOnly = false, onOpenEditor }: YamlEditorProps) {
  const t = useTranslations();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle>{t('yamlEditor.title')}</CardTitle>
            <CardDescription>
              {t('yamlEditor.description')}
            </CardDescription>
          </div>
          {onOpenEditor && (
            <Button
              onClick={onOpenEditor}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              {t('common.open')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Editor
          height="calc(100vh - 250px)"
          defaultLanguage="yaml"
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </CardContent>
    </Card>
  );
}
