"use client"

import { useState } from "react"
import { Download, AlertTriangle, Shield, FileWarning, Eye } from "lucide-react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface AttachmentPreviewProps {
  attachment: {
    filename?: string
    originalName?: string
    mimeType?: string
    contentType?: string
    type?: string
    size: number
    url?: string | null
  } | null
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
}

export function AttachmentPreview({
  attachment,
  isOpen,
  onClose,
  onDownload,
}: AttachmentPreviewProps) {
  const [showSecurityWarning, setShowSecurityWarning] = useState(false)
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false)
  const [securityChecked, setSecurityChecked] = useState(false)

  if (!attachment) return null

  const type = attachment.type || attachment.contentType || attachment.mimeType || ""
  const filename = attachment.filename || attachment.originalName || "dosya"

  // Eğer type boşsa, dosya uzantısından tahmin et
  let detectedType = type
  if (!detectedType || detectedType === "") {
    const extension = filename.toLowerCase().split('.').pop()
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        detectedType = 'image/jpeg'
        break
      case 'png':
        detectedType = 'image/png'
        break
      case 'gif':
        detectedType = 'image/gif'
        break
      case 'webp':
        detectedType = 'image/webp'
        break
      case 'pdf':
        detectedType = 'application/pdf'
        break
      case 'txt':
        detectedType = 'text/plain'
        break
      case 'zip':
        detectedType = 'application/zip'
        break
      case 'rar':
        detectedType = 'application/x-rar-compressed'
        break
      case 'doc':
      case 'docx':
        detectedType = 'application/msword'
        break
      case 'xls':
      case 'xlsx':
        detectedType = 'application/vnd.ms-excel'
        break
      case 'ppt':
      case 'pptx':
        detectedType = 'application/vnd.ms-powerpoint'
        break
      default:
        detectedType = 'application/octet-stream'
    }
  }

  // Güvenli dosya türleri
  const isSafeImage = detectedType.startsWith("image/") && 
    (detectedType.includes("jpeg") || detectedType.includes("jpg") || detectedType.includes("png") || detectedType.includes("gif") || detectedType.includes("webp"))
  const isSafePdf = detectedType.includes("pdf")
  const isSafeText = detectedType.startsWith("text/plain")

  // Potansiyel riskli dosya türleri
  const isExecutable = detectedType.includes("exe") || 
    detectedType.includes("application/x-msdownload") ||
    detectedType.includes("application/x-executable") ||
    filename.endsWith(".exe") || 
    filename.endsWith(".bat") || 
    filename.endsWith(".cmd") || 
    filename.endsWith(".sh") ||
    filename.endsWith(".dmg") ||
    filename.endsWith(".app")

  const isScript = detectedType.includes("javascript") || 
    detectedType.includes("script") ||
    filename.endsWith(".js") || 
    filename.endsWith(".vbs") || 
    filename.endsWith(".ps1")

  const isArchive = detectedType.includes("zip") || 
    detectedType.includes("rar") || 
    detectedType.includes("7z") || 
    detectedType.includes("tar") ||
    detectedType.includes("gz") ||
    filename.endsWith(".zip") ||
    filename.endsWith(".rar") ||
    filename.endsWith(".7z")

  const isOfficeDocument = detectedType.includes("word") || 
    detectedType.includes("excel") || 
    detectedType.includes("powerpoint") ||
    detectedType.includes("msword") ||
    detectedType.includes("ms-excel") ||
    detectedType.includes("ms-powerpoint") ||
    detectedType.includes("openxmlformats")

  // Riskli dosya türleri
  const isDangerous = isExecutable || isScript

  // Önizlenebilir mi?
  const canPreviewSafely = isSafeImage || isSafePdf || isSafeText

  // Önizleme yap
  const renderPreview = () => {
    if (!attachment.url) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-8">
          <FileWarning className="h-16 w-16 text-orange-500 mb-4" />
          <p className="text-lg font-medium">Dosya URL'si bulunamadı</p>
          <p className="text-sm text-muted-foreground mt-2">
            Bu dosya için önizleme yapılamıyor.
          </p>
        </div>
      )
    }

    if (isDangerous && !securityChecked) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-600">Tehlikeli Dosya Türü Tespit Edildi</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Bu dosya potansiyel olarak tehlikeli olabilir ({type || "bilinmeyen tür"}). 
            Güvenilir bir kaynaktan geldiğinden emin değilseniz açmayın veya indirmeyin.
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              İptal Et
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setSecurityChecked(true)
                toast.warning("Dosyayı kendi sorumluluğunuzda görüntülüyorsunuz")
              }}
            >
              Yine de Devam Et
            </Button>
          </div>
        </div>
      )
    }

    if (isSafeImage) {
      return (
        <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4 min-h-[400px] max-h-[600px]">
          <img
            src={attachment.url}
            alt={filename}
            className="max-w-full max-h-[550px] object-contain rounded"
            crossOrigin="anonymous"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `
                  <div class="flex flex-col items-center justify-center text-center p-8">
                    <svg class="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p class="text-lg font-medium mb-2">Resim Yüklenemedi</p>
                    <p class="text-sm text-muted-foreground max-w-md">
                      Resim URL'si geçersiz veya erişilemiyor olabilir.<br/>
                      URL: ${attachment.url || 'Bulunamadı'}
                    </p>
                    <p class="text-xs text-muted-foreground mt-4">
                      Dosyayı indirmeyi deneyebilirsiniz.
                    </p>
                  </div>
                `
              }
              toast.error("Resim yüklenemedi - URL geçersiz olabilir")
              console.error('Image load error:', {
                url: attachment.url,
                filename: filename,
                originalType: type,
                detectedType: detectedType
              })
            }}
          />
        </div>
      )
    }

    if (isSafePdf) {
      const pdfUrl = attachment.url || ''
      // Google Docs Viewer kullan - tüm PDF'ler için çalışır
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
      
      return (
        <div className="w-full min-h-[600px] rounded-lg overflow-hidden">
    
          
          <div className="relative w-full h-[600px] bg-gray-50 dark:bg-gray-900">
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title={filename}
              onLoad={() => {
                console.log('PDF loaded successfully via Google Docs Viewer')
              }}
              onError={(e) => {
                console.error('PDF Viewer error:', {
                  originalUrl: attachment.url,
                  viewerUrl: viewerUrl,
                  error: e
                })
              }}
            />
          </div>
          
          <div className="p-3 bg-muted/30 border-t text-center">
            <p className="text-xs text-muted-foreground">
              PDF açılmıyorsa lütfen dosyayı indirip bilgisayarınızda açın
            </p>
          </div>
        </div>
      )
    }

    if (isSafeText) {
      return (
        <div className="w-full h-[400px] rounded-lg overflow-auto bg-muted/30 p-4">
          <iframe
            src={attachment.url}
            className="w-full h-full border-0"
            title={filename}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )
    }

    // Office belgeleri ve arşivler için uyarı
    if (isOfficeDocument || isArchive) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-8">
          <Shield className="h-16 w-16 text-yellow-500 mb-4" />
          <p className="text-lg font-medium">Önizleme Yapılamıyor</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            {isOfficeDocument 
              ? "Office belgelerinin önizlemesi güvenlik nedeniyle desteklenmiyor. Dosyayı indirip bilgisayarınızda açabilirsiniz."
              : "Arşiv dosyalarının önizlemesi yapılamaz. İçeriği görmek için dosyayı indirmeniz gerekir."
            }
          </p>
          {isArchive && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-left">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Güvenlik Uyarısı</p>
                  <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                    Arşiv dosyaları zararlı içerik barındırabilir. Sadece güvenilir kaynaklardan gelen 
                    arşiv dosyalarını açın.
                  </p>
                </div>
              </div>
            </div>
          )}
          <Button 
            onClick={() => setShowDownloadConfirm(true)} 
            className="mt-6"
            variant={isArchive ? "outline" : "default"}
          >
            <Download className="h-4 w-4 mr-2" />
            Dosyayı İndir
          </Button>
        </div>
      )
    }

    // Diğer dosya türleri için genel uyarı
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8">
        <Eye className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Önizleme Desteklenmiyor</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Bu dosya türü ({detectedType || "bilinmeyen"}) için önizleme yapılamıyor. 
          Dosyayı indirip uygun bir programla açabilirsiniz.
        </p>
        <Button 
          onClick={() => setShowDownloadConfirm(true)} 
          className="mt-6"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Dosyayı İndir
        </Button>
      </div>
    )
  }

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownloadClick = () => {
    if (isDangerous || isArchive || isOfficeDocument) {
      setShowDownloadConfirm(true)
    } else {
      onDownload()
    }
  }

  const confirmDownload = () => {
    setShowDownloadConfirm(false)
    onDownload()
    toast.success("Dosya indiriliyor...")
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate">{filename}</DialogTitle>
            <DialogDescription className="flex items-center gap-3 mt-2">
              <span>{formatFileSize(attachment.size)}</span>
              {detectedType && <span className="text-xs">•</span>}
              {detectedType && <span className="text-xs">{detectedType}</span>}
            </DialogDescription>
          </DialogHeader>

          {/* Güvenlik Durumu */}
          <div className="mt-2">
            {isDangerous && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 dark:text-red-200">Tehlikeli Dosya!</p>
                    <p className="text-red-700 dark:text-red-300 mt-1">
                      Bu dosya çalıştırılabilir veya script içeriyor. Güvenilir bir kaynaktan geldiğinden 
                      emin değilseniz açmayın.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {(isArchive || isOfficeDocument) && !isDangerous && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Dikkat</p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                      Bu dosya türü makrolar veya gömülü içerik barındırabilir. Sadece güvendiğiniz 
                      kaynaklardan gelen dosyaları açın.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {canPreviewSafely && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800 dark:text-green-200">Güvenli Önizleme</p>
                    <p className="text-green-700 dark:text-green-300 mt-1">
                      Bu dosya güvenli bir şekilde önizlenebilir.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Önizleme Alanı */}
          <div className="flex-1 overflow-auto mt-4">
            {renderPreview()}
          </div>

          <DialogFooter className="flex-row justify-between items-center gap-2 sm:gap-0 mt-4">
            <div className="text-xs text-muted-foreground">
              {isDangerous ? (
                <span className="text-red-600 font-medium">⚠️ Riskli dosya</span>
              ) : canPreviewSafely ? (
                <span className="text-green-600 font-medium">✓ Güvenli</span>
              ) : (
                <span className="text-yellow-600 font-medium">⚠ Dikkatli olun</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Kapat
              </Button>
              <Button onClick={handleDownloadClick}>
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* İndirme Onay Dialog'u */}
      <AlertDialog open={showDownloadConfirm} onOpenChange={setShowDownloadConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              İndirme Onayı
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  <strong>{filename}</strong> dosyasını indirmek üzeresiniz.
                </p>
                {isDangerous && (
                  <p className="text-red-600 font-medium">
                    ⚠️ Bu dosya potansiyel olarak tehlikelidir! Çalıştırılabilir veya script 
                    içeriyor. Sadece güvenilir bir kaynaktan geliyorsa indirin.
                  </p>
                )}
                {isArchive && !isDangerous && (
                  <p className="text-yellow-600">
                    Bu bir arşiv dosyasıdır. İçeriğinde zararlı dosyalar olabilir. Sadece 
                    güvendiğiniz kaynaklardan gelen arşivleri açın.
                  </p>
                )}
                {isOfficeDocument && !isDangerous && (
                  <p className="text-yellow-600">
                    Office belgeleri makro ve gömülü içerik barındırabilir. Güvenilir bir 
                    kaynaktan geldiğinden emin olun.
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Bu dosyayı kendi sorumluluğunuzda indiriyorsunuz.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDownload}
              className={isDangerous ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isDangerous ? "Yine de İndir" : "İndir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

