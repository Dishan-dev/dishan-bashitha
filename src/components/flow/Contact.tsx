"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { all, one, useFlowMotion, type FlowSetup } from "./useFlowMotion";
import styles from "./Flow.module.css";

const channels = [
  { label: "LinkedIn", href: profile.linkedin },
  { label: "GitHub", href: profile.github },
  { label: profile.phone, href: profile.phoneHref },
] as const;

/** The frame grows into place, the star spins in, and the headline rises through its masks. */
const contactMotion: FlowSetup = (contact) => {
  const range = () => ({ trigger: contact, start: "top bottom", end: "top top", scrub: true });
  gsap.fromTo(one(contact, "[data-contact-frame]"), { scale: 0.82, borderRadius: 64 }, { scale: 1, borderRadius: 28, ease: "none", scrollTrigger: range() });
  gsap.fromTo(one(contact, "[data-star]"), { rotation: -55, xPercent: 35, scale: 0.8 }, { rotation: 0, xPercent: 0, scale: 1, ease: "none", scrollTrigger: range() });
  gsap.from(all(contact, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: contact, start: "top 40%", toggleActions: "play none none reverse" } });
  gsap.from(all(contact, "[data-contact-sub], [data-contact-foot]"), { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.1,
    scrollTrigger: { trigger: contact, start: "top 30%", toggleActions: "play none none reverse" } });
};

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const copyTimer = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);
  useFlowMotion(root, contactMotion);
  useEffect(() => () => { if (copyTimer.current) window.clearTimeout(copyTimer.current); }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section ref={root} id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div data-contact-frame className={styles.contactFrame}>
        <p className={`${styles.eyebrow} ${styles.contactEyebrow}`}>06 · Contact</p>
        <h2 id="contact-title" className={`${styles.sectionTitle} ${styles.contactTitle}`}>
          <span data-line className={styles.line}><span>Have something</span></span>
          <span data-line className={styles.line}><span>interesting in mind?</span></span>
          <span data-line className={`${styles.line} ${styles.dim}`}><span>Let’s build it.</span></span>
        </h2>
        <div data-contact-sub className={styles.sub}>
          <p>Open to meaningful projects, collaborations and conversations around software, products and creative technology.</p>
          <div className={styles.btns}>
            <a className={`${styles.btn} ${styles.solid}`} href={`mailto:${profile.email}`}>Send an email</a>
            <a className={`${styles.btn} ${styles.ghost}`} href={profile.resume} download="DISHAN_BASHITHA.pdf">Résumé (PDF)</a>
          </div>
          <ul className={styles.channels}>
            <li><button type="button" onClick={copyEmail} aria-live="polite">{copied ? "Copied ✓" : profile.email}</button></li>
            {channels.map(channel => <li key={channel.label}><a href={channel.href} {...(channel.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{channel.label} ↗</a></li>)}
          </ul>
        </div>
        <svg data-star className={styles.star} viewBox="-20 -20 260 260" aria-hidden="true">
          <defs>
            <linearGradient id="contact-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f4f8" /><stop offset=".35" stopColor="#9a9aa8" /><stop offset=".55" stopColor="#2a2a38" /><stop offset=".8" stopColor="#d9d9e2" /><stop offset="1" stopColor="#55556a" /></linearGradient>
            <linearGradient id="contact-edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0b0b14" /><stop offset="1" stopColor="#262636" /></linearGradient>
          </defs>
          <path transform="translate(12 14)" fill="url(#contact-edge)" d="M100 0C112 58 142 88 200 100C142 112 112 142 100 200C88 142 58 112 0 100C58 88 88 58 100 0Z" />
          <path fill="url(#contact-metal)" d="M100 0C112 58 142 88 200 100C142 112 112 142 100 200C88 142 58 112 0 100C58 88 88 58 100 0Z" />
        </svg>
        <footer data-contact-foot className={styles.contactFoot}>
          <span>Based in {profile.location}</span>
          <a href="#home">Back to top ↑</a>
        </footer>
      </div>
    </section>
  );
}
