import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Posts } from "@/components/posts";
import { Projects } from "@/components/projects";
import { TechStack } from "@/components/tech-stack";
import { WorkExperience } from "@/components/work-experience";
import { Reading } from "@/components/reading-journal";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-6 pt-28">
        <Hero />
        <div className="border-t border-border/50">
          <Posts />
          <Projects />
          <TechStack />
          <WorkExperience />
          <Reading />
        </div>
        <Footer />
      </main>
    </>
  );
}
