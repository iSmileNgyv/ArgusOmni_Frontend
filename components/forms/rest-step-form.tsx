"use client";

import { RestStepConfig } from "@/lib/yaml-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface RestStepFormProps {
  config: RestStepConfig;
  onChange: (config: RestStepConfig) => void;
}

export function RestStepForm({ config, onChange }: RestStepFormProps) {
  const t = useTranslations();
  const isEditingHeaders = useRef(false);
  const isEditingQueryParams = useRef(false);
  const isEditingCookies = useRef(false);

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

  const [cookiesAuto, setCookiesAuto] = useState(config.cookies === "auto");

  const [cookies, setCookies] = useState<Array<{ key: string; value: string }>>(
    config.cookies && typeof config.cookies === "object"
      ? Object.entries(config.cookies).map(([key, value]) => ({ key, value }))
      : []
  );

  // Update headers state when config changes (skip if user is editing)
  useEffect(() => {
    if (isEditingHeaders.current) {
      return; // Don't reset flag, keep skipping
    }

    if (config.headers) {
      setHeaders(Object.entries(config.headers).map(([key, value]) => ({ key, value })));
    } else {
      setHeaders([]);
    }
  }, [config.headers]);

  // Update queryParams state when config changes (skip if user is editing)
  useEffect(() => {
    if (isEditingQueryParams.current) {
      return; // Don't reset flag, keep skipping
    }

    if (config.queryParams) {
      setQueryParams(Object.entries(config.queryParams).map(([key, value]) => ({ key, value })));
    } else {
      setQueryParams([]);
    }
  }, [config.queryParams]);

  // Update cookies state when config changes (skip if user is editing)
  useEffect(() => {
    if (isEditingCookies.current) {
      return; // Don't reset flag, keep skipping
    }

    if (config.cookies === "auto") {
      setCookiesAuto(true);
      setCookies([]);
    } else if (config.cookies && typeof config.cookies === "object") {
      setCookiesAuto(false);
      setCookies(Object.entries(config.cookies).map(([key, value]) => ({ key, value })));
    } else {
      setCookiesAuto(false);
      setCookies([]);
    }
  }, [config.cookies]);

  const updateConfig = (updates: Partial<RestStepConfig>) => {
    onChange({ ...config, ...updates });
  };

  const addHeader = () => {
    isEditingHeaders.current = true;
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    isEditingHeaders.current = true;
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
    updateHeadersInConfig(newHeaders);
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    isEditingHeaders.current = true;
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
    isEditingQueryParams.current = true;
    setQueryParams([...queryParams, { key: "", value: "" }]);
  };

  const removeQueryParam = (index: number) => {
    isEditingQueryParams.current = true;
    const newParams = queryParams.filter((_, i) => i !== index);
    setQueryParams(newParams);
    updateQueryParamsInConfig(newParams);
  };

  const updateQueryParam = (index: number, field: "key" | "value", value: string) => {
    isEditingQueryParams.current = true;
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

  const handleCookiesAutoToggle = (checked: boolean) => {
    isEditingCookies.current = true;
    setCookiesAuto(checked);
    if (checked) {
      updateConfig({ cookies: "auto" });
      setCookies([]);
    } else {
      updateConfig({ cookies: undefined });
    }
  };

  const addCookie = () => {
    isEditingCookies.current = true;
    setCookies([...cookies, { key: "", value: "" }]);
  };

  const removeCookie = (index: number) => {
    isEditingCookies.current = true;
    const newCookies = cookies.filter((_, i) => i !== index);
    setCookies(newCookies);
    updateCookiesInConfig(newCookies);
  };

  const updateCookie = (index: number, field: "key" | "value", value: string) => {
    isEditingCookies.current = true;
    const newCookies = [...cookies];
    newCookies[index][field] = value;
    setCookies(newCookies);
    updateCookiesInConfig(newCookies);
  };

  const updateCookiesInConfig = (newCookies: Array<{ key: string; value: string }>) => {
    const cookiesObj: Record<string, string> = {};
    newCookies.forEach(({ key, value }) => {
      if (key && value) cookiesObj[key] = value;
    });
    updateConfig({ cookies: Object.keys(cookiesObj).length > 0 ? cookiesObj : undefined });
  };

  return (
    <div className="space-y-4">
      {/* URL və Method */}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-1">
          <Label>{t('forms.rest.method')}</Label>
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
          <Label>{t('forms.rest.url')}</Label>
          <Input
            placeholder={t('forms.rest.urlPlaceholder')}
            value={config.url}
            onChange={(e) => updateConfig({ url: e.target.value })}
          />
        </div>
      </div>

      {/* Headers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{t('forms.rest.headers')}</CardTitle>
            <Button size="sm" variant="outline" onClick={addHeader}>
              <Plus className="h-3 w-3 mr-1" />
              {t('forms.rest.addButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {headers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('forms.rest.noHeaders')}
            </p>
          ) : (
            headers.map((header, index) => (
              <div key={index} className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder={t('forms.rest.headerKey')}
                  value={header.key}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder={t('forms.rest.headerValue')}
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
            <CardTitle className="text-sm">{t('forms.rest.queryParameters')}</CardTitle>
            <Button size="sm" variant="outline" onClick={addQueryParam}>
              <Plus className="h-3 w-3 mr-1" />
              {t('forms.rest.addButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {queryParams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('forms.rest.noQueryParams')}
            </p>
          ) : (
            queryParams.map((param, index) => (
              <div key={index} className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder={t('forms.rest.paramKey')}
                  value={param.key}
                  onChange={(e) => updateQueryParam(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder={t('forms.rest.paramValue')}
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

      {/* Cookies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{t('forms.rest.cookies')}</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="cookies-auto"
                  checked={cookiesAuto}
                  onCheckedChange={handleCookiesAutoToggle}
                />
                <Label htmlFor="cookies-auto" className="text-sm font-normal cursor-pointer">
                  {t('forms.rest.cookiesAuto')}
                </Label>
              </div>
              {!cookiesAuto && (
                <Button size="sm" variant="outline" onClick={addCookie}>
                  <Plus className="h-3 w-3 mr-1" />
                  {t('forms.rest.addButton')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {cookiesAuto ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('forms.rest.cookiesAutoDescription')}
            </p>
          ) : cookies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('forms.rest.noCookies')}
            </p>
          ) : (
            cookies.map((cookie, index) => (
              <div key={index} className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder={t('forms.rest.cookieName')}
                  value={cookie.key}
                  onChange={(e) => updateCookie(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder={t('forms.rest.cookieValue')}
                  value={cookie.value}
                  onChange={(e) => updateCookie(index, "value", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeCookie(index)}
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
          <Label>{t('forms.rest.requestBody')}</Label>
          <Textarea
            placeholder={t('forms.rest.requestBodyPlaceholder')}
            className="font-mono text-xs"
            rows={8}
            value={config.body || ""}
            onChange={(e) => updateConfig({ body: e.target.value })}
          />
        </div>
      )}

      {/* Multipart / File Upload (POST/PUT/PATCH only) */}
      {(config.method === "POST" || config.method === "PUT" || config.method === "PATCH") && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{t('forms.rest.multipart')}</CardTitle>
            <CardDescription className="text-xs">
              {t('forms.rest.multipartDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-xs">
                YAML Format (Example: profilePhoto: "/path/to/photo.jpg")
              </Label>
              <Textarea
                placeholder={`profilePhoto: "/path/to/photo.jpg"\nname: "John Doe"\nage: "30"`}
                className="font-mono text-xs"
                rows={6}
                value={
                  config.multipart
                    ? typeof config.multipart === "string"
                      ? config.multipart
                      : JSON.stringify(config.multipart, null, 2)
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.trim();
                  if (!value) {
                    updateConfig({ multipart: undefined });
                  } else {
                    try {
                      const parsed = JSON.parse(value);
                      updateConfig({ multipart: parsed });
                    } catch {
                      updateConfig({ multipart: value as any });
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
