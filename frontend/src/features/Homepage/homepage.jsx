import React from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Shield, Zap, ArrowLeft } from 'lucide-react';
import { AnimatedCounters } from '../../common/animated-counter';
import Navbar from '../../common/Navbar';
import './Homepage.css';
import logo from '../../assets/logo2.png';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-beige to-white">
      <Navbar />
      <HeroSection />
      <AnimatedCounters />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          מחפשים שירות במחיר המתאים?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          SmartDeal משנה את הדרך שבה אתם מוצאים ומשווים נותני שירות. חסכו זמן וכסף וקבלו את השירות הטוב ביותר בדיוק במחיר שמתאים לכם.
        </motion.p>
        <motion.button
          className="cta-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          התחילו עכשיו <ArrowLeft className="mr-2" />
        </motion.button>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: <Search className="feature-icon" />, title: "השוואת מחירים", description: "מצאו את ההצעות הטובות ביותר מנותני שירות שונים" },
    { icon: <Star className="feature-icon" />, title: "הערכת איכות", description: "בדקו את איכות השירות דרך ביקורות ודירוגים מאומתים" },
    { icon: <Zap className="feature-icon" />, title: "המלצות מותאמות", description: "קבלו הצעות המותאמות בדיוק לצרכים שלכם" },
    { icon: <Shield className="feature-icon" />, title: "אמינות ושקיפות", description: "הבטיחו אמינות עם מנגנון בניית אמון" },
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2>למה לבחור ב-SmartDeal?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="feature-icon-wrapper">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { number: 1, title: "תארו את הצרכים", description: "ספרו לנו איזה שירות אתם מחפשים" },
    { number: 2, title: "קבלו הצעות", description: "קבלו הצעות מחיר תחרותיות ממספר נותני שירות" },
    { number: 3, title: "השוו ובחרו", description: "הערכת אפשרויות על בסיס מחיר, איכות וביקורות" },
    { number: 4, title: "הזמינו שירות", description: "בחרו את נותן השירות המועדף והזמינו את השירות" },
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2>איך SmartDeal עובד?</h2>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="step-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "דני כהן",
      role: "בעל בית",
      quote: "SmartDeal חסך לי זמן וכסף כשהייתי צריך לשפץ את הבית. ממליץ בחום!",
      image: "/placeholder.svg?height=100&width=100"
    },
    {
      name: "מיכל לוי",
      role: "בעלת עסק קטן",
      quote: "כבעלת עסק, מציאת נותני שירות אמינים היא קריטית. SmartDeal עשה את זה קל ויעיל.",
      image: "/placeholder.svg?height=100&width=100"
    },
    {
      name: "יוסי אברהם",
      role: "מפיק אירועים",
      quote: "ההמלצות המותאמות אישית מ-SmartDeal היו מדויקות בול לצרכי האירועים שלי.",
      image: "/placeholder.svg?height=100&width=100"
    },
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2>מה הלקוחות שלנו אומרים</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="testimonial-header">
                <img src={testimonial.image} alt={testimonial.name} className="testimonial-image" />
                <div>
                  <p className="testimonial-name">{testimonial.name}</p>
                  <p className="testimonial-role">{testimonial.role}</p>
                </div>
              </div>
              <p className="testimonial-quote">{testimonial.quote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const footerLinks = [
    { href: "#", label: "אודות" },
    { href: "#", label: "צור קשר" },
    { href: "#", label: "מדיניות פרטיות" },
    { href: "#", label: "תנאי שימוש" },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="SmartDeal" className="footer-logo-image" />
            <p>מחברים אתכם עם נותני השירות הטובים ביותר</p>
          </div>
          <div className="footer-links">
            {footerLinks.map((link, index) => (
              <a key={index} href={link.href} className="footer-link">
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} SmartDeal. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
}

  

