-- Flyway Migration V17: Update real test emails for team OTP verification
UPDATE users SET email = 'admindemo8@gmail.com' WHERE username = 'admin';
UPDATE users SET email = 'managerdemo626@gmail.com' WHERE username = 'manager';
UPDATE users SET email = 'staffdemo9@gmail.com' WHERE username = 'staff';
