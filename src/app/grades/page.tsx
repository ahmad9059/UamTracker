import { GradesReference } from "@/components/grades-reference";
import { Footer, Navbar } from "@/components/landing";

export default function GradesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        <GradesReference />
      </main>
      <Footer />
    </div>
  );
}
