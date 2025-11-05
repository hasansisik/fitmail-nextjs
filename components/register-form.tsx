"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { register, checkEmailAvailability, loadUser } from "@/redux/actions/userActions"
import { toast } from "sonner"
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
  const dispatch = useAppDispatch()
  const { emailCheck, premiumCodeCheck } = useAppSelector((state) => state.user)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    recoveryEmail: "",
    password: "",
    confirmPassword: "",
    day: "",
    month: "",
    year: "",
    gender: "",
    premiumCode: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPolicyDialog, setShowPolicyDialog] = useState(false)
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy')
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

  // Debounced email check function
  const debouncedEmailCheck = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (email: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (email && email.length >= 3) {
            dispatch(checkEmailAvailability({ email: `${email}@fitmail.com` }));
          }
        }, 500);
      };
    })(),
    [dispatch]
  );

  // Check email availability when email changes
  useEffect(() => {
    if (formData.email && formData.email.length >= 3) {
      debouncedEmailCheck(formData.email);
    }
  }, [formData.email, debouncedEmailCheck]);

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
    // Check first step validation
    if (currentStep === 1) {
      if (!formData.firstName || formData.firstName.trim() === '') {
        toast.error("Lütfen adınızı girin!")
        return
      }
      if (!formData.lastName || formData.lastName.trim() === '') {
        toast.error("Lütfen soyadınızı girin!")
        return
      }
    }
    
    // Check age validation on step 2
    if (currentStep === 2) {
      if (!formData.day || !formData.month || !formData.year) {
        toast.error("Lütfen doğum tarihinizi tam olarak girin!")
        return
      }
      
      // Calculate age
      const birthDate = new Date(
        parseInt(formData.year), 
        parseInt(formData.month) - 1, 
        parseInt(formData.day)
      )
      
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age
      
      if (actualAge < 13) {
        toast.error("13 yaşından küçük kullanıcılar kayıt olamaz!")
        return
      }
      
      if (actualAge > 120) {
        toast.error("Geçerli bir yaş girin!")
        return
      }
    }
    
    // Check email validation on step 3
    if (currentStep === 3) {
      if (!formData.email || formData.email.trim() === '') {
        toast.error("E-posta adresi gereklidir!")
        return
      }
      if (formData.email.length < 3) {
        toast.error("E-posta adresi en az 3 karakter olmalıdır!")
        return
      }
      // Check if email contains invalid characters
      if (!/^[a-zA-Z0-9._-]+$/.test(formData.email)) {
        toast.error("E-posta adresi sadece harf, rakam, nokta, alt çizgi ve tire içerebilir!")
        return
      }
      // Check if email is available
      if (emailCheck?.available === false) {
        toast.error("Bu e-posta adresi zaten kullanılıyor!")
        return
      }
      // Check if email is still being checked
      if (emailCheck?.loading) {
        toast.error("E-posta adresi kontrol ediliyor, lütfen bekleyin!")
        return
      }
      // Check recovery email
      if (!formData.recoveryEmail || formData.recoveryEmail.trim() === '') {
        toast.error("Kurtarıcı e-posta adresi gereklidir!")
        return
      }
      // Basic email format validation for recovery email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.recoveryEmail)) {
        toast.error("Geçerli bir kurtarıcı e-posta adresi girin!")
        return
      }
      // Check premium code if domain is premium
      if (emailCheck?.isPremium) {
        if (!formData.premiumCode || formData.premiumCode.trim() === '') {
          toast.error("Premium domain için kod gereklidir!")
          return
        }
        if (formData.premiumCode.length !== 5) {
          toast.error("Premium kod 5 haneli olmalıdır!")
          return
        }
      }
    }
    
    // Check password match on step 4
    if (currentStep === 4) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Şifreler eşleşmiyor!")
        return
      }
      if (formData.password.length < 6) {
        toast.error("Şifre en az 6 karakter olmalıdır!")
        return
      }
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create birth date from day, month, year
    const birthDate = new Date(
      parseInt(formData.year), 
      parseInt(formData.month) - 1, 
      parseInt(formData.day)
    )
    
    // Calculate age
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age
    
    // Prepare registration data
    const registrationData = {
      name: formData.firstName,
      surname: formData.lastName,
      email: `${formData.email}@fitmail.com`,
      recoveryEmail: formData.recoveryEmail,
      password: formData.password,
      birthDate: birthDate.toISOString(),
      age: actualAge,
      gender: formData.gender,
      premiumCode: formData.premiumCode || undefined
    }
    
    const loadingToastId = toast.loading("Kayıt yapılıyor...")
    
    try {
      // Call Redux action for registration
      const result = await dispatch(register(registrationData)).unwrap()
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Registration successful - backend already set cookies
      // Now load user data from cookie to update Redux state
      try {
        await dispatch(loadUser()).unwrap()
        toast.success("Kayıt başarılı! Hoş geldiniz.")
        // Redirect to mail page (user is already authenticated via cookie)
        router.push("/mail")
      } catch (loadError) {
        // If loadUser fails, still try to redirect - cookie might be set
        console.error("Failed to load user after registration:", loadError)
        toast.success("Kayıt başarılı! Hoş geldiniz.")
        router.push("/mail")
      }
    } catch (error: any) {
      console.error("Registration failed:", error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Check if it's a token expiration error (should not happen during registration)
      if (error?.message?.includes('Oturum süreniz dolmuş') || error?.message?.includes('requiresLogout')) {
        // This shouldn't happen during registration, but just in case
        window.location.href = '/giris'
        return
      }
      
      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Kayıt olurken bir hata oluştu"
      toast.error(errorMessage)
    }
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
            emailCheck={emailCheck}
            premiumCodeCheck={premiumCodeCheck}
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
        return "Ne oluşturmak istiyorsunuz?"
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
        return "E-posta adresinizi oluşturun"
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
          <a href="/giris" className="underline underline-offset-4">
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
