"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Step6Props {
  formData: {
    email: string
  }
  termsAccepted: boolean
  onPolicyClick: (type: 'privacy' | 'terms') => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

export function Step6Terms({ 
  formData, 
  termsAccepted, 
  onPolicyClick, 
  onSubmit, 
  onBack 
}: Step6Props) {
  return (
    <div className="grid gap-6">
      {/* Email info */}
      <div className="text-center">
        <div className="text-sm text-gray-500 dark:text-gray-500">
          {formData.email}@gozdedijital.xyz
        </div>
      </div>

      {/* Policy content area */}
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 max-h-64 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={() => onPolicyClick('terms')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="terms"
                className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer leading-5"
                onClick={() => onPolicyClick('terms')}
              >
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  Kullanım Şartları
                </span>
                'nı okudum ve kabul ediyorum
              </label>
            </div>
          </div>
          
          {/* Policy preview text */}
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p><strong>1. Hizmet Tanımı</strong></p>
            <p>Gözde Dijital, kullanıcılara e-posta hizmeti sunan bir platformdur...</p>
            <p><strong>2. Hesap Sorumluluğu</strong></p>
            <p>Hesabınızı oluştururken doğru ve güncel bilgiler vermeniz gerekmektedir...</p>
            <p className="font-bold text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => onPolicyClick('terms')}>
              Devamını okumak için tıklayın...
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Geri
        </Button>
        <Button 
          type="submit" 
          onClick={(e) => onSubmit(e)}
          className="flex-1"
          disabled={!termsAccepted}
        >
          Hesap Oluştur
        </Button>
      </div>
    </div>
  )
}
