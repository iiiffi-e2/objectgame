import { useState } from 'react'
import { buildShareText } from '../lib/share'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'

type ShareResultProps = {
  elapsedMs: number
  interactionCount: number
  discoveryCount: number
}

export function ShareResult({ elapsedMs, interactionCount, discoveryCount }: ShareResultProps) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const text = buildShareText({
      objectCode: OBJECT_001_CONFIG.code,
      elapsedMs,
      interactionCount,
      discoveryCount,
    })
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
    try {
      if (nav.share) {
        await nav.share({ text })
        return
      }
    } catch {
      // Fall through to clipboard if share is cancelled or unsupported.
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button type="button" className="share-button" onClick={() => void share()}>
      {copied ? 'COPIED' : 'SHARE RESULT'}
    </button>
  )
}
