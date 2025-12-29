"use client";

import { ExtractConfig } from "@/lib/yaml-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface ExtractFormProps {
  config: ExtractConfig;
  onChange: (config: ExtractConfig) => void;
}

export function ExtractForm({ config, onChange }: ExtractFormProps) {
  const [extractions, setExtractions] = useState<Array<{ key: string; value: string }>>(
    Object.entries(config).map(([key, value]) => ({ key, value }))
  );

  const addExtraction = () => {
    setExtractions([...extractions, { key: "", value: "" }]);
  };

  const removeExtraction = (index: number) => {
    const newExtractions = extractions.filter((_, i) => i !== index);
    setExtractions(newExtractions);
    updateExtractionsInConfig(newExtractions);
  };

  const updateExtraction = (index: number, field: "key" | "value", value: string) => {
    const newExtractions = [...extractions];
    newExtractions[index][field] = value;
    setExtractions(newExtractions);
    updateExtractionsInConfig(newExtractions);
  };

  const updateExtractionsInConfig = (newExtractions: Array<{ key: string; value: string }>) => {
    const extractObj: ExtractConfig = {};
    newExtractions.forEach(({ key, value }) => {
      if (key && value) extractObj[key] = value;
    });
    onChange(extractObj);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Extract (Response-dan Variable Çıxart)</CardTitle>
            <CardDescription className="text-xs mt-1">
              Response-dan JSONPath ilə məlumat çıxarıb variable-a yazın
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={addExtraction}>
            <Plus className="h-3 w-3 mr-1" />
            Əlavə et
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {extractions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            Extract yoxdur
          </p>
        ) : (
          extractions.map((extraction, index) => (
            <div key={index} className="space-y-2">
              <Label className="text-xs">Extract #{index + 1}</Label>
              <div className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder="Variable adı (məs: userId)"
                  value={extraction.key}
                  onChange={(e) => updateExtraction(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2 font-mono text-xs"
                  placeholder="JSONPath (məs: $.id)"
                  value={extraction.value}
                  onChange={(e) => updateExtraction(index, "value", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeExtraction(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pl-1">
                Response-dan <code className="bg-muted px-1 rounded">{extraction.value || "$.path"}</code> çıxarılıb{" "}
                <code className="bg-muted px-1 rounded">{extraction.key || "variableName"}</code> dəyişəninə yazılacaq
              </p>
            </div>
          ))
        )}

        {extractions.length === 0 && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-mono">
              <strong>Nümunə:</strong><br/>
              Variable: <code>userId</code><br/>
              JSONPath: <code>$.id</code><br/>
              <br/>
              Response: <code>{`{"id": 123, "name": "John"}`}</code><br/>
              Nəticə: <code>userId = 123</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
