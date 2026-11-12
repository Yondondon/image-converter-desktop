import { ImagePlus, X } from "lucide-react"
import { Dialogs } from "@wailsio/runtime"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"
import { toast } from "sonner"

const fileName = (path: string) => path.split(/[\\/]/).pop() ?? path

type Props = {
  paths: string[]
  onPathsChange: (paths: string[]) => void

}

export function ImagePicker({ paths, onPathsChange }: Props) {
  const hasFiles = paths.length > 0
  const pickFiles = async () => {
    try {
      const result = await Dialogs.OpenFile({
        Title: "Select images",
        CanChooseFiles: true,
        CanChooseDirectories: false,
        AllowsMultipleSelection: true,
        Filters: [
          {
            DisplayName: "Images",
            Pattern: "*.webp",
          },
        ],
      })

      const selected = Array.isArray(result) ? result : result ? [result] : []
      if (selected.length === 0) return

      onPathsChange(Array.from(new Set([...selected])))
    } catch (err) {
      console.error("Could not open a dialog to select files:", err)
      toast.error("Could not open a dialog to select files", {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const removePath = (path: string) => {
    onPathsChange(paths.filter((p) => p !== path))
  }

  const clearSelectedFiles = () => {
    onPathsChange([])
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Images</CardTitle>
        <CardDescription>Select one or more images</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 space-x-2">
        <Button onClick={pickFiles}>
          <ImagePlus />
          Select images
        </Button>

        <Button
          onClick={clearSelectedFiles}
          tabIndex={hasFiles ? 0 : -1}
          aria-hidden={!hasFiles}
          className={cn(
            "transition-opacity duration-500",
            hasFiles ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <X />
          Clear
        </Button>

        {paths.length > 0 ? (
          <ul className="divide-y rounded-md border">
            {paths.map((path) => (
              <li
                key={path}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{fileName(path)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {path}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0"
                  onClick={() => removePath(path)}
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No images selected</p>
        )}
      </CardContent>
    </Card>
  )
}
