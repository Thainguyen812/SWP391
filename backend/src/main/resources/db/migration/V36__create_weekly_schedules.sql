CREATE TABLE weekly_schedules (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    mon VARCHAR(50) DEFAULT 'Nghỉ',
    tue VARCHAR(50) DEFAULT 'Nghỉ',
    wed VARCHAR(50) DEFAULT 'Nghỉ',
    thu VARCHAR(50) DEFAULT 'Nghỉ',
    fri VARCHAR(50) DEFAULT 'Nghỉ',
    sat VARCHAR(50) DEFAULT 'Nghỉ',
    sun VARCHAR(50) DEFAULT 'Nghỉ'
);
