import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  User, 
  Smartphone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Gauge, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

import { InputField } from './old/InputField';
import { OtpInput } from './old/OtpInput';
import { Toast, ToastMessage } from './old/Toast';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Modal } from 'antd';


export const AuthPage = () => {
  const navigate = useNavigate();
  
  const showTermsModal = () => {
    Modal.info({
      title: 'Điều khoản dịch vụ - UrbanPark',
      content: (
        <div className="text-sm text-slate-600 mt-4 h-64 overflow-y-auto pr-2">
          <p className="mb-2 font-bold text-slate-800">1. Chấp nhận điều khoản</p>
          <p className="mb-4">Bằng việc đăng ký tài khoản UrbanPark, bạn đồng ý tuân thủ các quy định về việc sử dụng bãi đỗ xe thông minh của chúng tôi.</p>
          <p className="mb-2 font-bold text-slate-800">2. Trách nhiệm của chủ phương tiện</p>
          <p className="mb-4">Chủ phương tiện phải đỗ xe đúng nơi quy định, tự bảo quản tư trang cá nhân. Ban quản lý không chịu trách nhiệm đối với các mất mát tài sản để trong xe.</p>
          <p className="mb-2 font-bold text-slate-800">3. Phí đỗ xe và Thanh toán</p>
          <p className="mb-4">Phí đỗ xe được tính theo bảng giá niêm yết hiện hành. Khách hàng có trách nhiệm thanh toán đầy đủ qua các hình thức khả dụng trước khi xe rời bãi.</p>
          <p className="mb-2 font-bold text-slate-800">4. Quy định an toàn</p>
          <p className="mb-4">Tuân thủ nghiêm ngặt các quy định về phòng cháy chữa cháy, tốc độ tối đa 5km/h trong khuôn viên bãi đỗ xe.</p>
        </div>
      ),
      width: 500,
      okText: 'Đã hiểu',
      centered: true,
      maskClosable: true,
    });
  };

  const showPrivacyModal = () => {
    Modal.info({
      title: 'Chính sách bảo mật - UrbanPark',
      content: (
        <div className="text-sm text-slate-600 mt-4 h-64 overflow-y-auto pr-2">
          <p className="mb-2 font-bold text-slate-800">1. Thu thập dữ liệu</p>
          <p className="mb-4">Hệ thống LPR (Nhận diện biển số) sẽ tự động ghi hình và trích xuất biển số xe của bạn khi ra vào bãi đỗ để phục vụ việc tính phí và đảm bảo an ninh.</p>
          <p className="mb-2 font-bold text-slate-800">2. Bảo vệ thông tin cá nhân</p>
          <p className="mb-4">Thông tin cá nhân (SĐT, Tên) và dữ liệu lịch sử xe ra vào của bạn được mã hóa an toàn và chỉ sử dụng cho mục đích vận hành bãi đỗ xe.</p>
          <p className="mb-2 font-bold text-slate-800">3. Chia sẻ dữ liệu</p>
          <p className="mb-4">Chúng tôi cam kết không bán hoặc chia sẻ dữ liệu của bạn cho bên thứ 3 với mục đích thương mại. Dữ liệu chỉ cung cấp cho cơ quan chức năng khi có yêu cầu hợp pháp.</p>
        </div>
      ),
      width: 500,
      okText: 'Đã hiểu',
      centered: true,
      maskClosable: true,
    });
  };
  // User Session Management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Navigation / Auth Mode toggle
  const [isSignUp, setIsSignUp] = useState(true);
  
  // Form input states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Sign In values
  const [signEmail, setSignEmail] = useState('');
  const [signPass, setSignPass] = useState('');

  // Password visibility
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showSignPass, setShowSignPass] = useState(false);

  // OTP Countdown & verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // UI States & feedback
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password values
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPass, setForgotPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);

  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpTimer, setForgotOtpTimer] = useState(0);
  const [forgotOtp, setForgotOtp] = useState('');

  // Login OTP verification states
  const [loginOtpRequired, setLoginOtpRequired] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [loginOtpTimer, setLoginOtpTimer] = useState(0);

  // Handle countdown trigger for simulated SMS OTP
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    let interval;
    if (forgotOtpTimer > 0) {
      interval = setInterval(() => {
        setForgotOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotOtpTimer]);

  useEffect(() => {
    let interval;
    if (loginOtpTimer > 0) {
      interval = setInterval(() => {
        setLoginOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginOtpTimer]);

  // Utility toast dispatcher
  const showNotification = (text: string, type = "info") => {
    setToast({
      id: Date.now().toString(),
      text,
      type
    });
  };

  // Click handler to request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    // Clear old errors related to email
    const newErrors = { ...errors };
    delete newErrors.email;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
      setErrors(newErrors);
      showNotification('Vui lòng cung cấp địa chỉ email.', 'error');
      return;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
      setErrors(newErrors);
      showNotification('Địa chỉ email không đúng định dạng.', 'error');
      return;
    }

    setErrors(newErrors);
    setIsSubmitting(true);
    
    const res = await authService.sendOtp(email.trim());
    setIsSubmitting(false);
    
    if (res.success) {
      setOtpSent(true);
      setOtpTimer(60);
      showNotification('Đã gửi mã xác thực tới email của bạn. Vui lòng kiểm tra hộp thư!', 'success');
    } else {
      showNotification(res.message || 'Không thể gửi mã xác thực. Vui lòng thử lại!', 'error');
    }
  };

  // Form validations
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Vui lòng điền họ và tên';
    } else if (name.trim().length < 4) {
      newErrors.name = 'Họ và tên phải dài ít nhất 4 ký tự';
    }

    const phoneNoSpaces = phone.replace(/\s+/g, '');
    const vietnamPhoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!phoneNoSpaces) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!vietnamPhoneRegex.test(phoneNoSpaces)) {
      newErrors.phone = 'Số điện thoại không đúng định dạng (Ví dụ: 0901234567)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với Điều khoản và Chính sách của chúng tôi';
    }

    setErrors(newErrors);
    return newErrors;
  };

  // Handle Form Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      if (Object.keys(newErrors).length === 1 && newErrors.otp) {
        showNotification('Chưa xác nhận OTP', 'error');
      } else {
        showNotification('Vui lòng sửa các lỗi thông tin đăng ký bên dưới.', 'error');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const phoneClean = phone.replace(/\s+/g, '');
      const result = await authService.register(
        phoneClean, // username
        password,
        name.trim(), // fullName
        email.trim(),
        phoneClean, // phone
        "" // otp (removed/skipped)
      );

      setIsSubmitting(false);
      
      if (result.success) {
        setIsRegistered(true);
        showNotification('Đăng ký tài khoản Driver Portal thành công!', 'success');
      } else {
        showNotification(result.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      setIsSubmitting(false);
      showNotification('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.', 'error');
    }
  };

  // Click handler to request OTP for forgot password
  const handleRequestForgotOtp = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!forgotEmail) {
      showNotification('Vui lòng cung cấp địa chỉ email.', 'error');
      return;
    } else if (!emailRegex.test(forgotEmail)) {
      showNotification('Địa chỉ email không đúng định dạng.', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await authService.sendOtp(forgotEmail.trim());
    setIsSubmitting(false);

    if (res.success) {
      setForgotOtpSent(true);
      setForgotOtpTimer(60);
      showNotification('Đã gửi mã xác thực tới email của bạn. Vui lòng kiểm tra hộp thư!', 'success');
    } else {
      showNotification(res.message || 'Không thể gửi mã xác thực. Vui lòng thử lại!', 'error');
    }
  };

  // Handle Forgot Password Submission
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showNotification('Vui lòng điền địa chỉ email', 'error');
      return;
    }
    
    if (!forgotOtpSent) {
      showNotification('Chưa xác nhận OTP', 'error');
      return;
    } else if (!forgotOtp) {
      showNotification('Vui lòng nhập mã xác thực OTP', 'error');
      return;
    }

    if (!forgotPass || forgotPass.length < 6) {
      showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    if (forgotPass !== forgotConfirmPass) {
      showNotification('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await authService.resetPassword(forgotEmail.trim(), forgotOtp.trim(), forgotPass);
    setIsSubmitting(false);

    if (result.success) {
      showNotification('Khôi phục mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');
      
      // Reset form and go back to login
      setForgotEmail('');
      setForgotPass('');
      setForgotConfirmPass('');
      setForgotOtp('');
      setForgotOtpSent(false);
      setForgotOtpTimer(0);
      setIsForgotPassword(false);
      setIsSignUp(false);
    } else {
      showNotification(result.message || 'Khôi phục mật khẩu thất bại.', 'error');
    }
  };
  const maskEmail = (emailStr: string) => {
    if (!emailStr) return '';
    const parts = emailStr.split('@');
    if (parts.length !== 2) return emailStr;
    const namePart = parts[0];
    const domainPart = parts[1];
    if (namePart.length <= 2) {
      return namePart + '***@' + domainPart;
    }
    return namePart.substring(0, 2) + '***' + namePart.substring(namePart.length - 1) + '@' + domainPart;
  };

  const handleCancelLoginOtp = () => {
    setLoginOtpRequired(false);
    setLoginOtp('');
    setMaskedEmail('');
    setLoginOtpTimer(0);
  };

  const handleResendLoginOtp = async (e) => {
    e.preventDefault();
    if (loginOtpTimer > 0) return;
    
    setIsSubmitting(true);
    const result = await authService.login(signEmail.trim(), signPass, null);
    setIsSubmitting(false);
    
    if (result.success && result.requiresOtp) {
      setLoginOtpTimer(60);
      showNotification(result.message || 'Mã OTP mới đã được gửi về email của bạn!', 'success');
    } else {
      showNotification(result.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại!', 'error');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!signEmail) {
      showNotification('Vui lòng điền địa chỉ email', 'error');
      return;
    }
    if (!signPass) {
      showNotification('Vui lòng điền mật khẩu', 'error');
      return;
    }
    if (loginOtpRequired && !loginOtp) {
      showNotification('Vui lòng điền mã OTP để xác nhận đăng nhập', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await authService.login(
      signEmail.trim(), 
      signPass, 
      loginOtpRequired ? loginOtp.trim() : null
    );
    setIsSubmitting(false);

    if (result.success) {
      if (result.requiresOtp) {
        // Backend yêu cầu xác thực OTP gửi qua email
        setLoginOtpRequired(true);
        setMaskedEmail(maskEmail(result.email));
        setLoginOtpTimer(60);
        showNotification(result.message || 'Mã OTP đã được gửi về email của bạn!', 'success');
      } else {
        showNotification('Đăng nhập thành công!', 'success');
        
        const user = result.user;
        setTimeout(() => {
          if (user && user.role === 'DRIVER') {
            navigate('/driver');
          } else if (user && user.role === 'STAFF') {
            navigate('/staff-dashboard');
          } else {
            navigate('/admin');
          }
        }, 500);
      }
    } else {
      showNotification(result.message || 'Đăng nhập thất bại', 'error');
    }
  };

  // Reset form to start afresh
  const handleReset = () => {
    setName('');
    setPhone('');
    setOtp('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreeTerms(false);
    setOtpSent(false);
    setOtpTimer(0);
    setErrors({});
    setIsRegistered(false);
    setLoginOtpRequired(false);
    setLoginOtp('');
    setMaskedEmail('');
    setSignEmail('');
    setSignPass('');
  };

  

  return (
    <div id="app-root" className="min-h-screen bg-slate-100/70 py-4 px-4 sm:p-6 md:p-12 flex items-center justify-center relative overflow-hidden">
      
      {/* Decorative ambient glowing background circles */}
      <div className="absolute top-0 right-1/4 w-[380px] h-[380px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-sky-300/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main card box with splitting grid structure */}
      <div 
        id="portal-card" 
        className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[750px] border border-slate-200/50 relative z-10"
      >
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* 1. LEFT PANEL: Decorative Dark/Cyan futuristic infrastructure board */}
        <div 
          id="left-visual-panel" 
          className="col-span-1 md:col-span-5 relative overflow-hidden bg-slate-950 flex flex-col justify-between p-8 md:p-10 select-none text-white order-2 md:order-1"
        >
          {/* Real urban architecture textured overlay with beautiful tint blended in CSS */}
          <div 
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35" 
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80")' 
            }}
          />

          {/* Deep celestial cyber gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020d18]/90 via-[#051a31]/95 to-[#010811]/98 z-0" />
          
          {/* Animated custom neon light bar effects */}
          <motion.div 
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/20 blur-[80px] pointer-events-none z-0"
          />
          <motion.div 
            animate={{ opacity: [0.1, 0.25, 0.1], scale: [1.1, 0.95, 1.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-teal-400/15 blur-[90px] pointer-events-none z-0"
          />

          {/* Content wrapping */}
          <div className="relative z-10 flex flex-col justify-between h-full gap-8 min-h-[480px] md:min-h-0">
            {/* Top Brand Logo Banner */}
            <div id="brand-header" className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div id="brand-logo-container" className="p-2.5 bg-blue-600/20 rounded-xl border border-blue-500/30 shadow-xs">
                  <Car id="brand-logo-icon" className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                  UrbanPark
                </h1>
              </div>
              <p className="text-[13.5px] leading-relaxed text-slate-300 font-light max-w-sm mt-3">
                Hệ thống quản lý cơ sở hạ tầng đô thị thông minh. Quản lý phương tiện và tài khoản của bạn một cách dễ dàng và an toàn.
              </p>
            </div>

            {/* Bottom highlights listing (Bảo mật and Nhanh Chóng widgets) */}
            <div id="brand-features" className="flex flex-col gap-4 mt-auto">
              <div 
                id="feat-security"
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-start gap-3.5 hover:bg-white/8 transition-colors"
              >
                <div className="p-2 bg-emerald-500/15 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck id="feat-security-icon" className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Bảo mật</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Dữ liệu được mã hóa đa lớp an toàn.
                  </p>
                </div>
              </div>

              <div 
                id="feat-speed"
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-start gap-3.5 hover:bg-white/10 transition-colors"
              >
                <div className="p-2 bg-blue-500/15 rounded-lg border border-blue-500/20 text-blue-400 shrink-0">
                  <Gauge id="feat-speed-icon" className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Nhanh chóng</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Xác thực OTP tức thời, không độ trễ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. RIGHT PANEL: Interactive forms with states */}
        <div 
          id="right-form-panel" 
          className="col-span-1 md:col-span-7 bg-white p-8 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center order-1 md:order-2"
        >
          <AnimatePresence mode="wait">
            
            {/* SUCCESS VIEW (If state isRegistered is true) */}
            {isRegistered ? (
              <motion.div
                key="success-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div id="check-brand-visual" className="p-4 bg-emerald-100 rounded-full text-emerald-600 mb-5 relative">
                  <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Tạo tài khoản thành công!
                </h2>
                <p className="text-[14px] text-slate-500 mt-2 max-w-sm">
                  Cảm ơn bạn đã lựa chọn UrbanPark. Tài khoản của bạn đã được khởi tạo và sẵn sàng tham gia Hệ thống thông minh.
                </p>

                {/* Simulated receipt summary panel */}
                <div id="receipt-details" className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-xl p-5 mt-6 text-left text-slate-700 text-sm space-y-3.5">
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2 flex-wrap gap-1">
                    <span className="text-slate-400 font-light">Tên tài xế:</span>
                    <span className="font-semibold text-slate-800">{name}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2 flex-wrap gap-1">
                    <span className="text-slate-400 font-light">Số điện thoại:</span>
                    <span className="font-mono text-slate-800">{phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2 flex-wrap gap-1">
                    <span className="text-slate-400 font-light">Email hệ thống:</span>
                    <span className="text-slate-800">{email}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-slate-400 font-light">Vai trò được cấp:</span>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      Urban Driver Portal Access
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-8">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Đăng ký mới
                  </button>
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setIsRegistered(false);
                    }}
                    className="flex-1 py-3 text-sm font-medium bg-[#051424] hover:bg-[#0c233d] text-white rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </motion.div>
            ) : isForgotPassword ? (
              /* FORGOT PASSWORD FLOW */
              <motion.form
                key="forgot-password-form"
                onSubmit={handleForgotPasswordSubmit}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="mb-6">
                  <h2 className="text-slate-900 text-3xl font-extrabold tracking-tight">
                    Khôi phục mật khẩu
                  </h2>
                  <p className="text-[14px] text-slate-500 mt-1 leading-relaxed">
                    Xác minh địa chỉ email để đặt lại mật khẩu mới cho tài khoản của bạn.
                  </p>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <InputField
                      id="forgot-email"
                      label="ĐỊA CHỈ EMAIL ĐÃ ĐĂNG KÝ"
                      placeholder="name@example.com"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      icon={<Mail className="w-4 h-4" />}
                      disabled={isSubmitting || forgotOtpSent}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleRequestForgotOtp}
                    disabled={isSubmitting || forgotOtpTimer > 0}
                    className={`
                      h-[42px] px-4 rounded-lg font-medium text-sm transition-colors shadow-sm whitespace-nowrap mb-[2px] cursor-pointer
                      ${forgotOtpTimer > 0 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                      }
                    `}
                  >
                    {forgotOtpTimer > 0 ? `Gửi lại (${forgotOtpTimer}s)` : 'Nhận mã OTP'}
                  </button>
                </div>

                {forgotOtpSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <OtpInput 
                      value={forgotOtp} 
                      onChange={setForgotOtp} 
                      disabled={isSubmitting} 
                    />
                  </motion.div>
                )}

                <InputField
                  id="forgot-pass"
                  label="MẬT KHẨU MỚI"
                  placeholder="Nhập mật khẩu mới ít nhất 6 ký tự"
                  type={showForgotPass ? "text" : "password"}
                  value={forgotPass}
                  onChange={(e) => setForgotPass(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  rightIcon={showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onRightIconClick={() => setShowForgotPass(!showForgotPass)}
                  disabled={isSubmitting}
                />

                <InputField
                  id="forgot-confirm-pass"
                  label="XÁC NHẬN MẬT KHẨU MỚI"
                  placeholder="Nhập lại mật khẩu mới"
                  type={showForgotConfirmPass ? "text" : "password"}
                  value={forgotConfirmPass}
                  onChange={(e) => setForgotConfirmPass(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  rightIcon={showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onRightIconClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                  disabled={isSubmitting}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#051424] hover:bg-[#0c233e] text-white font-semibold py-3.5 mt-2 rounded-lg tracking-wider text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 active:scale-[0.99] uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'KHÔI PHỤC MẬT KHẨU'
                  )}
                </button>

                <div className="text-center pt-4">
                  <span 
                    onClick={() => {
                      setForgotPhone('');
                      setForgotPass('');
                      setForgotConfirmPass('');
                      setForgotOtp('');
                      setForgotOtpSent(false);
                      setForgotOtpTimer(0);
                      setForgotExpectedOtp('');
                      setIsForgotPassword(false);
                    }}
                    className="text-slate-500 hover:text-slate-800 text-sm font-medium cursor-pointer flex items-center justify-center gap-1 inline-flex"
                  >
                    <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                  </span>
                </div>
              </motion.form>
            ) : isSignUp ? (
              
              /* SIGN UP FLOW (Exactly matches image layout fields) */
              <motion.form
                key="signup-form"
                onSubmit={handleRegisterSubmit}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-slate-900 text-3xl font-extrabold tracking-tight">
                    Tạo tài khoản
                  </h2>
                  <p className="text-[14px] text-slate-500 mt-1 leading-relaxed">
                    Đăng ký để truy cập Cổng thông tin tài xế ngay hôm nay.
                  </p>
                </div>

                {/* 1. Full name input */}
                <InputField
                  id="reg-name"
                  label="Họ và tên"
                  placeholder="Nguyễn Văn A"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  error={errors.name}
                  disabled={isSubmitting}
                />

                {/* 2. Email field */}
                <InputField
                  id="reg-email"
                  label="Địa chỉ email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email}
                  disabled={isSubmitting}
                />

                {/* 4. Phone number input (normal field) */}
                <InputField
                  id="reg-phone"
                  label="Số điện thoại"
                  placeholder="090 123 4567"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Smartphone className="w-4 h-4" />}
                  error={errors.phone}
                  disabled={isSubmitting}
                />

                {/* 5. Password field layout */}
                <InputField
                  id="reg-pass"
                  label="Mật khẩu"
                  placeholder="••••••••"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  rightIcon={showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onRightIconClick={() => setShowPass(!showPass)}
                  error={errors.password}
                  disabled={isSubmitting}
                />

                {/* 6. Password confirmation */}
                <InputField
                  id="reg-confirm"
                  label="Xác nhận mật khẩu"
                  placeholder="••••••••"
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  rightIcon={showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onRightIconClick={() => setShowConfirmPass(!showConfirmPass)}
                  error={errors.confirmPassword}
                  disabled={isSubmitting}
                />

                {/* 7. Terms condition checkbox */}
                <div className="pt-1.5">
                  <div className="flex items-start gap-3">
                    <input
                      id="reg-agree"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      disabled={isSubmitting}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="reg-agree" className="text-[13px] text-slate-600 leading-normal select-none">
                      Tôi đồng ý với{' '}
                      <span onClick={showTermsModal} className="text-blue-600 hover:underline cursor-pointer">Điều khoản dịch vụ</span>
                      {' '}và{' '}
                      <span onClick={showPrivacyModal} className="text-blue-600 hover:underline cursor-pointer">Chính sách bảo mật</span>
                      {' '}của UrbanPark.
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <span className="block text-xs text-red-500 mt-1">{errors.agreeTerms}</span>
                  )}
                </div>

                {/* Register Submission Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#051424] hover:bg-[#0c233e] text-white font-semibold py-3.5 rounded-lg tracking-wider text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 active:scale-[0.99] uppercase shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-85"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Đăng ký tài khoản'
                  )}
                </button>

                {/* Footer anchor */}
                <div className="text-center pt-4">
                  <p className="text-[13px] text-slate-500">
                    Đã có tài khoản?{' '}
                    <span 
                      onClick={() => {
                        setIsSignUp(false);
                        handleReset();
                      }}
                      className="text-blue-600 font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Đăng nhập ngay
                    </span>
                  </p>
                </div>
              </motion.form>
            ) : (
              
              /* SIGN IN FLOW (Designed to be functional, elegant) */
              <motion.form
                key="signin-form"
                onSubmit={handleLoginSubmit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-slate-900 text-3xl font-extrabold tracking-tight">
                    Cổng đăng nhập
                  </h2>
                  <p className="text-[14px] text-slate-500 mt-1 leading-relaxed">
                    Chào mừng tài xế quay trở lại với UrbanPark Portal.
                  </p>
                </div>

                {loginOtpRequired ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 bg-blue-50 border border-blue-200 p-3 rounded-lg leading-relaxed">
                      Mã OTP đã được gửi tới email của bạn (<strong>{maskedEmail}</strong>). Vui lòng nhập mã OTP để đăng nhập.
                    </p>
                    <OtpInput 
                      value={loginOtp} 
                      onChange={setLoginOtp} 
                      disabled={isSubmitting} 
                    />
                    
                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={handleCancelLoginOtp}
                        className="text-slate-500 hover:text-slate-800 hover:underline font-semibold cursor-pointer"
                      >
                        Quay lại nhập email & mật khẩu
                      </button>
                      
                      <button
                        type="button"
                        disabled={loginOtpTimer > 0 || isSubmitting}
                        onClick={handleResendLoginOtp}
                        className={`font-semibold cursor-pointer select-none transition-colors ${
                          loginOtpTimer > 0 
                            ? 'text-slate-400 cursor-not-allowed' 
                            : 'text-blue-600 hover:text-blue-800 hover:underline'
                        }`}
                      >
                        {loginOtpTimer > 0 ? `Gửi lại mã (${loginOtpTimer}s)` : 'Gửi lại mã OTP'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <InputField
                      id="sign-email"
                      label="Địa chỉ Email"
                      placeholder="Nhập địa chỉ email của bạn"
                      type="email"
                      value={signEmail}
                      onChange={(e) => setSignEmail(e.target.value)}
                      icon={<Mail className="w-4 h-4" />}
                      disabled={isSubmitting}
                    />

                    <InputField
                      id="sign-pass"
                      label="Mật khẩu"
                      placeholder="••••••••"
                      type={showSignPass ? "text" : "password"}
                      value={signPass}
                      onChange={(e) => setSignPass(e.target.value)}
                      icon={<Lock className="w-4 h-4" />}
                      rightIcon={showSignPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      onRightIconClick={() => setShowSignPass(!showSignPass)}
                      disabled={isSubmitting}
                    />

                    <div className="flex items-center justify-between text-[13px]">
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        Ghi nhớ đăng nhập
                      </label>
                      <span 
                        onClick={() => {
                          setIsForgotPassword(true);
                        }}
                        className="text-blue-600 hover:underline cursor-pointer font-medium"
                      >
                        Quên mật khẩu?
                      </span>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#051424] hover:bg-[#0c233e] text-white font-semibold py-3.5 rounded-lg tracking-wider text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 active:scale-[0.99] uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : loginOtpRequired ? (
                    'Xác nhận đăng nhập'
                  ) : (
                    'Đăng nhập tài khoản'
                  )}
                </button>

                <div className="text-center pt-4">
                  <p className="text-[13px] text-slate-500">
                    Chưa có tài khoản?{' '}
                    <span 
                      onClick={() => {
                        setIsSignUp(true);
                        handleReset();
                      }}
                      className="text-blue-600 font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Đăng ký mới ngay
                    </span>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Decorative credit overlay matching clean framework requirements */}
      <div className="absolute bottom-3 left-0 right-0 text-center select-none pointer-events-none z-0">
        <p className="text-xs text-slate-400 font-mono tracking-wider opacity-60">
          URBANPARK • WEB USER ACCESS PORTAL
        </p>
      </div>
    </div>
  );
}
