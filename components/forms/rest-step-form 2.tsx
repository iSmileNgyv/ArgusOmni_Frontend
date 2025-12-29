"use client";

import { RestStepConfig } from "@/lib/yaml-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface RestStepFormProps {
  config: RestStepConfig;
  onChange: (config: RestStepConfig) => void;
}

export function RestStepForm({ config, onChange }: RestStepFormProps) {
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(
    config.headers
      ? Object.entries(config.headers).map(([key, value]) => ({ key, value }))
      : []
  );

  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string }>>(
    config.queryParams
      ? Object.entries(config.queryParams).map(([key, value]) => ({ key, value }))
      : []
  );

  const updateConfig = (updates: Partial<RestStepConfig>) => {
    onChange({ ...config, ...updates });
  };

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
    updateHeadersInConfig(newHeaders);
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
    updateHeadersInConfig(newHeaders);
  };

  const updateHeadersInConfig = (newHeaders: Array<{ key: string; value: string }>) => {
    const headersObj: Record<string, string> = {};
    newHeaders.forEach(({ key, value }) => {
      if (key && value) headersObj[key] = value;
    });
    updateConfig({ headers: Object.keys(headersObj).length > 0 ? headersObj : undefined });
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "" }]);
  };

  const removeQueryParam = (index: number) => {
    const newParams = queryParams.filter((_, i) => i !== index);
    setQueryParams(newParams);
    updateQueryParamsInConfig(newParams);
  };

  const updateQueryParam = (index: number, field: "key" | "value", value: string) => {
    const newParams = [...queryParams];
    newParams[index][field] = value;
    setQueryParams(newParams);
    updateQueryParamsInConfig(newParams);
  };

  const updateQueryParamsInConfig = (newParams: Array<{ key: string; value: string }>) => {
    const paramsObj: Record<string, string> = {};
    newParams.forEach(({ key, value }) => {
      if (key && value) paramsObj[key] = value;
    });
    updateConfig({ queryParams: Object.keys(paramsObj).length > 0 ? paramsObj : undefined });
  };

  return (
    <div className="space-y-4">
      {/* URL və Method */}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-1">
          <Label>Method</Label>
          <Select
            value={config.method}
            onValueChange={(value) => updateConfig({ method: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-3">
          <Label>URL</Label>
          <Input
            placeholder="https://api.example.com/endpoint"
            value={config.url}
            onChange={(e) => updateConfig({ url: e.target.value })}
          />
        </div>
      </div>

      {/* Headers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Headers</CardTitle>
            <Button size="sm" variant="outline" onClick={addHeader}>
              <Plus className="h-3 w-3 mr-1" />
              Əlavə et
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {headers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Header yoxdur
            </p>
          ) : (
            headers.map((header, index) => (
              <div key={index} className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder="Header Key"
                  value={header.key}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder="Header Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeHeader(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Query Parameters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Query Parameters</CardTitle>
            <Button size="sm" variant="outline" onClick={addQueryParam}>
              <Plus className="h-3 w-3 mr-1" />
              Əlavə et
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {queryParams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Query param yoxdur
            </p>
          ) : (
            queryParams.map((param, index) => (
              <div key={index} className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder="Param Key"
                  value={param.key}
                  onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder="Param Value"
                  value={param.value}
                  onChange={(e) => updateQueryParam(index, "value", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeQueryParam(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Body (POST/PUT/PATCH only) */}
      {(config.method === "POST" || config.method === "PUT" || config.method === "PATCH") && (
        <div>
          <Label>Request Body (JSON)</Label>
          <Textarea
            placeholder='{\n  "key": "value"\n}'
            className="font-mono text-xs"
            rows={8}
            value={config.body || ""}
            onChange={(e) => updateConfig({ body: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
