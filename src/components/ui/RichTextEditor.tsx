import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { 
  Bold, Italic, Strikethrough, Heading2, Heading3, 
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, 
  Quote, Undo, Redo 
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước file vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert("Chỉ hỗ trợ định dạng JPG, PNG hoặc WebP.");
      return;
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `posts/content_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Có thể thêm state progress bar nếu cần
      },
      (error) => {
        console.error("Lỗi upload ảnh:", error);
        alert("Upload ảnh thất bại. Vui lòng thử lại.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        editor.chain().focus().setImage({ src: downloadURL }).run();
      }
    );
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [editor]);

  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl sticky top-0 z-10">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg ${editor.isActive('bold') ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="In đậm"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg ${editor.isActive('italic') ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="In nghiêng"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-lg ${editor.isActive('strike') ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="Gạch ngang"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="Tiêu đề 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-lg ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="Tiêu đề 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg ${editor.isActive('bulletList') ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="Danh sách"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg ${editor.isActive('orderedList') ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="Danh sách số"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded-lg ${editor.isActive('blockquote') ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="Trích dẫn"
      >
        <Quote className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded-lg ${editor.isActive('link') ? 'bg-gray-200 text-[#4A2C2C]' : 'hover:bg-gray-200 text-gray-600'}`}
        title="Chèn Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
        title="Chèn ảnh"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <input 
        type="file" 
        accept="image/jpeg, image/png, image/webp"
        onChange={handleImageUpload}
        ref={fileInputRef}
        className="hidden"
      />

      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
        title="Hoàn tác"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
        title="Làm lại"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  )
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#F4B5C6] underline hover:text-[#4A2C2C]',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto p-4 custom-scrollbar',
      },
    },
  });

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-[#F4B5C6] focus-within:ring-1 focus-within:ring-[#F4B5C6] transition-colors">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
