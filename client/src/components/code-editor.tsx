import Editor from "@monaco-editor/react";
import { Card } from "@/components/ui/card";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({ value, onChange, readOnly = false, height = "400px" }: CodeEditorProps) {
  return (
    <Card className="overflow-hidden border">
      <Editor
        height={height}
        defaultLanguage="javascript"
        theme="vs-dark"
        value={value}
        onChange={(value) => onChange?.(value ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </Card>
  );
}
