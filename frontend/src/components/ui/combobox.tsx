import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Command as CommandPrimitive, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk"

/**
 * Combobox Select - Select com busca integrada
 * Baseado no componente do 21st.dev
 * Customizado para tema roxo Let's Roll
 */
interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado encontrado.",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-[#2A2A3A] border-[#8000FF]/20 text-white hover:bg-[#2A2A3A] hover:border-[#8000FF]",
            !value && "text-[#A0A0A0]",
            className
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#2A2A3A] border-[#8000FF]/20">
        <CommandPrimitive>
          <CommandInput
            placeholder={searchPlaceholder}
            className="text-white placeholder:text-[#A0A0A0]"
          />
          <CommandList>
            <CommandEmpty className="text-[#A0A0A0] py-6 text-center text-sm">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className={cn(
                    "text-white cursor-pointer",
                    "hover:bg-[#8000FF]/20 focus:bg-[#8000FF]/20",
                    value === option.value && "bg-[#8000FF]/30"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  )
}

