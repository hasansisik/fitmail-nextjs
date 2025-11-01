"use client"

import { useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Type,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = "Mail içeriğinizi yazın..." }: RichTextEditorProps) {
  const [editorState, setEditorState] = useState(0)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Ensure heading extension is enabled with all levels
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Ensure list extensions are enabled
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'my-1',
          },
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      setEditorState(Date.now()) // Force re-render
    },
    onSelectionUpdate: ({ editor }) => {
      setEditorState(Date.now()) // Force re-render on selection change
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:text-muted-foreground [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-2 [&_h4]:text-lg [&_h4]:font-bold [&_h4]:my-2 [&_h5]:text-base [&_h5]:font-bold [&_h5]:my-2 [&_h6]:text-sm [&_h6]:font-bold [&_h6]:my-2",
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false,
    children,
    title
  }: { 
    onClick: (e?: any) => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title?: string
  }) => (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0 transition-colors",
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {children}
    </Button>
  )

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/30">
        {/* Formatting */}
        <ToolbarButton
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
            setEditorState(Date.now())
          }}
          isActive={editor.isActive("bold")}
          title="Kalın (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
            setEditorState(Date.now())
          }}
          isActive={editor.isActive("italic")}
          title="İtalik (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleUnderline().run()
            setEditorState(Date.now())
          }}
          isActive={editor.isActive("underline")}
          title="Altı Çizili (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBulletList().run()
            setEditorState(Date.now())
          }}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleOrderedList().run()
            setEditorState(Date.now())
          }}
          isActive={editor.isActive("orderedList")}
          title="Numaralı Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Alignment Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={editor.isActive({ textAlign: "left" }) || editor.isActive({ textAlign: "center" }) || editor.isActive({ textAlign: "right" }) || editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 gap-1"
              onClick={(e) => e.preventDefault()}
            >
              {editor.isActive({ textAlign: "left" }) && <AlignLeft className="h-4 w-4" />}
              {editor.isActive({ textAlign: "center" }) && <AlignCenter className="h-4 w-4" />}
              {editor.isActive({ textAlign: "right" }) && <AlignRight className="h-4 w-4" />}
              {editor.isActive({ textAlign: "justify" }) && <AlignJustify className="h-4 w-4" />}
              {!editor.isActive({ textAlign: "left" }) && !editor.isActive({ textAlign: "center" }) && !editor.isActive({ textAlign: "right" }) && !editor.isActive({ textAlign: "justify" }) && <AlignLeft className="h-4 w-4" />}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                editor.chain().focus().setTextAlign("left").run()
                setEditorState(Date.now())
              }}
              className={editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""}
            >
              <AlignLeft className="mr-2 h-4 w-4" />
              <span>Sola Hizala</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                editor.chain().focus().setTextAlign("center").run()
                setEditorState(Date.now())
              }}
              className={editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""}
            >
              <AlignCenter className="mr-2 h-4 w-4" />
              <span>Ortala</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                editor.chain().focus().setTextAlign("right").run()
                setEditorState(Date.now())
              }}
              className={editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}
            >
              <AlignRight className="mr-2 h-4 w-4" />
              <span>Sağa Hizala</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                editor.chain().focus().setTextAlign("justify").run()
                setEditorState(Date.now())
              }}
              className={editor.isActive({ textAlign: "justify" }) ? "bg-accent" : ""}
            >
              <AlignJustify className="mr-2 h-4 w-4" />
              <span>İki Yanlı Hizala</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().undo().run()
            setEditorState(Date.now())
          }}
          disabled={!editor.can().undo()}
          title="Geri Al (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().redo().run()
            setEditorState(Date.now())
          }}
          disabled={!editor.can().redo()}
          title="Yinele (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        {/* Font Size / Headings */}
        <div className="flex items-center gap-1 ml-2">
          <Type className="h-4 w-4" />
          <select
            value={
              editor.isActive("heading", { level: 1 }) ? "1" :
              editor.isActive("heading", { level: 2 }) ? "2" :
              editor.isActive("heading", { level: 3 }) ? "3" :
              editor.isActive("heading", { level: 4 }) ? "4" :
              editor.isActive("heading", { level: 5 }) ? "5" :
              editor.isActive("heading", { level: 6 }) ? "6" : ""
            }
            onChange={(e) => {
              const value = e.target.value
              if (value === "") {
                editor.chain().focus().setParagraph().run()
              } else {
                editor.chain().focus().toggleHeading({ level: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
              }
              setEditorState(Date.now())
            }}
            className="h-8 px-2 text-sm "
          >
            <option value="">Normal</option>
            <option value="1">Başlık 1</option>
            <option value="2">Başlık 2</option>
            <option value="3">Başlık 3</option>
            <option value="4">Başlık 4</option>
            <option value="5">Başlık 5</option>
            <option value="6">Başlık 6</option>
          </select>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="min-h-[200px] overflow-y-auto max-h-[300px]"
        />
      </div>
    </div>
  )
}

