"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { PORTFOLIO_ROUTES } from "@/lib/portfolio-routes"
import styles from "./portfolio-entrance.module.css"

type Destination = "metaverse" | "portfolio"
type HotspotId = "tv" | "pc" | "lamp" | "window"

const HOTSPOTS: Array<{
  id: HotspotId
  label: string
  title: string
  description: string
  action?: string
  className: string
}> = [
  { id: "tv", label: "Televisão", title: "Explore meu universo", description: "Entre na experiência interativa do portfólio.", action: "Entrar pela TV", className: styles.tv },
  { id: "pc", label: "Computador", title: "Portfólio tradicional", description: "Uma leitura direta de projetos, processos e resultados.", action: "Em preparação", className: styles.pc },
  { id: "lamp", label: "Abajur", title: "Luz do quarto", description: "Alterne a atmosfera e acenda a memória deste espaço.", action: "Acender / apagar", className: styles.lamp },
  { id: "window", label: "Janela", title: "Noite lá fora", description: "A janela traz movimento e luz azul para o quarto.", action: "Mudar o clima", className: styles.window },
]

function BedroomScene({ ready, failed, lampOn, nightPulse, onReady, onError }: {
  ready: boolean
  failed: boolean
  lampOn: boolean
  nightPulse: boolean
  onReady: () => void
  onError: () => void
}) {
  return (
    <div className={`${styles.room} ${ready ? styles.roomReady : ""}`}>
      {!failed ? (
        <Image className={styles.roomImage} src="/quarto.jpg" alt="Quarto de Jorge Aor com televisão, computador, abajur, janela e pôsteres" fill priority quality={100} unoptimized sizes="100vw" onLoad={onReady} onError={onError} />
      ) : <div className={styles.imageFallback} role="img" aria-label="Imagem do quarto indisponível" />}
      <div className={styles.roomShade} aria-hidden="true" />
      <div className={`${styles.lampGlow} ${lampOn ? styles.lampGlowOn : ""}`} aria-hidden="true" />
      <div className={`${styles.windowGlow} ${nightPulse ? styles.windowGlowActive : ""}`} aria-hidden="true" />
      <div className={styles.dust} aria-hidden="true" />
    </div>
  )
}

function SoundToggle() {
  const [soundOn, setSoundOn] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const audioRef = useRef<{ context: AudioContext; oscillator: OscillatorNode; gain: GainNode } | null>(null)

  async function toggleSound() {
    try {
      if (!audioRef.current) {
        const context = new AudioContext()
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = "sine"
        oscillator.frequency.value = 92
        gain.gain.value = 0
        oscillator.connect(gain).connect(context.destination)
        oscillator.start()
        audioRef.current = { context, oscillator, gain }
      }
      const { context, gain } = audioRef.current
      await context.resume()
      const next = !soundOn
      gain.gain.setTargetAtTime(next ? 0.014 : 0, context.currentTime, 0.35)
      setSoundOn(next)
    } catch {
      setUnavailable(true)
    }
  }

  useEffect(() => () => { void audioRef.current?.context.close() }, [])

  return (
    <button className={`${styles.glassPill} ${styles.sound}`} type="button" aria-pressed={soundOn} onClick={toggleSound} disabled={unavailable}>
      <span className={styles.statusDot} aria-hidden="true" />
      {unavailable ? "Áudio indisponível" : soundOn ? "Som ambiente ligado" : "Ativar som"}
    </button>
  )
}

function RoomHotspot({ hotspot, onInteract }: {
  hotspot: (typeof HOTSPOTS)[number]
  onInteract: (id: HotspotId) => void
}) {
  const unavailable = hotspot.id === "pc"
  const interactionOnly = hotspot.id === "lamp" || hotspot.id === "window"
  return (
    <div className={`${styles.hotspotWrap} ${hotspot.className}`}>
      <button className={styles.hotspot} type="button" aria-label={`Interagir com ${hotspot.label}`} onClick={() => onInteract(hotspot.id)}>
        <span className={styles.hotspotRing} />
      </button>
      <article className={styles.glassCard}>
        {!interactionOnly && (
          <>
            <p className={styles.eyebrow}>INTERAÇÃO</p>
            <h2>{hotspot.title}</h2>
            <p>{hotspot.description}</p>
          </>
        )}
        {hotspot.action && (
          <button type="button" className={`${styles.cardAction} ${interactionOnly ? styles.cardActionOnly : ""}`} disabled={unavailable} onClick={() => onInteract(hotspot.id)}>
            {hotspot.action}<span aria-hidden="true">↗</span>
          </button>
        )}
      </article>
    </div>
  )
}

function TransitionLayer({ active }: { active: boolean }) {
  return <div className={`${styles.transitionLayer} ${active ? styles.transitionActive : ""}`} aria-hidden="true" />
}

export default function PortfolioEntrance() {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [travelling, setTravelling] = useState<Destination | null>(null)
  const [imageReady, setImageReady] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [lampOn, setLampOn] = useState(true)
  const [nightPulse, setNightPulse] = useState(false)
  const stageRef = useRef<HTMLElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const effectsAudioRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && started && !travelling) setStarted(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [started, travelling])

  useEffect(() => () => { void effectsAudioRef.current?.close() }, [])

  function playEffect(frequency: number) {
    try {
      const context = effectsAudioRef.current ?? new AudioContext()
      effectsAudioRef.current = context
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(frequency, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.72, context.currentTime + 0.18)
      gain.gain.setValueAtTime(0.035, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.24)
    } catch { /* visual feedback remains available */ }
  }

  function begin() {
    setStarted(true)
    window.setTimeout(() => experienceRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true }), 80)
  }

  function choose(destination: Destination) {
    const route = PORTFOLIO_ROUTES[destination]
    if (travelling || !route) return
    setTravelling(destination)
    sessionStorage.setItem("portfolio-entered-from-bedroom", "true")
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.setTimeout(() => router.push(route), reduced ? 0 : 1050)
  }

  function interact(id: HotspotId) {
    if (id === "tv") return choose("metaverse")
    if (id === "lamp") {
      setLampOn((value) => !value)
      playEffect(lampOn ? 210 : 460)
    }
    if (id === "window") {
      setNightPulse((value) => !value)
      playEffect(330)
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    event.currentTarget.style.setProperty("--parallax-x", `${x * -5}px`)
    event.currentTarget.style.setProperty("--parallax-y", `${y * -3}px`)
  }

  return (
    <main className={`${styles.viewport} ${started ? styles.started : styles.intro} ${travelling ? styles.travelling : ""}`} data-destination={travelling ?? undefined}>
      <section ref={stageRef} className={styles.stage} aria-label="Quarto interativo de Jorge Aor" onPointerMove={handlePointerMove}>
        <BedroomScene ready={imageReady} failed={imageFailed} lampOn={lampOn} nightPulse={nightPulse} onReady={() => setImageReady(true)} onError={() => setImageFailed(true)} />

        <div className={styles.introPanel} inert={started} aria-hidden={started}>
          <p className={styles.introLabel}>DESIGN · EXPERIÊNCIAS · IDENTIDADE</p>
          <h1>Jorge Aor</h1>
          <p className={styles.introSubtitle}>PORTFÓLIO</p>
          <button className={`${styles.glassButton} ${styles.start}`} type="button" onClick={begin} disabled={!imageReady && !imageFailed}>
            {imageReady || imageFailed ? "INICIAR JORNADA" : "CARREGANDO CENA…"}<span aria-hidden="true">→</span>
          </button>
        </div>

        <div ref={experienceRef} className={styles.experience} inert={!started || Boolean(travelling)} aria-hidden={!started}>
          <SoundToggle />
          <p className={`${styles.glassPill} ${styles.roomHint}`}>Explore o quarto</p>
          <div className={styles.hotspots}>
            {HOTSPOTS.map((hotspot) => <RoomHotspot key={hotspot.id} hotspot={hotspot} onInteract={interact} />)}
          </div>
          <p className={styles.helper}>Passe o cursor pelos objetos para descobrir histórias e caminhos</p>
        </div>
      </section>
      <TransitionLayer active={Boolean(travelling)} />
    </main>
  )
}
