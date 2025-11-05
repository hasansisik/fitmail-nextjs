"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Step5Props {
  formData: {
    email: string
  }
  privacyPolicyAccepted: boolean
  onPolicyClick: (type: 'privacy' | 'terms') => void
  onNext: () => void
  onBack: () => void
}

export function Step5PrivacyPolicy({ 
  formData, 
  privacyPolicyAccepted, 
  onPolicyClick, 
  onNext, 
  onBack 
}: Step5Props) {
  return (
    <div className="grid gap-6">
      {/* Email info */}
      <div className="text-center">
        <div className="text-sm text-gray-500 dark:text-gray-500">
          {formData.email}@fitmail.com
        </div>
      </div>

      {/* Policy content area */}
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 max-h-64 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox 
              id="privacy-policy" 
              checked={privacyPolicyAccepted}
              onCheckedChange={() => onPolicyClick('privacy')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="privacy-policy"
                className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer leading-5"
                onClick={() => onPolicyClick('privacy')}
              >
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  Gizlilik Politikası
                </span>
                'nı okudum ve kabul ediyorum
              </label>
            </div>
          </div>
          
          {/* Policy preview text */}
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p><strong>1. Kişisel Verilerin Toplanması</strong></p>
            <p>Fitmail olarak, hizmetlerimizi sunabilmek için belirli kişisel verilerinizi topluyoruz...</p>
            <p><strong>2. Verilerin Kullanımı</strong></p>
            <p>Topladığımız kişisel verileri aşağıdaki amaçlarla kullanırız...</p>
            <p className="font-bold text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => onPolicyClick('privacy')}>
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
          type="button" 
          onClick={onNext} 
          className="flex-1"
          disabled={!privacyPolicyAccepted}
        >
          İleri
        </Button>
      </div>
    </div>
  )
}
