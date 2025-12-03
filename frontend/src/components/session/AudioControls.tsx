import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

/**
 * Componente de controles de áudio
 * Permite mutar microfone e áudio
 */
interface AudioControlsProps {
  onMicToggle?: (muted: boolean) => void
  onAudioToggle?: (muted: boolean) => void
}

export function AudioControls({
  onMicToggle,
  onAudioToggle,
}: AudioControlsProps) {
  const [micMuted, setMicMuted] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)

  /**
   * Toggle do microfone
   */
  const handleMicToggle = () => {
    const newState = !micMuted
    setMicMuted(newState)
    onMicToggle?.(newState)
  }

  /**
   * Toggle do áudio
   */
  const handleAudioToggle = () => {
    const newState = !audioMuted
    setAudioMuted(newState)
    onAudioToggle?.(newState)
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={micMuted ? 'destructive' : 'default'}
        onClick={handleMicToggle}
        className="bg-card-secondary hover:bg-accent"
      >
        {micMuted ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
      <Button
        size="sm"
        variant={audioMuted ? 'destructive' : 'default'}
        onClick={handleAudioToggle}
        className="bg-card-secondary hover:bg-accent"
      >
        {audioMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}

