import { useState } from 'react'
import { isCoarsePointer } from '../lib/device'
import { buildShareText } from '../lib/share'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'

type ShareResultProps = {
  elapsedMs: number
  interactionCount: number
  discoveryCount: number
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.left = '-9999px'
    document.body.appendChild(field)
    field.select()
    const ok = document.execCommand('copy')
    field.remove()
    return ok
  }
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

    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
    void copyText(text)

    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
    if (isCoarsePointer() && typeof nav.share === 'function') {
      try {
        await nav.share({ text })
      } catch {
        // Share sheet cancelled; copy already attempted.
      }
    }
  }

  return (
    <button type="button" className="share-button" onClick={() => void share()}>
      {copied ? 'COPIED' : 'SHARE RESULT'}
    </button>
  )
}
