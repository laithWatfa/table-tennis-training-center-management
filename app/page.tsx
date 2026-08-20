export const dynamic = "force-dynamic";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen ">
      <Hero/>
      <AboutUs/>
      <ContactUs/>
      
    </div>
  );
}
