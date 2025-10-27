"use client"

import * as React from "react"
import { Filter, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchFilters {
  from: string
  to: string
  subject: string
  hasTheWords: string
  doesntHave: string
  isRead: "all" | "read" | "unread"
  hasAttachment: boolean
}

interface AdvancedSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
}

export function AdvancedSearchDialog({
  open,
  onOpenChange,
  onSearch,
  initialFilters,
}: AdvancedSearchDialogProps) {
  const [filters, setFilters] = React.useState<SearchFilters>({
    from: initialFilters?.from || "",
    to: initialFilters?.to || "",
    subject: initialFilters?.subject || "",
    hasTheWords: initialFilters?.hasTheWords || "",
    doesntHave: initialFilters?.doesntHave || "",
    isRead: initialFilters?.isRead || "all",
    hasAttachment: initialFilters?.hasAttachment || false,
  })

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    onSearch(filters)
    onOpenChange(false)
  }

  const handleReset = () => {
    setFilters({
      from: "",
      to: "",
      subject: "",
      hasTheWords: "",
      doesntHave: "",
      isRead: "all",
      hasAttachment: false,
    })
  }

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.from !== "" ||
      filters.to !== "" ||
      filters.subject !== "" ||
      filters.hasTheWords !== "" ||
      filters.doesntHave !== "" ||
      filters.isRead !== "all" ||
      filters.hasAttachment
    )
  }, [filters])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mail ara</DialogTitle>
          <DialogDescription>
            Mailleri filtrelemek için aşağıdaki kriterleri kullanın
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* From */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="flex items-center justify-end gap-2">
              <Label htmlFor="from" className="text-right">
                Gönderen
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>E-postayı gönderen kişinin adını veya e-posta adresini arayın</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="col-span-3">
              <Input
                id="from"
                placeholder="E-posta adresi veya isim"
                value={filters.from}
                onChange={(e) => handleFilterChange("from", e.target.value)}
              />
            </div>
          </div>

          {/* To */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="flex items-center justify-end gap-2">
              <Label htmlFor="to" className="text-right">
                Alıcı
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>E-postanın gönderildiği kişinin adını veya e-posta adresini arayın</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="col-span-3">
              <Input
                id="to"
                placeholder="E-posta adresi veya isim"
                value={filters.to}
                onChange={(e) => handleFilterChange("to", e.target.value)}
              />
            </div>
          </div>

          {/* Subject */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="flex items-center justify-end gap-2">
              <Label htmlFor="subject" className="text-right">
                Konu
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>E-postanın konu satırında geçen kelimeleri arayın</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="col-span-3">
              <Input
                id="subject"
                placeholder="Konu satırında ara"
                value={filters.subject}
                onChange={(e) => handleFilterChange("subject", e.target.value)}
              />
            </div>
          </div>

          {/* Has the words */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="flex items-center justify-end gap-2">
              <Label htmlFor="hasTheWords" className="text-right">
                Kelimeleri içerir
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>E-posta içeriğinde bulunması gereken kelimeleri girin. Sadece bu kelimeleri içeren mailler listelenecek.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="col-span-3">
              <Input
                id="hasTheWords"
                placeholder="Mail içeriğinde geçen kelimeler"
                value={filters.hasTheWords}
                onChange={(e) => handleFilterChange("hasTheWords", e.target.value)}
              />
            </div>
          </div>

          {/* Doesn't have */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="flex items-center justify-end gap-2">
              <Label htmlFor="doesntHave" className="text-right">
                İçermesin
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>E-posta içeriğinde bulunmaması gereken kelimeleri girin. Bu kelimeleri içeren mailler listeden çıkarılacak.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="col-span-3">
              <Input
                id="doesntHave"
                placeholder="Mail içeriğinde olmaması gereken kelimeler"
                value={filters.doesntHave}
                onChange={(e) => handleFilterChange("doesntHave", e.target.value)}
              />
            </div>
          </div>

          {/* Is Read */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="flex items-center justify-end gap-2">
              <Label htmlFor="isRead" className="text-right">
                Okunma Durumu
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Sadece okunmuş veya okunmamış mailleri görmek için filtreleyin</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="col-span-3">
              <Select
                value={filters.isRead}
                onValueChange={(value) => handleFilterChange("isRead", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="read">Okunmuş</SelectItem>
                  <SelectItem value="unread">Okunmamış</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Has attachment */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div></div>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox
                id="hasAttachment"
                checked={filters.hasAttachment}
                onCheckedChange={(checked) =>
                  handleFilterChange("hasAttachment", checked)
                }
              />
              <Label
                htmlFor="hasAttachment"
                className="text-sm font-normal cursor-pointer"
              >
                Ek dosyası olan mailler
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Sadece dosya eki (resim, belge, video vb.) içeren e-postaları listeleyin</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasActiveFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Temizle
          </Button>
          <Button type="button" onClick={handleSearch} disabled={!hasActiveFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Ara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

