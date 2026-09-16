import { haptic } from '../lib/haptics'

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = ctx.sampleRate * 1.5
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.6
  }
  return buffer
}

export class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private muted = false
  private humGain: GainNode | null = null
  private humOsc: OscillatorNode | null = null
  private roomGain: GainNode | null = null
  private resonance: { osc: OscillatorNode; gain: GainNode }[] = []
  private lastDetentAt = 0

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.38, this.ctx?.currentTime ?? 0, 0.04)
    }
  }

  isMuted(): boolean {
    return this.muted
  }

  ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null

    if (!this.ctx) {
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 0.38
      this.master.connect(this.ctx.destination)
      this.noise = createNoiseBuffer(this.ctx)
      this.startRoom()
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  private startRoom(): void {
    if (!this.ctx || !this.master || !this.noise) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 180
    this.roomGain = this.ctx.createGain()
    this.roomGain.gain.value = 0.012
    src.connect(filter)
    filter.connect(this.roomGain)
    this.roomGain.connect(this.master)
    src.start()

    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 46
    const gain = this.ctx.createGain()
    gain.gain.value = 0.008
    osc.connect(gain)
    gain.connect(this.master)
    osc.start()
  }

  private burst(freq: number, duration: number, type: OscillatorType, gainValue: number, noiseGain = 0): void {
    const ctx = this.ensure()
    if (!ctx || !this.master || this.muted) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.55), now + duration)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(gainValue, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(now)
    osc.stop(now + duration + 0.02)

    if (noiseGain > 0 && this.noise) {
      const src = ctx.createBufferSource()
      src.buffer = this.noise
      const ng = ctx.createGain()
      ng.gain.setValueAtTime(noiseGain, now)
      ng.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6)
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 900
      src.connect(hp)
      hp.connect(ng)
      ng.connect(this.master)
      src.start(now)
      src.stop(now + duration)
    }
  }

  playDetent(): void {
    const now = performance.now()
    if (now - this.lastDetentAt < 55) return
    this.lastDetentAt = now
    this.burst(1800 + Math.random() * 400, 0.045, 'triangle', 0.045, 0.03)
    haptic(6)
  }

  playGrab(): void {
    this.burst(220, 0.07, 'sine', 0.05, 0.02)
  }

  playRelease(): void {
    this.burst(140, 0.08, 'sine', 0.035)
  }

  playCeramic(): void {
    this.burst(2400, 0.05, 'square', 0.018, 0.04)
  }

  playDiscovery(): void {
    this.burst(520, 0.18, 'sine', 0.04)
  }

  playLock(): void {
    this.burst(90, 0.16, 'sine', 0.1, 0.05)
    haptic(16)
  }

  playCoreHover(): void {
    this.burst(340, 0.22, 'sine', 0.03)
  }

  playCoreActivate(): void {
    const ctx = this.ensure()
    if (!ctx || !this.master || this.muted) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 1.1)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.linearRampToValueAtTime(0.16, now + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(now)
    osc.stop(now + 1.45)
    haptic(28)
  }

  setResonance(level: number): void {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    if (this.resonance.length === 0) {
      const freqs = [110, 165, 247]
      this.resonance = freqs.map((freq) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        const gain = ctx.createGain()
        gain.gain.value = 0
        osc.connect(gain)
        gain.connect(this.master as GainNode)
        osc.start()
        return { osc, gain }
      })
    }
    this.resonance.forEach((voice, index) => {
      const on = level > index ? 0.012 + level * 0.004 : 0
      voice.gain.gain.setTargetAtTime(this.muted ? 0 : on, ctx.currentTime, 0.2)
    })
  }

  startHum(): void {
    const ctx = this.ensure()
    if (!ctx || !this.master || this.humOsc) return
    this.humOsc = ctx.createOscillator()
    this.humOsc.type = 'sine'
    this.humOsc.frequency.value = 58
    this.humGain = ctx.createGain()
    this.humGain.gain.value = 0.0001
    this.humOsc.connect(this.humGain)
    this.humGain.connect(this.master)
    this.humOsc.start()
    this.humGain.gain.exponentialRampToValueAtTime(this.muted ? 0.0001 : 0.045, ctx.currentTime + 0.8)
  }

  stopHum(): void {
    if (!this.ctx || !this.humGain || !this.humOsc) return
    const now = this.ctx.currentTime
    this.humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
    this.humOsc.stop(now + 0.45)
    this.humOsc = null
    this.humGain = null
  }
}

export const audio = new AudioManager()
