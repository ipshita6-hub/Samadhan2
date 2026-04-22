import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link'
];

export default function RichTextEditor({ value, onChange, placeholder, disabled, className = "" }) {
  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        theme="snow"
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-size: 14px;
          min-height: 120px;
        }
        .rich-text-editor .ql-editor {
          min-height: 120px;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #f9fafb;
        }
        .dark .rich-text-editor .ql-toolbar {
          background: #374151;
          border-color: #4b5563;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #4b5563;
          background: #1f2937;
          color: #f9fafb;
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
        }
        .dark .rich-text-editor .ql-stroke {
          stroke: #9ca3af;
        }
        .dark .rich-text-editor .ql-fill {
          fill: #9ca3af;
        }
        .dark .rich-text-editor .ql-picker-label {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
