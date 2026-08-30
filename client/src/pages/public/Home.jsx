import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import Hero from "../../components/common/Hero";
import WhyTutor from "../../components/common/WhyTutor";
import HowItWorks from "../../components/common/HowItWorks";
import ForStudents from "../../components/common/ForStudents";
import ForTutors from "../../components/common/ForTutors";
import ForInstitutions from "../../components/common/ForInstitutions";
import TrustSection from "../../components/common/TrustSection";
import FinalCTA from "../../components/common/FinalCTA";  

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <Hero />
        <WhyTutor />
        <HowItWorks />
        <ForStudents />
        <ForTutors />
        <ForInstitutions />
        <TrustSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}

export default Home;