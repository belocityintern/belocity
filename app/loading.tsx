import { Zap } from "lucide-react"

export default function Loading() {
  // You can return a more sophisticated loading skeleton here if desired
  return (
    <div className="min-h-screen bg-black text-electric-green flex flex-col items-center justify-center">
      <div className="flex items-center space-x-3 mb-4">
        <Zap className="h-10 w-10 text-electric-green animate-electric-glow" />
        <h1 className="text-5xl font-bold glowing-text">[BELOCITY]</h1>
      </div>
      <p className="text-xl text-electric-green/70 animate-pulse">INITIALIZING_DATA_STREAMS...</p>
    </div>
  )
}
