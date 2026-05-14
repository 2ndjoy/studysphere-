import {
    useEditor,
    EditorContent,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

function NoteEditor({
    content,
    setContent,
}) {

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],

        content,

        editorProps: {
            attributes: {
                class:
                    "min-h-[250px] bg-[#0f172a] border border-white/10 rounded-2xl p-5 outline-none prose prose-invert max-w-none",
            },
        },

        onUpdate({
            editor,
        }) {
            setContent(
                editor.getHTML()
            );
        },
    });


    if (!editor) {
        return null;
    }


    return (
        <div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-4">

                <button
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleBold()
                            .run()
                    }
                    className="bg-[#1e293b] hover:bg-[#334155] transition px-4 py-2 rounded-xl"
                >
                    Bold
                </button>

                <button
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleItalic()
                            .run()
                    }
                    className="bg-[#1e293b] hover:bg-[#334155] transition px-4 py-2 rounded-xl"
                >
                    Italic
                </button>

                <button
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({
                                level: 1,
                            })
                            .run()
                    }
                    className="bg-[#1e293b] hover:bg-[#334155] transition px-4 py-2 rounded-xl"
                >
                    H1
                </button>

                <button
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleBulletList()
                            .run()
                    }
                    className="bg-[#1e293b] hover:bg-[#334155] transition px-4 py-2 rounded-xl"
                >
                    List
                </button>

            </div>


            {/* Editor */}
            <EditorContent
                editor={editor}
            />

        </div>
    );
}

export default NoteEditor;