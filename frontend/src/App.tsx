import { useState } from "react"
import { ImagePicker } from "@/components/ImagePicker"
import { QualitySlider } from "@/components/QualitySlider"
import { Button } from "@/components/ui/button"
import * as ImageService from "../bindings/changeme/imageservice"
import { Toaster } from "./components/ui/sonner"
import { toast } from "sonner"

function App() {
  const [paths, setPaths] = useState<string[]>([])
  const [quality, setQuality] = useState(85)
  const [busy, setBusy] = useState(false)

  const handleConvert = async () => {
    setBusy(true)
    try {
      const results = await ImageService.Convert(paths, quality) ?? []
      const failed = results.filter((r) => r.error)
      failed.length === 0
        ? toast.success(`Converted: ${results.length} file(s)`)
        : toast.warning(`Successful: ${results.length - failed.length}, errors: ${failed.length}. `, {
          description: `First: ${failed[0].error}`,
          duration: 7000
        })

    } catch (e) {
      toast.error("Error", {
          description: `${String(e)}`,
          duration: 10000
        })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <ImagePicker paths={paths} onPathsChange={setPaths} />

        <QualitySlider value={quality} onChange={setQuality} disabled={busy} />

        <Button onClick={handleConvert} disabled={paths.length === 0 || busy}>
          {busy ? "Conversion..." : "Convert"}
        </Button>
      </main>
      <Toaster richColors position="bottom-center" />
    </>
  )
}

export default App