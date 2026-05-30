"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Plus, Pencil, Trophy, Calendar, Hash, Tag,
  Image as ImageIcon, Upload, X
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Raffle } from "@/lib/types";

interface RaffleFormProps {
  onCreated: () => void;
  editRaffle?: Raffle | null;
  onCancel?: () => void;
}

const inputClass =
  "w-full bg-[#15151A] border border-[#2A2A33] rounded-md px-4 py-3 text-[#F5F5F0] focus:outline-none focus:border-[#C9A961] transition-all placeholder:text-[#3D3D48]";

const labelClass =
  "text-xs font-medium text-[#A0A0A8] uppercase tracking-widest flex items-center gap-1";

export function RaffleForm({ onCreated, editRaffle, onCancel }: RaffleFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  });

  useEffect(() => {
    if (editRaffle) {
      setForm({
        title: editRaffle.title,
        description: editRaffle.description ?? "",
        image_url: editRaffle.image_url,
        ticket_price: String(editRaffle.ticket_price),
        total_tickets: String(editRaffle.total_tickets),
        draw_date: editRaffle.draw_date.slice(0, 16),
        code_prefix: editRaffle.code_prefix,
      });
      setImagePreview(editRaffle.image_url);
    }
  }, [editRaffle]);

  function set(field: string, value: string) {
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

    if (!form.title || !form.image_url || !form.ticket_price || !form.total_tickets || !form.draw_date || !form.code_prefix) {
      toast.error("Completa todos los campos requeridos");
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
          ticket_price: parseFloat(form.ticket_price),
          total_tickets: parseInt(form.total_tickets, 10),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(isEditMode ? "Sorteo actualizado" : "Sorteo creado exitosamente");
        if (!isEditMode) {
          setForm({ title: "", description: "", image_url: "", ticket_price: "", total_tickets: "", draw_date: "", code_prefix: "" });
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

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5"
    >
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
            <div className="relative rounded-md overflow-hidden border border-[#2A2A33] bg-[#15151A]">
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
                <div className="absolute inset-0 bg-[#0B0B0D]/70 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-[#C9A961] animate-spin" />
                  <span className="text-[#C9A961] text-sm">Subiendo...</span>
                </div>
              )}
              {!uploadingImage && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); set("image_url", ""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-[#0B0B0D]/80 text-[#A0A0A8] hover:text-[#F5F5F0] rounded-full p-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#2A2A33] hover:border-[#C9A961]/40 bg-[#15151A] rounded-md py-8 transition-all duration-200 text-[#A0A0A8] hover:text-[#C9A961]"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm">Haz clic para seleccionar imagen</span>
              <span className="text-xs text-[#A0A0A8]/50">PNG, JPG, WEBP</span>
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

        <div className="flex flex-col gap-2">
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
              className="text-xs text-[#A0A0A8]"
              style={{ fontFamily: "var(--font-mono-code)" }}
            >
              Preview: {form.code_prefix}-0001-X7K
            </p>
          )}
          {isEditMode && (
            <p className="text-xs text-[#A0A0A8]">El prefijo no puede cambiar (protege tickets existentes).</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full flex items-center justify-center gap-2 bg-[#C9A961] text-[#0B0B0D] font-semibold text-sm rounded-md py-3 transition-all hover:bg-[#E8D08B] disabled:opacity-50"
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
            className="w-full flex items-center justify-center gap-2 border border-[#2A2A33] text-[#A0A0A8] text-sm rounded-md py-2.5 transition-all hover:border-[#3D3D48] hover:text-[#F5F5F0]"
          >
            Cancelar
          </button>
        )}
      </div>
    </motion.form>
  );
}
