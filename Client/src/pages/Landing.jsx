import Hero from "../components/landing/Hero.jsx";
import TrainingClips from "../components/landing/TrainingClips.jsx";
import Benefits from "../components/landing/Benefits.jsx";
import FeaturedCourses from "../components/landing/FeaturedCourses.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import CoachIntro from "../components/landing/CoachIntro.jsx";
import Testimonials from "../components/landing/Testimonials.jsx";
import Faq from "../components/landing/Faq.jsx";
import FinalCta from "../components/landing/FinalCta.jsx";
import EnquiryForm from "../components/forms/EnquiryForm.jsx";
import Booking from "../components/landing/Booking.jsx";


export default function Landing() {
  return (
    <main>
      <Hero />
      <TrainingClips />
      <Benefits />
      <FeaturedCourses />
      <HowItWorks />
      <CoachIntro />
      <Testimonials />
      <Faq />
      <Booking/>
      <EnquiryForm />
      <FinalCta />
    </main>
  );
}