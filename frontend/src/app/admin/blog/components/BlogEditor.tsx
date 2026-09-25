"use client";

import { Button } from "@/components/ui/button";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

const fontOptions: Array<{ label: string; value: string }> = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  {
    label: "Bangla",
    value: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
  },
];

export function BlogEditor({
  value,
  onChange,
  onUploadImage,
}: BlogEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Image.configure({ inline: false }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    onUpdate: ({ editor: activeEditor }) => {
      onChange(activeEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-72 rounded-b-xl border border-t-0 border-border bg-background p-4 focus:outline-none prose max-w-none text-foreground",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  const applyLink = () => {
    if (!editor) return;

    const existingHref = editor.getAttributes("link").href as
      | string
      | undefined;
    const url = window.prompt("Enter link URL", existingHref || "https://");

    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const insertImage = async () => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const selectedFile = input.files?.[0];
      if (!selectedFile) return;

      const uploadedUrl = await onUploadImage(selectedFile);
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
    };

    input.click();
  };

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap gap-2 border-b border-border p-3 bg-muted/40 rounded-t-xl">
        <select
          className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:border-primary"
          onChange={(event) => {
            const selected = event.target.value;
            if (!selected) {
              editor.chain().focus().unsetMark("textStyle").run();
              return;
            }

            editor
              .chain()
              .focus()
              .setMark("textStyle", { fontFamily: selected })
              .run();
          }}
          defaultValue=""
        >
          {fontOptions.map((font) => (
            <option key={font.label} value={font.value} className="bg-background text-foreground">
              {font.label}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={applyLink}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={insertImage}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-9 p-0 bg-background border-border text-foreground hover:bg-muted"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
