"use client";

import { useRef } from "react";

const ACCENT_COLOR = "#b45309";
const ACCENT_COLOR_RGB = "rgb(180, 83, 9)";
// Mismo color que ya pinta el texto por defecto del editor (className
// text-gray-900 más abajo): "quitar" el color acá significa volver a este.
const DEFAULT_TEXT_COLOR = "#111827";

/**
 * Editor de texto enriquecido chico para la descripción de un modelo
 * (009-modelos-producto-fijo): negrita/cursiva/subrayado/color/alineación/
 * lista, sobre un `contentEditable` — sin agregar una librería nueva
 * (Principio I), ya que `document.execCommand` alcanza para este set fijo
 * de comandos. El HTML que produce se sanea en el servidor al guardar
 * (`lib/media/sanitize-html.ts`), nunca se confía en él tal cual.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  editorKey,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Fuerza un remount al cambiar (p. ej. al alternar ES/EN) para no pelear
   * con React por el contenido de un `contentEditable` mientras se escribe. */
  editorKey: string | number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function exec(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  // El botón de color es un interruptor: si la selección ya está en el
  // color de acento, lo vuelve a quitar (al color de texto por defecto) en
  // vez de solo poder aplicarlo y quedar sin forma de sacarlo.
  function toggleColor() {
    ref.current?.focus();
    const current = document.queryCommandValue("forecolor");
    const isAccent = current === ACCENT_COLOR_RGB || current === ACCENT_COLOR;
    document.execCommand("foreColor", false, isAccent ? DEFAULT_TEXT_COLOR : ACCENT_COLOR);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  // Subtítulo (H3): interruptor por bloque — si la línea actual ya es un
  // H3, la vuelve a párrafo normal; si no, la convierte en H3. No se ofrecen
  // H1/H2 a propósito: dentro de una descripción de producto ya son
  // demasiado grandes, "hasta H3" alcanza para un subtítulo.
  function toggleHeading() {
    ref.current?.focus();
    const current = document.queryCommandValue("formatBlock").toLowerCase();
    document.execCommand("formatBlock", false, current === "h3" ? "p" : "h3");
    if (ref.current) onChange(ref.current.innerHTML);
  }

  // Pegar siempre como texto plano: lo que se copia de otro lado (Word, un
  // sitio, otro editor) trae su propio HTML con estilos en línea (fondo,
  // fuente, color) que no tienen por qué combinar con el resto de la
  // descripción — de ahí el fondo negro al pegar. Se descarta ese HTML y se
  // inserta solo el texto, igual que ya haría un <textarea> plano.
  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div className="rounded border border-gray-300 focus-within:border-brand">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-1.5 py-1">
        <ToolbarButton onClick={() => exec("bold")} title="Bold">
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} title="Italic">
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} title="Underline">
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton onClick={toggleColor} title="Text color">
          <span className="block h-3 w-3 rounded-full bg-[#b45309]" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarButton onClick={toggleHeading} title="Subtitle (H3)">
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <ToolbarButton onClick={() => exec("justifyLeft")} title="Align left">
          <span className="material-symbols-outlined text-base">format_align_left</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyCenter")} title="Align center">
          <span className="material-symbols-outlined text-base">format_align_center</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Bulleted list">
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
        </ToolbarButton>
      </div>
      <div
        key={editorKey}
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        onPaste={handlePaste}
        className="min-h-[120px] px-3 py-2 text-sm text-gray-900 outline-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] [&_h3]:my-1 [&_h3]:text-base [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:py-1 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:py-1 [&_ul]:pl-5"
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-gray-700 hover:bg-gray-100"
    >
      {children}
    </button>
  );
}
