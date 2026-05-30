import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Topbar } from "@/components/nav/topbar";
import { Footer } from "@/components/nav/footer";
import { ParticiparContent } from "./participar-content";

export const metadata = {
  title: "Participar | ManiaPremios",
};

export default function ParticiparPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#2E6BFF] animate-spin" />
          </main>
        }
      >
        <ParticiparContent />
      </Suspense>
      <Footer />
    </div>
  );
}
