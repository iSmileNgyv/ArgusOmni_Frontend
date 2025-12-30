"use client";

import { FileUploadStepConfig } from "@/lib/yaml-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Plus, Trash2, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface FileUploadStepFormProps {
  config: FileUploadStepConfig;
  onChange: (config: FileUploadStepConfig) => void;
}

export function FileUploadStepForm({ config, onChange }: FileUploadStepFormProps) {
  const t = useTranslations();
  const isEditingFiles = useRef(false);
  const isEditingFormData = useRef(false);
  const isEditingHeaders = useRef(false);

  const [files, setFiles] = useState<Array<{ key: string; value: string }>>(
    config.files
      ? Object.entries(config.files).map(([key, value]) => ({ key, value }))
      : []
  );

  const [formData, setFormData] = useState<Array<{ key: string; value: string }>>(
    config.formData
      ? Object.entries(config.formData).map(([key, value]) => ({ key, value }))
      : []
  );

  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(
    config.headers
      ? Object.entries(config.headers).map(([key, value]) => ({ key, value }))
      : []
  );

  // Update files state when config changes (skip if user is editing)
  useEffect(() => {
    if (isEditingFiles.current) {
      return; // Don't reset flag, keep skipping
    }

    const configFiles = config.files
      ? Object.entries(config.files).map(([key, value]) => ({ key, value }))
      : [];

    setFiles(configFiles);
  }, [config.files]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update formData state when config changes (skip if user is editing)
  useEffect(() => {
    if (isEditingFormData.current) {
      return; // Don't reset flag, keep skipping
    }

    const configFormData = config.formData
      ? Object.entries(config.formData).map(([key, value]) => ({ key, value }))
      : [];

    setFormData(configFormData);
  }, [config.formData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update headers state when config changes (skip if user is editing)
  useEffect(() => {
    if (isEditingHeaders.current) {
      return; // Don't reset flag, keep skipping
    }

    const configHeaders = config.headers
      ? Object.entries(config.headers).map(([key, value]) => ({ key, value }))
      : [];

    setHeaders(configHeaders);
  }, [config.headers]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateConfig = (updates: Partial<FileUploadStepConfig>) => {
    onChange({ ...config, ...updates });
  };

  const addFile = () => {
    isEditingFiles.current = true;
    setFiles([...files, { key: "", value: "" }]);
  };

  const removeFile = (index: number) => {
    isEditingFiles.current = true;
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    updateFilesInConfig(newFiles);
  };

  const updateFile = (index: number, field: "key" | "value", value: string) => {
    isEditingFiles.current = true;
    const newFiles = [...files];
    newFiles[index][field] = value;
    setFiles(newFiles);

    // Only update config when both fields are filled or when clearing a previously filled file
    const updatedFile = newFiles[index];
    const hadBothFields = field === "key"
      ? files[index].value !== ""
      : files[index].key !== "";

    if ((updatedFile.key && updatedFile.value) || hadBothFields) {
      updateFilesInConfig(newFiles);
    }
  };

  const updateFilesInConfig = (newFiles: Array<{ key: string; value: string }>) => {
    const filesObj: Record<string, string> = {};
    newFiles.forEach(({ key, value }) => {
      if (key && value) filesObj[key] = value;
    });
    // Only update if there are valid files, otherwise keep existing or set empty object once
    if (Object.keys(filesObj).length > 0) {
      updateConfig({ files: filesObj });
    } else if (Object.keys(config.files || {}).length > 0) {
      // Only clear if there were files before
      updateConfig({ files: {} });
    }
  };

  const addFormData = () => {
    isEditingFormData.current = true;
    setFormData([...formData, { key: "", value: "" }]);
  };

  const removeFormData = (index: number) => {
    isEditingFormData.current = true;
    const newFormData = formData.filter((_, i) => i !== index);
    setFormData(newFormData);
    updateFormDataInConfig(newFormData);
  };

  const updateFormDataItem = (index: number, field: "key" | "value", value: string) => {
    isEditingFormData.current = true;
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);

    // Only update config when both fields are filled or when clearing a previously filled item
    const updatedItem = newFormData[index];
    const hadBothFields = field === "key"
      ? formData[index].value !== ""
      : formData[index].key !== "";

    if ((updatedItem.key && updatedItem.value) || hadBothFields) {
      updateFormDataInConfig(newFormData);
    }
  };

  const updateFormDataInConfig = (newFormData: Array<{ key: string; value: string }>) => {
    const formDataObj: Record<string, string> = {};
    newFormData.forEach(({ key, value }) => {
      if (key && value) formDataObj[key] = value;
    });
    // Only update if changed
    const hasFormData = Object.keys(formDataObj).length > 0;
    const hadFormData = config.formData && Object.keys(config.formData).length > 0;

    if (hasFormData) {
      updateConfig({ formData: formDataObj });
    } else if (hadFormData) {
      updateConfig({ formData: undefined });
    }
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

    // Only update config when both fields are filled or when clearing a previously filled header
    const updatedHeader = newHeaders[index];
    const hadBothFields = field === "key"
      ? headers[index].value !== ""
      : headers[index].key !== "";

    if ((updatedHeader.key && updatedHeader.value) || hadBothFields) {
      updateHeadersInConfig(newHeaders);
    }
  };

  const updateHeadersInConfig = (newHeaders: Array<{ key: string; value: string }>) => {
    const headersObj: Record<string, string> = {};
    newHeaders.forEach(({ key, value }) => {
      if (key && value) headersObj[key] = value;
    });
    // Only update if changed
    const hasHeaders = Object.keys(headersObj).length > 0;
    const hadHeaders = config.headers && Object.keys(config.headers).length > 0;

    if (hasHeaders) {
      updateConfig({ headers: headersObj });
    } else if (hadHeaders) {
      updateConfig({ headers: undefined });
    }
  };

  return (
    <div className="space-y-4">
      {/* URL and Method */}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-1">
          <Label>{t('forms.fileupload.method')}</Label>
          <Select
            value={config.method || "POST"}
            onValueChange={(value) => updateConfig({ method: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-3">
          <Label>{t('forms.fileupload.url')}</Label>
          <Input
            placeholder={t('forms.fileupload.urlPlaceholder')}
            value={config.url}
            onChange={(e) => updateConfig({ url: e.target.value })}
          />
        </div>
      </div>

      {/* Files to Upload */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t('forms.fileupload.files')}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={addFile}>
              <Plus className="h-3 w-3 mr-1" />
              {t('forms.fileupload.addButton')}
            </Button>
          </div>
          <CardDescription className="text-xs">
            {t('forms.fileupload.filesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('forms.fileupload.noFiles')}
            </p>
          ) : (
            files.map((file, index) => (
              <div key={index} className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder={t('forms.fileupload.fieldName')}
                  value={file.key}
                  onChange={(e) => updateFile(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder={t('forms.fileupload.filePath')}
                  value={file.value}
                  onChange={(e) => updateFile(index, "value", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Additional Form Data */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{t('forms.fileupload.formData')}</CardTitle>
            <Button size="sm" variant="outline" onClick={addFormData}>
              <Plus className="h-3 w-3 mr-1" />
              {t('forms.fileupload.addButton')}
            </Button>
          </div>
          <CardDescription className="text-xs">
            {t('forms.fileupload.formDataDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {formData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('forms.fileupload.noFormData')}
            </p>
          ) : (
            formData.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder={t('forms.fileupload.formDataKey')}
                  value={item.key}
                  onChange={(e) => updateFormDataItem(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder={t('forms.fileupload.formDataValue')}
                  value={item.value}
                  onChange={(e) => updateFormDataItem(index, "value", e.target.value)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFormData(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Headers */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{t('forms.fileupload.headers')}</CardTitle>
            <Button size="sm" variant="outline" onClick={addHeader}>
              <Plus className="h-3 w-3 mr-1" />
              {t('forms.fileupload.addButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {headers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t('forms.fileupload.noHeaders')}
            </p>
          ) : (
            headers.map((header, index) => (
              <div key={index} className="grid grid-cols-5 gap-2">
                <Input
                  className="col-span-2"
                  placeholder={t('forms.fileupload.headerKey')}
                  value={header.key}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                />
                <Input
                  className="col-span-2"
                  placeholder={t('forms.fileupload.headerValue')}
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
    </div>
  );
}
