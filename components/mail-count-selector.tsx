"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const defaultOptions = [10, 15, 20, 25, 30]

interface MailCountSelectorProps {
  onCountChange?: (count: number) => void
  initialCount?: number
}

export function MailCountSelector({ onCountChange, initialCount = 15 }: MailCountSelectorProps) {
  const [selectedCount, setSelectedCount] = React.useState(initialCount)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [customValue, setCustomValue] = React.useState("")
  const [error, setError] = React.useState("")

  const handleCountChange = (count: number) => {
    setSelectedCount(count)
    onCountChange?.(count)
  }

  const handleCustomSubmit = () => {
    const value = parseInt(customValue)
    
    if (isNaN(value)) {
      setError("Please enter a valid number")
      return
    }
    
    if (value < 1 || value > 50) {
      setError("Value must be between 1 and 50")
      return
    }

    handleCountChange(value)
    setIsDialogOpen(false)
    setCustomValue("")
    setError("")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between bg-[#1A1A1A] border-neutral-900 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100">
            <span>Show {selectedCount} mails</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px] font-sans bg-neutral-900 border-neutral-700">
          {defaultOptions.map((count) => (
            <DropdownMenuItem
              key={count}
              onClick={() => handleCountChange(count)}
              className="text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 cursor-pointer"
            >
              {count} mails
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => setIsDialogOpen(true)}
            className="text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 cursor-pointer"
          >
            Custom...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="font-sans sm:max-w-[425px] bg-neutral-900 border-neutral-700 text-neutral-300">
          <DialogHeader>
            <DialogTitle className="text-neutral-100">Custom Mail Count</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Enter a number between 1 and 50
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="custom-count" className="text-neutral-300">
                Number of mails
              </Label>
              <Input
                id="custom-count"
                type="number"
                min="1"
                max="50"
                value={customValue}
                onChange={(e) => {
                  setCustomValue(e.target.value)
                  setError("")
                }}
                className="bg-neutral-800 border-neutral-700 text-neutral-100"
                placeholder="Enter value (1-50)"
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setCustomValue("")
                setError("")
              }}
              className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCustomSubmit}
              className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
