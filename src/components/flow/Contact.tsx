"use client";

import { gsap } from "gsap";
import { ArrowUpRight, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";
import { all, framedQuery, one, useFlowMotion, whileMatching, type FlowSetup } from "./useFlowMotion";
import styles from "./Flow.module.css";

const channels = [
  { label: "LinkedIn", value: "in/dishan-bashitha", href: profile.linkedin },
  { label: "GitHub", value: "Dishan-dev", href: profile.github },
  { label: "Phone", value: profile.phone, href: profile.phoneHref },
] as const;
const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Colombo" });

/** The frame grows into place, the headline rises through its masks, then the copy and directory follow. */
const contactMotion: FlowSetup = (contact) => {
  const range = () => ({ trigger: contact, start: "top bottom", end: "top top", scrub: true });
  // On phones the frame is already edge to edge, so it slides in as it is.
  const unframe = whileMatching(framedQuery, () => { gsap.fromTo(one(contact, "[data-contact-frame]"), { scale: 0.82, borderRadius: 64 }, { scale: 1, borderRadius: 28, ease: "none", scrollTrigger: range() }); });
  gsap.from(all(contact, "[data-line] > span"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09,
    scrollTrigger: { trigger: contact, start: "top 40%", toggleActions: "play none none reverse" } });
  gsap.from(all(contact, "[data-contact-sub], [data-contact-foot]"), { opacity: 0, y: 24, duration: 0.9, ease: "power3.out", stagger: 0.1,
    scrollTrigger: { trigger: contact, start: "top 30%", toggleActions: "play none none reverse" } });
  return unframe;
};

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const copyTimer = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);
  // Local time in Sri Lanka, filled in on the client so it never mismatches the server render.
  const [time, setTime] = useState("");
  useFlowMotion(root, contactMotion);
  useEffect(() => () => { if (copyTimer.current) window.clearTimeout(copyTimer.current); }, []);
  useEffect(() => {
    const tick = () => setTime(clock.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const every = window.setInterval(tick, 20000);
    return () => { window.clearTimeout(first); window.clearInterval(every); };
  }, []);

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
        </div>
        <ul data-contact-sub className={styles.channels} aria-label="Contact details">
          <li>
            <button type="button" onClick={copyEmail} aria-label={`Copy email address ${profile.email}`}>
              <small>Email</small><span>{profile.email}</span><em aria-live="polite">{copied ? "Copied" : <Copy size={15} aria-hidden="true" />}</em>
            </button>
          </li>
          {channels.map(channel => (
            <li key={channel.label}>
              <a href={channel.href} {...(channel.href.startsWith("https:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <small>{channel.label}</small><span>{channel.value}</span><em><ArrowUpRight size={16} aria-hidden="true" /></em>
              </a>
            </li>
          ))}
        </ul>
        <footer data-contact-foot className={styles.contactFoot}>
          <span>Based in {profile.location}</span>
          <a href="#home">Back to top ↑</a>
        </footer>
      </div>
    </section>
  );
}
