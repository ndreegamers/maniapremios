import { Topbar } from "@/components/nav/topbar";
import { Footer } from "@/components/nav/footer";
import { GanadoresContent } from "./ganadores-content";

export const metadata = {
  title: "Ganadores | ManiaPremios",
};

export default function GanadoresPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <GanadoresContent />
      <Footer />
    </div>
  );
}
