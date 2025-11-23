import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Heading1, Heading2 } from 'lucide-react';

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('آدرس تصویر را وارد کنید:');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('آدرس لینک:', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    // استایل دکمه‌ها
    const btnClass = (isActive) =>
        `p-2 rounded-lg transition-all ${isActive ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-xl">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}><Bold size={18}/></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}><Italic size={18}/></button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}><Heading1 size={18}/></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}><Heading2 size={18}/></button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}><List size={18}/></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}><ListOrdered size={18}/></button>
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <button onClick={setLink} className={btnClass(editor.isActive('link'))}><LinkIcon size={18}/></button>
            <button onClick={addImage} className={btnClass(false)}><ImageIcon size={18}/></button>
            <div className="flex-grow"></div>
            <button onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}><Undo size={18}/></button>
            <button onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}><Redo size={18}/></button>
        </div>
    );
};

const Editor = ({ value, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Image
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none p-4 min-h-[200px] outline-none text-slate-700',
            },
        },
    });

    // آپدیت محتوا وقتی فرم ریست می‌شود
    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default Editor;