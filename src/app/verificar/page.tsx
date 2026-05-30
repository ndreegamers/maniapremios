import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Topbar } from "@/components/nav/topbar";
import { Footer } from "@/components/nav/footer";
import { VerificarContent } from "./verificar-content";

export const metadata = {
  title: "Verificar tickets | ManiaPremios",
};

export default function VerificarPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#C9A961] animate-spin" />
          </main>
        }
      >
        <VerificarContent />
      </Suspense>
      <Footer />
    </div>
  );
}
