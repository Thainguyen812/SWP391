const fs = require('fs');
let code = fs.readFileSync('src/components/auth/AuthPage.tsx', 'utf8');

// Replace handleLoginSubmit
code = code.replace(
  /const handleLoginSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?\}, 1200\);\s*\}/,
  `const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!signPhone) {
      showNotification('Vui lòng điền số điện thoại', 'error');
      return;
    }
    if (!signPass) {
      showNotification('Vui lòng điền mật khẩu', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await authService.login(signPhone, signPass);
    setIsSubmitting(false);

    if (result.success) {
      showNotification('Đăng nhập thành công!', 'success');
      
      const user = result.user;
      setTimeout(() => {
        if (user && user.role === 'DRIVER') {
          navigate('/driver');
        } else {
          navigate('/overview');
        }
      }, 500);
    } else {
      showNotification(result.message || 'Đăng nhập thất bại', 'error');
    }
  }`
);

// Replace handleVerifyOtp
code = code.replace(
  /const handleVerifyOtp = \(e: React\.FormEvent\) => \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?\}, 1500\);\s*\}/,
  `const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp !== expectedOtp && expectedOtp !== '123456') {
      showNotification('Mã OTP không chính xác. Vui lòng thử lại.', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await authService.register(
      phone, // username
      password,
      name, // fullName
      email,
      phone
    );
    setIsSubmitting(false);

    if (result.success) {
      setIsRegistered(true);
      showNotification('Xác thực thành công! Đang hoàn tất đăng ký...', 'success');
    } else {
      showNotification(result.message || 'Đăng ký thất bại', 'error');
    }
  }`
);

// Remove TypeScript types from states and params
code = code.replace(/useState<Record<string, string>>/g, 'useState');
code = code.replace(/useState<ToastMessage \| null>/g, 'useState');
code = code.replace(/\(e: React\.MouseEvent\)/g, '(e)');
code = code.replace(/\(e: React\.FormEvent\)/g, '(e)');
code = code.replace(/useState<\{ phone: string; role: string; name: string \} \| null>/g, 'useState');
code = code.replace(/type: 'success' \| 'error' \| 'info' = 'info'/g, 'type = "info"');
code = code.replace(/let interval: NodeJS\.Timeout;/g, 'let interval;');

fs.writeFileSync('src/components/auth/AuthPage.tsx', code);
