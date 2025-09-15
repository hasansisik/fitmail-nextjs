"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Step1PersonalInfo } from "./register/step1-personal-info"
import { Step2BasicInfo } from "./register/step2-basic-info"
import { Step3Email } from "./register/step3-email"
import { Step4Password } from "./register/step4-password"
import { Step5PrivacyPolicy } from "./register/step5-privacy-policy"
import { Step6Terms } from "./register/step6-terms"
import { PolicyDialog } from "./register/policy-dialog"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    day: "",
    month: "",
    year: "",
    gender: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPolicyDialog, setShowPolicyDialog] = useState(false)
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy')
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePolicyClick = (type: 'privacy' | 'terms') => {
    setPolicyType(type)
    setShowPolicyDialog(true)
    setHasScrolledToBottom(false)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
    setHasScrolledToBottom(isAtBottom)
  }

  const handlePolicyAccept = () => {
    if (policyType === 'privacy') {
      setPrivacyPolicyAccepted(true)
    } else {
      setTermsAccepted(true)
    }
    setShowPolicyDialog(false)
    setHasScrolledToBottom(false)
  }


  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    // Simulate registration process
    console.log("Registration successful")
    // Redirect to mail page
    router.push("/mail")
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PersonalInfo
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
          />
        )
      
      case 2:
        return (
          <Step2BasicInfo
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      
      case 3:
        return (
          <Step3Email
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      
      case 4:
        return (
          <Step4Password
            formData={formData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onBack={handleBack}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />
        )
      
      case 5:
        return (
          <Step5PrivacyPolicy
            formData={formData}
            privacyPolicyAccepted={privacyPolicyAccepted}
            onPolicyClick={handlePolicyClick}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      
      case 6:
        return (
          <Step6Terms
            formData={formData}
            termsAccepted={termsAccepted}
            onPolicyClick={handlePolicyClick}
            onSubmit={(e) => handleSubmit(e)}
            onBack={handleBack}
          />
        )
      
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Bir Fitmail Hesabı Oluşturun"
      case 2:
        return "Temel Bilgiler"
      case 3:
        return "E-posta adresiniz nedir?"
      case 4:
        return "Şifre oluşturun"
      case 5:
        return "Gizlilik Politikası"
      case 6:
        return "Kullanım Şartları"
      default:
        return "Hesap oluşturun"
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Adınızı ve soyadınızı girin"
      case 2:
        return "Doğum tarihinizi ve cinsiyetinizi seçin"
      case 3:
        return "E-posta adresinizi girin"
      case 4:
        return "Güvenli bir şifre seçin"
      case 5:
        return "Gizlilik politikamızı okuyun ve kabul edin"
      case 6:
        return "Kullanım şartlarımızı okuyun ve kabul edin"
      default:
        return "Hesabınızı oluşturmak için bilgilerinizi girin"
    }
  }

  return (
    <>
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {getStepDescription()}
          </p>
        </div>
        {renderStep()}
        <div className="text-center text-sm">
          Zaten hesabınız var mı?{" "}
          <a href="/login" className="underline underline-offset-4">
            Giriş yap
          </a>
        </div>
      </form>
      <PolicyDialog
        showPolicyDialog={showPolicyDialog}
        setShowPolicyDialog={setShowPolicyDialog}
        policyType={policyType}
        hasScrolledToBottom={hasScrolledToBottom}
        setHasScrolledToBottom={setHasScrolledToBottom}
        onPolicyAccept={handlePolicyAccept}
        onScroll={handleScroll}
      />
    </>
  )
}
