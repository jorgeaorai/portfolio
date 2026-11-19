"use client"

import { useState } from "react"
import { ArrowRight, Gamepad2, MousePointer2, Palette, Play, Sparkles, UserRound } from "lucide-react"
import ReturnToBedroom from "@/components/entrance/return-to-bedroom"
import { SCENARIOS } from "./scenarios-data"
import { AvatarConfig, ScenarioInfo } from "./types"

interface LobbyProps {
  onEnter: (scenario: ScenarioInfo, avatar: AvatarConfig) => void
}

const AVATAR_COLORS = [
  { name: "Grafite", primary: "#4c484a", secondary: "#211e20" },
  { name: "Taupe", primary: "#74645a", secondary: "#332b27" },
  { name: "Âmbar", primary: "#a87850", secondary: "#463326" },
  { name: "Terracota", primary: "#8b5f52", secondary: "#3f2925" },
  { name: "Malva", primary: "#78636c", secondary: "#342a2f" },
  { name: "Marfim", primary: "#c8bdb2", secondary: "#514a45" },
]

const CONTROLS = [
  { key: "WASD", label: "Mover" },
  { key: "Shift", label: "Correr" },
  { key: "Espaço", label: "Pular" },
  { key: "Mouse", label: "Câmera" },
]

export function MetaverseLobby({ onEnter }: LobbyProps) {
  const [nickname, setNickname] = useState("Visitante")
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)

  function handleStart() {
    const chosenColor = AVATAR_COLORS[selectedColorIndex]
    onEnter(SCENARIOS[0], {
      nickname: nickname.trim() || "Visitante",
      color: chosenColor.primary,
      secondaryColor: chosenColor.secondary,
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a090a] font-sans text-white selection:bg-stone-400/30">
      <ReturnToBedroom />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(91,76,78,0.24),transparent_32%),radial-gradient(circle_at_82%_78%,rgba(104,78,64,0.22),transparent_34%),radial-gradient(circle_at_76%_20%,rgba(163,119,80,0.12),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,#000,transparent_88%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_0_30px_rgba(120,88,69,.18)] backdrop-blur-xl">
            <span className="text-sm font-semibold tracking-tight text-stone-100">JA</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[.08em] text-white">JORGE AOR</p>
            <p className="text-[10px] tracking-[.22em] text-white">DESIGNER</p>
          </div>
        </div>
        <p className="hidden text-xs tracking-[.16em] text-white sm:block">PORTFÓLIO INTERATIVO · 2026</p>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-[1440px] items-center gap-10 px-5 pb-10 pt-4 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,.72fr)] lg:px-12 lg:pb-14">
        <section className="max-w-3xl lg:pr-8">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-stone-300/20 bg-stone-300/[.07] px-3 py-1.5 text-[11px] font-medium tracking-[.18em] text-stone-300">
            <Sparkles className="size-3.5" /> EXPERIÊNCIA IMERSIVA
          </div>

          <h1 className="max-w-3xl text-balance text-[clamp(3.1rem,7vw,7.5rem)] font-semibold leading-[.86] tracking-[-.065em] text-white">
            Ideias que você pode <span className="bg-gradient-to-r from-stone-100 via-stone-300 to-amber-700 bg-clip-text text-transparent">explorar.</span>
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-white sm:text-lg">
            Bem-vindo ao portfólio de Jorge Aor. Entre em uma experiência em terceira pessoa e descubra projetos, processos e histórias de design de um jeito diferente.
          </p>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {CONTROLS.map((control) => (
              <div key={control.key} className="rounded-2xl border border-white/10 bg-white/[.055] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_15px_35px_rgba(0,0,0,.18)] backdrop-blur-xl">
                <kbd className="font-mono text-xs text-stone-300">{control.key}</kbd>
                <p className="mt-1 text-xs text-white">{control.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center gap-2 text-xs text-white">
            <Gamepad2 className="size-4 text-white" />
            <span>Use teclado e mouse para navegar pela experiência.</span>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[.065] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_30px_100px_rgba(0,0,0,.45),0_0_60px_rgba(255,255,255,.05)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-amber-800/10 blur-3xl" />
          <div className="relative">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[.16em] text-stone-300">
                  <UserRound className="size-3.5" /> SEU AVATAR
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Prepare sua entrada</h2>
                <p className="mt-1 text-sm text-white">Escolha como você quer aparecer neste universo.</p>
              </div>
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/[.07] shadow-[inset_0_1px_0_rgba(255,255,255,.15)] backdrop-blur-xl">
                <MousePointer2 className="size-5 text-stone-300" />
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-white">Como devemos chamar você?</span>
              <input
                type="text"
                value={nickname}
                maxLength={18}
                onChange={(event) => setNickname(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/15 bg-white/[.055] px-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08)] outline-none backdrop-blur-xl transition focus:border-stone-300/70 focus:ring-2 focus:ring-stone-400/15"
              />
            </label>

            <fieldset className="mt-6">
              <legend className="mb-3 flex items-center gap-2 text-xs font-medium text-white">
                <Palette className="size-4 text-white" /> Cor do traje
              </legend>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_COLORS.map((color, index) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColorIndex(index)}
                    className={`group grid aspect-square place-items-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-xl transition ${selectedColorIndex === index ? "border-stone-300/80 bg-stone-300/15 ring-2 ring-stone-400/15" : "border-white/10 bg-white/[.045] hover:border-white/25 hover:bg-white/[.08]"}`}
                    aria-label={`Selecionar traje ${color.name}`}
                    aria-pressed={selectedColorIndex === index}
                  >
                    <span className="size-6 rounded-full border border-white/20 shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: color.primary }} />
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={handleStart}
              className="group mt-8 flex h-14 w-full items-center justify-between rounded-2xl border border-white/25 bg-gradient-to-r from-stone-200/90 via-stone-300/90 to-amber-800/80 px-5 font-semibold text-stone-950 shadow-[inset_0_1px_0_rgba(255,255,255,.55),0_12px_35px_rgba(82,61,48,.28)] backdrop-blur-xl transition hover:brightness-110 active:scale-[.99]"
            >
              <span className="flex items-center gap-2"><Play className="size-4 fill-current" /> Entrar na experiência</span>
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-white">
              A experiência começa após sua confirmação. Nenhum áudio é iniciado automaticamente.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
