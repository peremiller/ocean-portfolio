"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Project = {
  id: string;
  number: string;
  name: string;
  type: string;
  summary: string;
  accent: string;
  className: string;
  icon: string;
  details: string[];
  developer: string;
  url: string;
  avatar?: string;
  custom?: boolean;
};

const CAPTAIN_PROFILE = "/images/aj-captain-profile.png";

const starterProjects: Project[] = [
  {
    id: "plugspot",
    number: "01",
    name: "Plugspot Finder",
    type: "Location discovery",
    summary: "Find nearby laptop-friendly places with outlets, Wi-Fi, and reliable workspace details.",
    accent: "#ffca5c",
    className: "plugspot",
    icon: "⌁",
    details: ["Outlet-aware maps", "Wi-Fi insights", "Distance-first discovery"],
    developer: "AJ Miller T. Perez",
    url: "https://plugspot-finder.ajmillertperez562.chatgpt.site",
    avatar: CAPTAIN_PROFILE,
  },
  {
    id: "pantry",
    number: "02",
    name: "Pantry Guardian",
    type: "Smart food management",
    summary: "Track food, prevent waste, and turn soon-to-expire ingredients into useful meals.",
    accent: "#74e0af",
    className: "pantry",
    icon: "✦",
    details: ["Expiry tracking", "Storage visualization", "Recipe recommendations"],
    developer: "AJ Miller T. Perez",
    url: "https://pantry-guardian.ajmillertperez562.chatgpt.site",
    avatar: CAPTAIN_PROFILE,
  },
  {
    id: "groupmate",
    number: "03",
    name: "Groupmate Matching",
    type: "Team formation",
    summary: "Help soloists and teams discover compatible collaborators and build better groups.",
    accent: "#ff8d84",
    className: "groupmate",
    icon: "◎",
    details: ["Smart matching", "Group invitations", "Team workspaces"],
    developer: "AJ Miller T. Perez",
    url: "https://groupmate-match.ajmillertperez562.chatgpt.site",
    avatar: CAPTAIN_PROFILE,
  },
  {
    id: "migration",
    number: "04",
    name: "Migration QA Estimator",
    type: "Quality engineering",
    summary: "Estimate migration-testing effort, log actuals, and surface delivery insights.",
    accent: "#9ec5ff",
    className: "migration",
    icon: "⌘",
    details: ["Effort estimation", "Actual-time logging", "QA analytics"],
    developer: "AJ Miller T. Perez",
    url: "https://migration-qa-estimator.ajmillertperez562.chatgpt.site",
    avatar: CAPTAIN_PROFILE,
  },
];

const locations = {
  palawan: {
    label: "El Nido, Palawan",
    note: "Calm tropical waters",
    position: "11.1956° N, 119.4075° E",
  },
  boracay: {
    label: "Boracay at Sunset",
    note: "Warm golden currents",
    position: "11.9674° N, 121.9248° E",
  },
  pacific: {
    label: "Open Pacific",
    note: "Deep blue passage",
    position: "14.5995° N, 130.0000° E",
  },
  aurora: {
    label: "Arctic Aurora",
    note: "Polar night voyage",
    position: "69.6492° N, 18.9553° E",
  },
};

type LocationKey = keyof typeof locations;
type SeaState = "calm" | "breeze" | "swell";

type AmbientSound = {
  context: AudioContext;
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
};

const ambientPresets: Record<LocationKey, { deep: number; surf: number; cutoff: number; cycle: number }> = {
  palawan: { deep: 0.018, surf: 0.042, cutoff: 920, cycle: 0.075 },
  boracay: { deep: 0.022, surf: 0.045, cutoff: 760, cycle: 0.085 },
  pacific: { deep: 0.036, surf: 0.06, cutoff: 560, cycle: 0.06 },
  aurora: { deep: 0.03, surf: 0.027, cutoff: 430, cycle: 0.045 },
};

const seaStrength: Record<SeaState, number> = { calm: 0.78, breeze: 1, swell: 1.28 };

function slugifyProject(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function projectPath(project: Project) {
  return `/projects/${slugifyProject(project.name)}`;
}

function navigateTo(path: string) {
  if (window.location.pathname !== path) window.history.pushState({}, "", path);
}

function Ship({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  const initials = project.developer.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  function tiltShip(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--ship-ry", `${x * 12}deg`);
    event.currentTarget.style.setProperty("--ship-rx", `${y * -8}deg`);
    event.currentTarget.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
  }

  function resetShipTilt(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.style.setProperty("--ship-ry", "0deg");
    event.currentTarget.style.setProperty("--ship-rx", "0deg");
    event.currentTarget.style.setProperty("--shine-x", "50%");
  }

  return (
    <button
      className={`ship ship--${project.className}`}
      style={{ "--ship-accent": project.accent } as React.CSSProperties}
      onClick={() => onOpen(project)}
      onPointerMove={tiltShip}
      onPointerLeave={resetShipTilt}
      aria-label={`View ${project.name}`}
    >
      <span className="ship__label">
        <span className="ship__captain" title={`Captain and developer: ${project.developer}`}>
          {project.avatar ? <Image src={project.avatar} alt="" width={36} height={36} unoptimized /> : <b>{initials}</b>}
          <i>{project.number}</i>
        </span>
        <span>
          <strong>{project.name}</strong>
          <small>{project.type}</small>
          <small className="ship__developer">By {project.developer}</small>
        </span>
        <span className="ship__arrow">↗</span>
      </span>
      <span className="ship__vessel" aria-hidden="true">
        <span className="ship__flag" />
        <span className="ship__mast" />
        <span className="ship__sail ship__sail--back" />
        <span className="ship__sail ship__sail--front" />
        <span className="ship__cabin"><i>{project.icon}</i></span>
        <span className="ship__hull"><i /><i /><i /></span>
        <span className="ship__wake" />
      </span>
      <span className="ship__reflection" aria-hidden="true" />
    </button>
  );
}

export default function Home() {
  const [location, setLocation] = useState<LocationKey>("palawan");
  const [selected, setSelected] = useState<Project | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [seaState, setSeaState] = useState<SeaState>("breeze");
  const [captainOpen, setCaptainOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [fleet, setFleet] = useState<Project[]>(starterProjects);
  const [pendingShips, setPendingShips] = useState<Project[]>([]);
  const [toast, setToast] = useState("");
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<AmbientSound | null>(null);
  const audioGenerationRef = useRef(0);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("aj-fleet:custom-ships") || "[]") as Project[];
        const pending = JSON.parse(localStorage.getItem("aj-fleet:pending-ships") || "[]") as Project[];
        setFleet([...starterProjects, ...saved.filter((ship) => ship.custom)]);
        setPendingShips(pending.filter((ship) => ship.custom));
      } catch { /* keep the starter fleet */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const syncViewFromUrl = () => {
      const path = window.location.pathname;
      setCaptainOpen(path === "/captain");
      setAddOpen(path === "/add-ship");
      if (path.startsWith("/projects/")) {
        const slug = path.slice("/projects/".length).replace(/\/$/, "");
        setSelected(fleet.find((project) => slugifyProject(project.name) === slug) || null);
      } else {
        setSelected(null);
      }
    };
    syncViewFromUrl();
    window.addEventListener("popstate", syncViewFromUrl);
    return () => window.removeEventListener("popstate", syncViewFromUrl);
  }, [fleet]);

  useEffect(() => {
    if (!selected && !addOpen && !captainOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setAddOpen(false);
        setCaptainOpen(false);
        navigateTo("/");
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected, addOpen, captainOpen]);

  useEffect(() => {
    if (!selected && !addOpen && !captainOpen) return;

    const body = document.body;
    const root = document.documentElement;
    const scrollY = window.scrollY;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";

    return () => {
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.overflow = previousBodyOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [selected, addOpen, captainOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleVisibility = () => {
      const context = audioContextRef.current;
      if (!context) return;
      if (document.hidden) void context.suspend();
      else if (soundOn) void context.resume();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [soundOn]);

  useEffect(() => () => {
    audioGenerationRef.current += 1;
    ambientRef.current?.sources.forEach((source) => {
      try { source.stop(); } catch { /* source may already be stopped */ }
    });
    void audioContextRef.current?.close();
  }, []);

  function getAudioContext() {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }

  function makeOceanNoise(context: AudioContext) {
    const length = context.sampleRate * 3;
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    let seed = 0x4f434541;
    for (let index = 0; index < length; index += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const white = (seed / 4294967296) * 2 - 1;
      last = (last + 0.025 * white) / 1.025;
      data[index] = Math.max(-1, Math.min(1, last * 3.3));
    }
    return buffer;
  }

  function stopAmbience(immediate = false) {
    const ambient = ambientRef.current;
    if (!ambient) return;
    const now = ambient.context.currentTime;
    const fade = immediate ? 0.03 : 0.45;
    ambient.gain.gain.cancelScheduledValues(now);
    ambient.gain.gain.setTargetAtTime(0.0001, now, Math.max(fade / 4, 0.01));
    ambient.sources.forEach((source) => {
      try { source.stop(now + fade); } catch { /* source may already be stopped */ }
    });
    ambientRef.current = null;
  }

  async function startAmbience(nextLocation: LocationKey, nextSeaState: SeaState = seaState) {
    const generation = audioGenerationRef.current + 1;
    audioGenerationRef.current = generation;
    stopAmbience(true);
    const context = getAudioContext();
    await context.resume();
    if (generation !== audioGenerationRef.current) return;
    const preset = ambientPresets[nextLocation];
    const strength = seaStrength[nextSeaState];
    const noise = makeOceanNoise(context);
    const ambienceGain = context.createGain();
    ambienceGain.gain.setValueAtTime(0.0001, context.currentTime);
    ambienceGain.gain.exponentialRampToValueAtTime(0.48, context.currentTime + 0.8);
    ambienceGain.connect(context.destination);

    const deepSource = context.createBufferSource();
    const deepFilter = context.createBiquadFilter();
    const deepGain = context.createGain();
    deepSource.buffer = noise;
    deepSource.loop = true;
    deepSource.playbackRate.value = 0.72;
    deepFilter.type = "lowpass";
    deepFilter.frequency.value = preset.cutoff;
    deepFilter.Q.value = 0.4;
    deepGain.gain.value = preset.deep * strength;
    deepSource.connect(deepFilter).connect(deepGain).connect(ambienceGain);

    const surfSource = context.createBufferSource();
    const surfHighPass = context.createBiquadFilter();
    const surfLowPass = context.createBiquadFilter();
    const surfGain = context.createGain();
    surfSource.buffer = noise;
    surfSource.loop = true;
    surfSource.playbackRate.value = 1.08;
    surfHighPass.type = "highpass";
    surfHighPass.frequency.value = 170;
    surfLowPass.type = "lowpass";
    surfLowPass.frequency.value = preset.cutoff * 1.8;
    surfGain.gain.value = preset.surf * strength;
    surfSource.connect(surfHighPass).connect(surfLowPass).connect(surfGain).connect(ambienceGain);

    const swell = context.createOscillator();
    const swellDepth = context.createGain();
    swell.frequency.value = preset.cycle;
    swellDepth.gain.value = preset.surf * strength * 0.42;
    swell.connect(swellDepth).connect(surfGain.gain);

    deepSource.start();
    surfSource.start(context.currentTime, 1.1);
    swell.start();
    ambientRef.current = { context, gain: ambienceGain, sources: [deepSource, surfSource, swell] };
  }

  function playEffect(kind: "toggle" | "ship" | "location" | "control" | "water") {
    const context = audioContextRef.current;
    if (!context || context.state === "closed") return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const settings = {
      toggle: { from: 360, to: 520, duration: 0.24, volume: 0.038 },
      ship: { from: 690, to: 430, duration: 0.62, volume: 0.052 },
      location: { from: 280, to: 390, duration: 0.38, volume: 0.04 },
      control: { from: 320, to: 280, duration: 0.18, volume: 0.028 },
      water: { from: 175, to: 88, duration: 0.34, volume: 0.022 },
    }[kind];
    oscillator.type = kind === "ship" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(settings.from, now);
    oscillator.frequency.exponentialRampToValueAtTime(settings.to, now + settings.duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(settings.volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + settings.duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + settings.duration + 0.03);
  }

  async function toggleSound() {
    if (soundOn) {
      playEffect("control");
      audioGenerationRef.current += 1;
      stopAmbience();
      setSoundOn(false);
      return;
    }
    setSoundOn(true);
    await startAmbience(location);
    playEffect("toggle");
  }

  function openProject(project: Project) {
    if (soundOn) playEffect("ship");
    setCaptainOpen(false);
    setAddOpen(false);
    setSelected(project);
    navigateTo(projectPath(project));
  }

  function openAddShip() {
    if (soundOn) playEffect("control");
    setCaptainOpen(false);
    setSelected(null);
    setAddOpen(true);
    navigateTo("/add-ship");
  }

  function toggleCaptain() {
    if (soundOn) playEffect("control");
    setSelected(null);
    setAddOpen(false);
    setCaptainOpen((value) => {
      navigateTo(value ? "/" : "/captain");
      return !value;
    });
  }

  function closeView() {
    if (soundOn) playEffect("control");
    setSelected(null);
    setAddOpen(false);
    setCaptainOpen(false);
    navigateTo("/");
  }

  function selectLocation(nextLocation: LocationKey) {
    setLocation(nextLocation);
    if (soundOn) {
      void startAmbience(nextLocation);
      playEffect("location");
    }
  }

  function changeLocation(event: React.ChangeEvent<HTMLSelectElement>) {
    selectLocation(event.target.value as LocationKey);
  }

  function cycleLocation() {
    const keys = Object.keys(locations) as LocationKey[];
    const nextLocation = keys[(keys.indexOf(location) + 1) % keys.length];
    selectLocation(nextLocation);
    setToast(`Now sailing: ${locations[nextLocation].label}.`);
  }

  function changeSeaState(nextSeaState: SeaState) {
    setSeaState(nextSeaState);
    if (soundOn) {
      void startAmbience(location, nextSeaState);
      playEffect("location");
    }
    setToast(`${nextSeaState[0].toUpperCase()}${nextSeaState.slice(1)} waters selected.`);
  }

  function createRipple(event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button, a, select, input, textarea")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rippleIdRef.current += 1;
    const ripple = { id: rippleIdRef.current, x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    setRipples((currentRipples) => [...currentRipples.slice(-4), ripple]);
    window.setTimeout(() => setRipples((currentRipples) => currentRipples.filter((item) => item.id !== ripple.id)), 1300);
    if (soundOn) playEffect("water");
  }

  function saveCustomShips(next: Project[]) {
    setFleet(next);
    localStorage.setItem("aj-fleet:custom-ships", JSON.stringify(next.filter((ship) => ship.custom)));
  }

  function savePendingShips(next: Project[]) {
    setPendingShips(next);
    localStorage.setItem("aj-fleet:pending-ships", JSON.stringify(next));
  }

  async function addShip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const avatarFile = form.get("avatarFile");
    let avatar = String(form.get("avatarUrl") || "");
    if (avatarFile instanceof File && avatarFile.size > 0) {
      if (avatarFile.size > 1_500_000) { setToast("Please choose a captain photo smaller than 1.5 MB."); return; }
      avatar = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(avatarFile);
      });
    }
    const details = String(form.get("details") || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 3);
    const next: Project = {
      id: `community-${Date.now()}`,
      number: "PENDING",
      name: String(form.get("name")),
      type: String(form.get("type")),
      summary: String(form.get("summary")),
      accent: String(form.get("accent")),
      className: "custom",
      icon: String(form.get("icon") || "⚓").slice(0, 3),
      details: details.length ? details : ["Community-built", "Ready to explore", "Charting new waters"],
      developer: String(form.get("developer")),
      url: String(form.get("url")),
      avatar,
      custom: true,
    };
    savePendingShips([...pendingShips, next]);
    setAddOpen(false);
    setCaptainOpen(false);
    navigateTo("/");
    setToast(`${next.name} was submitted for captain review.`);
  }

  function approveShip(project: Project) {
    const approved = { ...project, number: String(fleet.length + 1).padStart(2, "0") };
    saveCustomShips([...fleet, approved]);
    savePendingShips(pendingShips.filter((ship) => ship.id !== project.id));
    setToast(`${project.name} was approved and joined the fleet.`);
  }

  function rejectShip(project: Project) {
    savePendingShips(pendingShips.filter((ship) => ship.id !== project.id));
    setToast(`${project.name} was declined.`);
  }

  function removeShip(project: Project) {
    saveCustomShips(fleet.filter((ship) => ship.id !== project.id));
    setSelected(null);
    navigateTo("/");
    setToast(`${project.name} returned to port.`);
  }

  function moveScene(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    const scene = event.currentTarget.style;
    scene.setProperty("--atmo-x", `${65 + x * 4}%`);
    scene.setProperty("--atmo-y", `${30 + y * 3}%`);
    scene.setProperty("--atmo-shift-x", `${x * -10}px`);
    scene.setProperty("--atmo-shift-y", `${y * -8}px`);
    scene.setProperty("--sun-x", `${x * 26}px`);
    scene.setProperty("--sun-y", `${y * 18}px`);
    scene.setProperty("--cloud-x", `${x * -14}px`);
    scene.setProperty("--cloud-y", `${y * -8}px`);
    scene.setProperty("--birds-x", `${x * -32}px`);
    scene.setProperty("--birds-y", `${y * -20}px`);
    scene.setProperty("--hero-x", `${x * -8}px`);
    scene.setProperty("--hero-y", `${y * -5}px`);
    scene.setProperty("--panel-x", `${x * 14}px`);
    scene.setProperty("--panel-y", `${y * 9}px`);
    scene.setProperty("--panel-ry", `${x * -2}deg`);
    scene.setProperty("--panel-rx", `${y * 2}deg`);
  }

  function resetScene(event: React.PointerEvent<HTMLElement>) {
    const scene = event.currentTarget.style;
    ["--atmo-shift-x", "--atmo-shift-y", "--sun-x", "--sun-y", "--cloud-x", "--cloud-y", "--birds-x", "--birds-y", "--hero-x", "--hero-y", "--panel-x", "--panel-y"].forEach((property) => scene.setProperty(property, "0px"));
    scene.setProperty("--panel-ry", "0deg");
    scene.setProperty("--panel-rx", "0deg");
    scene.setProperty("--atmo-x", "65%");
    scene.setProperty("--atmo-y", "30%");
  }

  const current = locations[location];

  return (
    <main className={`portfolio ocean--${location} sea--${seaState}`} onPointerMove={moveScene} onPointerLeave={resetScene}>
      <div className="sky" aria-hidden="true">
        <span className="atmosphere" />
        <span className="sun" />
        <span className="cloud cloud--one" />
        <span className="cloud cloud--two" />
        <span className="seabirds"><i /><i /><i /></span>
        <span className="stars" />
        <span className="horizon-land" />
      </div>

      <header className="nav">
        <button className="brand" onClick={toggleCaptain} aria-expanded={captainOpen} aria-controls="captain-card" aria-label="Open AJ Miller T. Perez captain profile">
          <span className="brand__mark">
            <Image src="/favicon.png" alt="AJ Project Fleet logo" width={54} height={54} priority unoptimized />
            {pendingShips.length > 0 && <i>{pendingShips.length} to review</i>}
          </span>
          <span><strong>AJ Project Fleet</strong><small>Digital products, built to move</small></span>
        </button>
        {captainOpen && (
          <aside className="captain-card" id="captain-card" role="dialog" aria-label="Captain profile">
            <button className="captain-card__close" onClick={closeView} aria-label="Close captain profile">×</button>
            <Image src={CAPTAIN_PROFILE} alt="AJ Miller T. Perez wearing a captain's hat" width={82} height={82} unoptimized />
            <span><small>Captain &amp; product builder</small><strong>AJ Miller T. Perez</strong></span>
            <p>Software quality leader charting practical digital products from Metro Manila.</p>
            <section className="review-queue" aria-labelledby="review-queue-title">
              <div className="review-queue__heading">
                <span><small>Moderation desk</small><strong id="review-queue-title">App review queue</strong></span>
                <b>{pendingShips.length} pending</b>
              </div>
              {pendingShips.length === 0 ? (
                <p>All clear. New app submissions will wait here for approval.</p>
              ) : (
                <div className="review-queue__list">
                  {pendingShips.map((project) => (
                    <article className="review-item" key={project.id}>
                      <span className="review-item__icon" style={{ "--ship-accent": project.accent } as React.CSSProperties}>{project.icon}</span>
                      <span><strong>{project.name}</strong><small>By {project.developer}</small></span>
                      <span className="review-item__actions">
                        <button type="button" onClick={() => approveShip(project)}>Approve</button>
                        <button type="button" onClick={() => rejectShip(project)}>Reject</button>
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <a href="https://www.linkedin.com/in/millertperez" target="_blank" rel="noreferrer">View LinkedIn <span>↗</span></a>
          </aside>
        )}
        <div className="nav__right">
          <span className="date"><i /> Captain&apos;s Log · July 18, 2026</span>
          <button className="add-ship-nav" onClick={openAddShip}>＋ Add your ship</button>
          <button
            className={`sound ${soundOn ? "sound--on" : ""}`}
            onClick={() => void toggleSound()}
            aria-pressed={soundOn}
            aria-label={`Turn ocean sounds ${soundOn ? "off" : "on"}`}
            title={`Turn ocean sounds ${soundOn ? "off" : "on"}`}
          >
            <span className="sound__icon" aria-hidden="true"><i /><i /><i /></span>
            <span className="sound__text">Ocean audio {soundOn ? "on" : "off"}</span>
          </button>
        </div>
      </header>

      <section className="hero" id="fleet">
        <div className="hero__copy">
          <p className="eyebrow"><span>{String(fleet.length).padStart(2, "0")}</span> Products charting new waters</p>
          <h1>Ideas with<br /><em>direction.</em></h1>
          <p className="intro">A portfolio of purposeful digital products—each designed to solve a real problem and carry people forward.</p>
          <p className="instruction"><span className="mouse" /> Select a ship to explore the project</p>
        </div>

        <aside className="location-panel" aria-label="Ocean location settings">
          <div className="location-panel__top">
            <button className="compass" onClick={cycleLocation} aria-label="Sail to the next ocean location" title="Sail to the next location">✣</button>
            <span><small>Currently sailing</small><strong>{current.label}</strong></span>
          </div>
          <label htmlFor="location">Choose waters</label>
          <div className="select-wrap">
            <select id="location" value={location} onChange={changeLocation}>
              {Object.entries(locations).map(([key, value]) => (
                <option value={key} key={key}>{value.label}</option>
              ))}
            </select>
            <span>⌄</span>
          </div>
          <div className="location-panel__meta">
            <span>{current.note}</span><span>{current.position}</span>
          </div>
          <fieldset className="sea-state">
            <legend>Sea conditions</legend>
            {(["calm", "breeze", "swell"] as SeaState[]).map((condition) => (
              <button type="button" key={condition} onClick={() => changeSeaState(condition)} aria-pressed={seaState === condition}>{condition}</button>
            ))}
          </fieldset>
        </aside>
      </section>

      <section className="ocean" aria-label="Project fleet. Tap open water to make a ripple." onPointerDown={createRipple}>
        <div className="ocean__shimmer" />
        <div className="ocean__caustics" aria-hidden="true" />
        <div className="ocean__rays" aria-hidden="true"><i /><i /><i /></div>
        <div className="ocean__bubbles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="water-ripples" aria-hidden="true">
          {ripples.map((ripple) => <i key={ripple.id} style={{ left: ripple.x, top: ripple.y }} />)}
        </div>
        <div className="wave wave--far" />
        <div className="fleet">
          {fleet.map((project) => <Ship project={project} onOpen={openProject} key={project.id} />)}
          <button className="add-ship-card" onClick={openAddShip} aria-label="Add your own ship">
            <span>＋</span><strong>Add your ship</strong><small>Bring another web app into the fleet</small>
          </button>
        </div>
        <div className="wave wave--middle" />
        <div className="wave wave--near" />
      </section>

      <footer className="footer">
        <span>{fleet.length} products. One north star.</span>
        <span>© 2026 AJ Miller T. Perez</span>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeView}>
          <article
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
            style={{ "--ship-accent": selected.accent } as React.CSSProperties}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={closeView} aria-label="Close project details">×</button>
            <span className="modal-number">PROJECT / {selected.number}</span>
            <div className="modal-icon">{selected.icon}</div>
            <p>{selected.type}</p>
            <h2 id="project-title">{selected.name}</h2>
            <p className="modal-developer"><span className="modal-captain">{selected.avatar ? <Image src={selected.avatar} alt={`${selected.developer} profile`} width={36} height={36} unoptimized /> : <b>{selected.developer.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</b>}</span><span>Captain &amp; developer</span><strong>{selected.developer}</strong></p>
            <p className="modal-summary">{selected.summary}</p>
            <ul>{selected.details.map((detail) => <li key={detail}><span>✓</span>{detail}</li>)}</ul>
            <a className="modal-launch" href={selected.url} target="_blank" rel="noreferrer">Ship It Captain! <span>↗</span></a>
            <div className="modal-footer-actions"><button className="modal-action" onClick={closeView}>Return to the fleet <span>→</span></button>{selected.custom && <button className="remove-ship" onClick={() => removeShip(selected)}>Remove my ship</button>}</div>
          </article>
        </div>
      )}

      {addOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeView}>
          <article className="project-modal add-ship-modal" role="dialog" aria-modal="true" aria-labelledby="add-ship-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={closeView} aria-label="Close add ship form">×</button>
            <span className="modal-number">OPEN HARBOR / NEW VESSEL</span>
            <div className="modal-icon">⚓</div>
            <h2 id="add-ship-title">Add your ship.</h2>
            <p className="modal-summary">Submit a web app for Captain review. It will stay private on this device until it is approved for the fleet.</p>
            <form className="ship-form" onSubmit={addShip}>
              <div className="form-grid"><label>Ship / app name<input name="name" required maxLength={42} placeholder="My brilliant app" /></label><label>Developer or team<input name="developer" required maxLength={42} placeholder="Your name or team" /></label></div>
              <div className="form-grid"><label>Captain profile photo<input name="avatarFile" type="file" accept="image/png,image/jpeg,image/webp" /></label><label>Or profile photo URL<input name="avatarUrl" type="url" placeholder="https://…" /></label></div>
              <div className="form-grid"><label>Project type<input name="type" required maxLength={36} placeholder="Education, productivity…" /></label><label>Destination URL<input name="url" required type="url" placeholder="https://…" /></label></div>
              <label>What does it do?<textarea name="summary" required maxLength={180} rows={3} placeholder="A short description of the problem your app solves." /></label>
              <label>Three highlights, separated by commas<input name="details" placeholder="Fast setup, Smart insights, Public access" /></label>
              <div className="form-grid compact"><label>Ship symbol<input name="icon" defaultValue="⚓" maxLength={3} aria-label="Ship symbol" /></label><label>Flag color<input name="accent" type="color" defaultValue="#ffd166" aria-label="Flag color" /></label></div>
              <button className="modal-launch" type="submit">Submit for review <span>→</span></button>
            </form>
          </article>
        </div>
      )}
      {toast && <div className="toast" role="status">⚓ {toast}</div>}
    </main>
  );
}
