"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Plus, Pencil, Trophy, Calendar, Hash, Tag,
  Image as ImageIcon, Upload, X, Gift, Trash2, AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Raffle } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RaffleFormProps {
  onCreated: () => void;
  editRaffle?: Raffle | null;
  onCancel?: () => void;
  onDeleted?: () => void;
}

const inputClass =
  "w-full bg-[#14161C] border border-[#1C1F27] rounded-md px-4 py-3 text-[#EDEFF4] focus:outline-none focus:border-[#2E6BFF] transition-all placeholder:text-[#262A34]";

const labelClass =
  "text-xs font-medium text-[#8A90A0] uppercase tracking-widest flex items-center gap-1";

export function RaffleForm({ onCreated, editRaffle, onCancel, onDeleted }: RaffleFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editRaffle;

  const [form, setForm] = useState({
    title: "",
    description: "",
    image_url: "",
    ticket_price: "",
    total_tickets: "",
    draw_date: "",
    code_prefix: "",
    is_free: false,
  });

  useEffect(() => {
    if (editRaffle) {
      setForm({
        title: editRaffle.title,
        description: editRaffle.description ?? "",
        image_url: editRaffle.image_url,
        ticket_price: editRaffle.is_free ? "" : String(editRaffle.ticket_price),
        total_tickets: String(editRaffle.total_tickets),
        draw_date: editRaffle.draw_date.slice(0, 16),
        code_prefix: editRaffle.code_prefix,
        is_free: editRaffle.is_free ?? false,
      });
      setImagePreview(editRaffle.image_url);
    }
  }, [editRaffle]);

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al subir imagen");
        setImagePreview(null);
        return;
      }
      set("image_url", data.url);
      toast.success("Imagen subida");
    } catch {
      toast.error("Error de conexión al subir imagen");
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.image_url || !form.total_tickets || !form.draw_date || !form.code_prefix) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    if (!form.is_free && (!form.ticket_price || parseFloat(form.ticket_price) <= 0)) {
      toast.error("Los sorteos pagados requieren un precio mayor a 0");
      return;
    }

    if (form.code_prefix.length < 2 || form.code_prefix.length > 3) {
      toast.error("El prefijo debe tener 2-3 letras");
      return;
    }

    if (uploadingImage) {
      toast.error("Espera a que termine de subir la imagen");
      return;
    }

    setLoading(true);
    try {
      const url = isEditMode ? `/api/raffles/${editRaffle!.id}` : "/api/raffles";
      const method = isEditMode ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ticket_price: form.is_free ? 0 : parseFloat(form.ticket_price),
          total_tickets: parseInt(form.total_tickets, 10),
          is_free: form.is_free,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(isEditMode ? "Sorteo actualizado" : "Sorteo creado exitosamente");
        if (!isEditMode) {
          setForm({ title: "", description: "", image_url: "", ticket_price: "", total_tickets: "", draw_date: "", code_prefix: "", is_free: false });
          setImagePreview(null);
        }
        onCreated();
        onCancel?.();
      } else {
        toast.error(data.error ?? (isEditMode ? "Error al actualizar" : "Error al crear sorteo"));
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!editRaffle) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/raffles/${editRaffle.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Sorteo "${data.deleted}" eliminado`);
        onDeleted?.();
        onCancel?.();
      } else {
        toast.error(data.error ?? "Error al eliminar sorteo");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5"
    >
      {/* ── Free raffle toggle ───────────────────────────────── */}
      <div className={cn(
        "flex items-center justify-between rounded-md p-3 border cursor-pointer transition-all",
        form.is_free
          ? "border-[#2E6BFF]/30 bg-[#2E6BFF]/5"
          : "border-[#1C1F27] bg-[#14161C]"
      )}
        onClick={() => set("is_free", !form.is_free)}
      >
        <div className="flex items-center gap-3">
          <Gift className={cn("w-4 h-4", form.is_free ? "text-[#2E6BFF]" : "text-[#8A90A0]")} />
          <div>
            <p className={cn("text-sm font-semibold", form.is_free ? "text-[#2E6BFF]" : "text-[#EDEFF4]")}
               style={{ fontFamily: "var(--font-display)" }}>
              Sorteo gratuito
            </p>
            <p className="text-xs text-[#8A90A0]">
              Sin costo · Máx. 1 ticket por persona
            </p>
          </div>
        </div>
        <div className={cn(
          "w-10 h-5 rounded-full relative transition-all duration-200",
          form.is_free ? "bg-[#2E6BFF]" : "bg-[#1C1F27]"
        )}>
          <div className={cn(
            "absolute top-0.5 w-4 h-4 rounded-full bg-[#EDEFF4] shadow transition-all duration-200",
            form.is_free ? "left-5" : "left-0.5"
          )} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>
            <Trophy className="w-3 h-3" />
            Nombre del premio *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="iPhone 16 Pro Max 256GB"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe el premio..."
            rows={3}
            className={inputClass + " resize-none"}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className={labelClass}>
            <ImageIcon className="w-3 h-3" />
            Imagen del premio *
          </label>

          {imagePreview ? (
            <div className="relative rounded-md overflow-hidden border border-[#1C1F27] bg-[#14161C]">
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 bg-[#08090C]/70 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#2E6BFF] animate-spin" />
                  <span className="text-[#2E6BFF] text-sm">Subiendo...</span>
                </div>
              )}
              {!uploadingImage && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); set("image_url", ""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-[#08090C]/80 text-[#8A90A0] hover:text-[#EDEFF4] rounded-full p-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#1C1F27] hover:border-[#2E6BFF]/40 bg-[#14161C] rounded-md py-8 transition-all duration-200 text-[#8A90A0] hover:text-[#2E6BFF]"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm">Haz clic para seleccionar imagen</span>
              <span className="text-xs text-[#8A90A0]/50">PNG, JPG, WEBP</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
            className="hidden"
          />
        </div>

        {/* Price — hidden when free */}
        {!form.is_free && (
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              <Tag className="w-3 h-3" />
              Precio por ticket (S/.) *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.ticket_price}
              onChange={(e) => set("ticket_price", e.target.value)}
              placeholder="5.00"
              className={inputClass}
            />
          </div>
        )}

        <div className={cn("flex flex-col gap-2", form.is_free && "sm:col-span-1")}>
          <label className={labelClass}>
            <Hash className="w-3 h-3" />
            Total de tickets *
          </label>
          <input
            type="number"
            min="1"
            value={form.total_tickets}
            onChange={(e) => set("total_tickets", e.target.value)}
            placeholder="500"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            <Calendar className="w-3 h-3" />
            Fecha del sorteo *
          </label>
          <input
            type="datetime-local"
            value={form.draw_date}
            onChange={(e) => set("draw_date", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Prefijo de tickets (2-3 letras){!isEditMode && " *"}</label>
          <input
            type="text"
            maxLength={3}
            value={form.code_prefix}
            onChange={(e) => set("code_prefix", e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            placeholder="DTM"
            disabled={isEditMode}
            className={inputClass + " uppercase tracking-widest" + (isEditMode ? " opacity-50 cursor-not-allowed" : "")}
            style={{ fontFamily: "var(--font-mono-code)" }}
          />
          {form.code_prefix && !isEditMode && (
            <p
              className="text-xs text-[#8A90A0]"
              style={{ fontFamily: "var(--font-mono-code)" }}
            >
              Preview: {form.code_prefix}-0001-X7K
            </p>
          )}
          {isEditMode && (
            <p className="text-xs text-[#8A90A0]">El prefijo no puede cambiar (protege tickets existentes).</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full flex items-center justify-center gap-2 bg-[#2E6BFF] text-[#EDEFF4] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#4F7FFF] disabled:opacity-50 tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEditMode ? (
            <Pencil className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {loading
            ? isEditMode ? "Guardando..." : "Creando..."
            : isEditMode ? "Guardar cambios" : "Crear sorteo"}
        </button>

        {isEditMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 border border-[#1C1F27] text-[#8A90A0] text-sm rounded-md py-2.5 transition-all hover:border-[#262A34] hover:text-[#EDEFF4]"
          >
            Cancelar
          </button>
        )}

        {/* ── Delete button (edit mode only) ─────────────────── */}
        {isEditMode && (
          <div className="mt-2 border-t border-[#1C1F27] pt-4">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 border border-[#7C2D2D]/40 text-[#7C2D2D] text-sm rounded-md py-2.5 transition-all hover:border-[#7C2D2D] hover:bg-[#7C2D2D]/5"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar sorteo
              </button>
            ) : (
              <div className="rounded-md border border-[#7C2D2D]/40 bg-[#7C2D2D]/5 p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#7C2D2D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#EDEFF4]" style={{ fontFamily: "var(--font-display)" }}>
                      ¿Eliminar este sorteo?
                    </p>
                    <p className="text-xs text-[#8A90A0] mt-1 leading-relaxed">
                      Se eliminarán también todos los tickets y compras asociados. Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 border border-[#1C1F27] text-[#8A90A0] text-sm rounded-md py-2 transition-all hover:text-[#EDEFF4]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#7C2D2D] text-[#EDEFF4] text-sm font-semibold rounded-md py-2 transition-all hover:bg-[#9B2C2C] disabled:opacity-60"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deleting ? "Eliminando..." : "Sí, eliminar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.form>
  );
}
