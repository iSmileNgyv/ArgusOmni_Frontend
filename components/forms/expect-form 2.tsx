"use client";

import { ExpectConfig } from "@/lib/yaml-generator";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useState } from "react";

interface ExpectFormProps {
  config: ExpectConfig;
  onChange: (config: ExpectConfig) => void;
}

export function ExpectForm({ config, onChange }: ExpectFormProps) {
  const [jsonPathAssertions, setJsonPathAssertions] = useState(
    config.body?.jsonPath ? JSON.stringify(config.body.jsonPath, null, 2) : ""
  );

  const updateConfig = (updates: Partial<ExpectConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleJsonPathChange = (value: string) => {
    setJsonPathAssertions(value);
    try {
      const parsed = JSON.parse(value);
      updateConfig({
        body: {
          ...config.body,
          jsonPath: parsed,
        },
      });
    } catch {
      // Invalid JSON, don't update
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Assertions (Expect)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Code */}
        <div>
          <Label>Expected Status Code</Label>
          <Input
            type="number"
            placeholder="200"
            value={config.status || ""}
            onChange={(e) => updateConfig({ status: parseInt(e.target.value) || undefined })}
          />
        </div>

        {/* JSONPath Assertions */}
        <div>
          <Label>JSONPath Assertions (JSON)</Label>
          <Textarea
            placeholder={`{\n  "$.id": {\n    "equals": 1\n  },\n  "$.title": {\n    "exists": true\n  }\n}`}
            className="font-mono text-xs"
            rows={10}
            value={jsonPathAssertions}
            onChange={(e) => handleJsonPathChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            JSONPath formatında assertion. Məs: $.id, $.users[0].name
          </p>
        </div>

        {/* Performance */}
        <div>
          <Label>Max Duration (ms)</Label>
          <Input
            type="number"
            placeholder="1000"
            value={config.performance?.maxDuration || ""}
            onChange={(e) =>
              updateConfig({
                performance: {
                  maxDuration: parseInt(e.target.value) || undefined,
                },
              })
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            Test bu müddətdən tez bitməlidir
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
