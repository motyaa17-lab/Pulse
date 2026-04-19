-- One-time: grant app admin to the specified account (must exist after signup).
UPDATE "User" SET role = 'ADMIN' WHERE LOWER(email) = LOWER('motyaa17@icloud.com');
