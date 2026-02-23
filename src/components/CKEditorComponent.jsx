import React, { useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { adminBlogService } from '../features/blog/services/adminBlogService';
import toast from 'react-hot-toast';

const CKEditorComponent = ({ value, onChange, placeholder = 'محتوای خود را وارد کنید...' }) => {
    const editorRef = useRef(null);

    // تنظیمات CKEditor
    const editorConfiguration = {
        language: 'fa',
        placeholder,
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                '|',
                'link',
                'bulletedList',
                'numberedList',
                '|',
                'outdent',
                'indent',
                '|',
                'imageUpload',
                'blockQuote',
                'insertTable',
                'mediaEmbed',
                '|',
                'undo',
                'redo',
                '|',
                'alignment',
                'fontSize',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'code',
                'codeBlock',
                'horizontalLine',
                'specialCharacters'
            ],
            shouldNotGroupWhenFull: true
        },
        heading: {
            options: [
                { model: 'paragraph', title: 'پاراگراف', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'عنوان 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'عنوان 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'عنوان 3', class: 'ck-heading_heading3' },
                { model: 'heading4', view: 'h4', title: 'عنوان 4', class: 'ck-heading_heading4' }
            ]
        },
        image: {
            toolbar: [
                'imageTextAlternative',
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                '|',
                'toggleImageCaption',
                'linkImage'
            ],
            styles: [
                'full',
                'side',
                'alignLeft',
                'alignCenter',
                'alignRight'
            ]
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableCellProperties',
                'tableProperties'
            ]
        },
        link: {
            decorators: {
                openInNewTab: {
                    mode: 'manual',
                    label: 'باز شدن در تب جدید',
                    attributes: {
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    }
                }
            }
        },
        // تنظیمات آپلود تصویر
        simpleUpload: {
            uploadUrl: '/api/admin/blog/upload-image',
            withCredentials: true,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    };

    // Custom upload adapter برای آپلود تصاویر
    function CustomUploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new CustomUploadAdapter(loader);
        };
    }

    class CustomUploadAdapter {
        constructor(loader) {
            this.loader = loader;
        }

        upload() {
            return this.loader.file.then(file => new Promise(async (resolve, reject) => {
                try {
                    // استفاده از سرویس آپلود موجود
                    const result = await adminBlogService.uploadImage(file);

                    if (result && result.imageUrl) {
                        resolve({
                            default: result.imageUrl
                        });
                        toast.success('تصویر با موفقیت آپلود شد');
                    } else {
                        reject('خطا در آپلود تصویر');
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('خطا در آپلود تصویر');
                    reject(error);
                }
            }));
        }

        abort() {
            // پیاده‌سازی لغو آپلود در صورت نیاز
        }
    }

    return (
        <div className="ckeditor-wrapper" dir="rtl">
            <CKEditor
                editor={ClassicEditor}
                config={{
                    ...editorConfiguration,
                    extraPlugins: [CustomUploadAdapterPlugin]
                }}
                data={value || ''}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
                onReady={(editor) => {
                    editorRef.current = editor;
                }}
            />

            <style jsx>{`
                .ckeditor-wrapper {
                    direction: rtl;
                }
                
                .ckeditor-wrapper .ck-editor__editable {
                    min-height: 300px;
                    max-height: 600px;
                    direction: rtl;
                    text-align: right;
                }
                
                .ckeditor-wrapper .ck.ck-editor__main > .ck-editor__editable {
                    background-color: white;
                    border-radius: 0 0 0.75rem 0.75rem;
                }
                
                .dark .ckeditor-wrapper .ck.ck-editor__main > .ck-editor__editable {
                    background-color: rgb(30 41 59);
                    color: white;
                }
                
                .ckeditor-wrapper .ck.ck-toolbar {
                    border-radius: 0.75rem 0.75rem 0 0;
                    background-color: rgb(248 250 252);
                }
                
                .dark .ckeditor-wrapper .ck.ck-toolbar {
                    background-color: rgb(51 65 85);
                    border-color: rgb(71 85 105);
                }
                
                .ckeditor-wrapper .ck.ck-editor__editable:not(.ck-editor__nested-editable).ck-focused {
                    border-color: rgb(99 102 241);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                
                /* استایل برای تصاویر داخل ادیتور */
                .ckeditor-wrapper .ck-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }
                
                /* استایل برای لینک‌ها */
                .ckeditor-wrapper .ck-content a {
                    color: rgb(99 102 241);
                    text-decoration: underline;
                }
                
                .dark .ckeditor-wrapper .ck-content a {
                    color: rgb(129 140 248);
                }
                
                /* استایل برای جداول */
                .ckeditor-wrapper .ck-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1rem 0;
                }
                
                .ckeditor-wrapper .ck-content table td,
                .ckeditor-wrapper .ck-content table th {
                    border: 1px solid rgb(226 232 240);
                    padding: 0.5rem;
                }
                
                .dark .ckeditor-wrapper .ck-content table td,
                .dark .ckeditor-wrapper .ck-content table th {
                    border-color: rgb(71 85 105);
                }
                
                /* استایل برای کدها */
                .ckeditor-wrapper .ck-content code {
                    background-color: rgb(241 245 249);
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-family: 'Courier New', monospace;
                }
                
                .dark .ckeditor-wrapper .ck-content code {
                    background-color: rgb(51 65 85);
                }
                
                .ckeditor-wrapper .ck-content pre {
                    background-color: rgb(241 245 249);
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 1rem 0;
                }
                
                .dark .ckeditor-wrapper .ck-content pre {
                    background-color: rgb(51 65 85);
                }
            `}</style>
        </div>
    );
};

export default CKEditorComponent;
