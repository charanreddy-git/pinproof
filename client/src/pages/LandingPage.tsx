import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MarketingHeader, MarketingFooter, Button, FaqAccordion, MapPinIcon, ShieldCheckIcon, CameraIcon, CheckIcon, NavigationIcon } from "../components";
import { REQUESTER_SERVICES } from "../content/marketing";
import { useAuth } from "../contexts";
import "./landing.css";

const NAV_ITEMS = [
  { label: "Our services", to: "#visits", isAnchor: true },
  { label: "How it works", to: "#how-it-works", isAnchor: true },
  { label: "Pricing", to: "#pricing", isAnchor: true },
  { label: "For inspectors", to: "/captain" },
];

const FAQS = [
  {
    q: "How do I know the photo is from my property?",
    a: "The inspector’s device must report a location within 100 m of your pin. We save the photo, submission GPS, and capture method. Camera capture time is device-reported; an uploaded photo’s original time and location are not verified.",
  },
  {
    q: "How quickly can someone visit?",
    a: "Most requests are accepted within a few hours. Timing depends on inspector availability and property access. Track the status in your account.",
  },
  {
    q: "Can I follow the inspector on the way?",
    a: "Yes. Once the inspector accepts and starts the visit, a live tracking link appears in your dashboard and updates automatically.",
  },
  {
    q: "Do I need to download an app?",
    a: "No. PinProof works in your browser on phone, tablet, or desktop. Inspectors capture proof in the same browser flow.",
  },
];

const PLANS = [
  {
    name: "Standard visit",
    price: "999",
    tagline: "A clear look at the property",
    note: "Exterior photo and location check",
    features: [
      "GPS-checked exterior photo",
      "Submission GPS and capture method",
      "Private report in your dashboard",
    ],
    popular: false,
  },
  {
    name: "Detailed visit",
    price: "2,499",
    tagline: "A closer check, room by room",
    note: "Custom inspection notes",
    features: [
      "Everything in the Standard visit",
      "Custom checklist followed on site",
      "Your inspection notes shared with the inspector",
    ],
    popular: true,
  },
];

export function LandingPage() {
  const [visitType, setVisitType] = useState(REQUESTER_SERVICES[0].title);
  const navigate = useNavigate();
  const { user } = useAuth();
  const bookingPath = (type: string) => {
    const plan = type === "Detailed visit" ? "DETAILED" : "STANDARD";
    const category = type.endsWith(" visit") ? visitType : type;
    const destination = `/user/create-task?propertyType=${encodeURIComponent(category)}&plan=${plan}`;
    return user?.role === "USER" ? destination : `/verify/signup?returnTo=${encodeURIComponent(destination)}`;
  };
  const startBooking = (event: FormEvent) => {
    event.preventDefault();
    navigate(bookingPath(visitType));
  };

  return (
    <div className="pinproof-home">
      <MarketingHeader navItems={NAV_ITEMS} ctaLabel="Book a visit" ctaTo={bookingPath(visitType)} />
      <main id="main-content">
        <section className="visit-hero">
          <div className="home-container hero-layout">
            <div className="hero-copy">
              <h1>Your property.<br />Checked for you.</h1>
              <p>A local inspector visits your property and sends you GPS-checked photos. You stay right where you are.</p>
              <form className="quick-book" onSubmit={startBooking}>
                <label htmlFor="visit-type">What would you like checked?</label>
                <div className="visit-type-field">
                  <MapPinIcon size={23} />
                  <select id="visit-type" value={visitType} onChange={(event) => setVisitType(event.target.value)}>
                    {REQUESTER_SERVICES.map((service) => <option key={service.title}>{service.title}</option>)}
                  </select>
                </div>
                <Button type="submit" size="lg" className="w-full">Book a property visit</Button>
                <p>Choose your property, set the pin, and we’ll take it from there.</p>
              </form>
            </div>
            <div className="hero-property">
              <img src="/property-960.webp" srcSet="/property-480.webp 480w, /property-960.webp 960w" sizes="(max-width: 639px) calc(100vw - 40px), 510px" width={960} height={960} alt="Example exterior of a property that could be checked during a visit" fetchPriority="high" />
              <div className="property-caption"><CameraIcon size={18} /><span>Example property photo</span></div>
              <div className="proof-receipt">
                <span className="proof-receipt-icon"><ShieldCheckIcon size={28} /></span>
                <div><strong>A real visit. Proof you can keep.</strong><span>Photo, GPS location and time in one place.</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="visits" className="home-section home-container">
          <h2 className="home-heading">What can we check for you?</h2>
          <div className="service-choices">
            {REQUESTER_SERVICES.map(({ icon: Icon, title, desc }) => (
              <Link key={title} to={bookingPath(title)} className="service-choice">
                <span className="service-picture"><Icon size={42} /></span>
                <h3>{title}</h3><p>{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="how-section">
          <div className="home-container home-section">
            <h2 className="home-heading">A visit, without the trip.</h2>
            <div className="visit-steps">
              {[
                { icon: MapPinIcon, title: "Pin your property", text: "Share a Google Maps link or drop a pin. Tell the inspector what you want checked." },
                { icon: NavigationIcon, title: "Follow the visit", text: "A local inspector accepts your request. Track their trip live from your dashboard." },
                { icon: CameraIcon, title: "See the proof", text: "Review the photo, submission GPS and capture method. Mark the visit complete when you’re done." },
              ].map(({ icon: Icon, title, text }, index) => (
                <div className="visit-step" key={title}><span className="step-icon"><Icon size={28} /></span><span className="step-number">Step {index + 1}</span><h3>{title}</h3><p>{text}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-container proof-explainer">
          <div className="proof-standard"><ShieldCheckIcon size={48} /><strong>100 m</strong><span>GPS submission radius</span><p>Proof can only be submitted near the property pin.</p></div>
          <div><h2 className="home-heading">A photo with context.</h2><p className="section-description">Every submission is checked against your property pin. Review the photo alongside the device-reported GPS, accuracy, and capture method. Uploaded photos do not have a verified capture time.</p><ul className="proof-features"><li><CheckIcon size={19} /> Location checked on the server</li><li><CheckIcon size={19} /> Proof saved privately to your account</li><li><CheckIcon size={19} /> Live tracking while the visit is in progress</li></ul><Button to="/verify" variant="secondary">Explore property visits</Button></div>
        </section>

        <section id="pricing" className="pricing-section">
          <div className="home-container home-section">
            <h2 className="home-heading">Pick your visit.</h2>
            <p className="section-description">Quoted fees per visit. Payment is not collected on this website.</p>
            <div className="home-plans">
              {PLANS.map((plan) => <article className="home-plan" key={plan.name}><h3>{plan.name}</h3><p>{plan.tagline}</p><div className="plan-price">₹{plan.price}<span>/ visit</span></div><p className="plan-note">{plan.note}</p><ul>{plan.features.map((feature) => <li key={feature}><CheckIcon size={17} />{feature}</li>)}</ul><Button to={bookingPath(plan.name)} className="w-full">Book {plan.name.toLowerCase()}</Button></article>)}
            </div>
          </div>
        </section>

        <section className="home-section home-container inspector-invite">
          <div><h2 className="home-heading">Know your area?<br />Make it your work.</h2><p className="section-description">Visit nearby properties, capture proof, and earn as a local inspector.</p><div className="inspector-actions"><Button to="/captain/signup" size="lg">Become an inspector</Button><Link to="/captain">How it works</Link></div></div>
          <div className="inspector-details"><MapPinIcon size={44} /><h3>Local knowledge.<br />Real value.</h3><p>Find nearby requests. Follow the brief. Send back the proof.</p><span>No joining fee</span></div>
        </section>

        <section className="home-section home-container home-faq"><h2 className="home-heading">A few things to know.</h2><FaqAccordion items={FAQS} /></section>
      </main>
      <MarketingFooter />
    </div>
  );
}
