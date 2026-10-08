import bcrypt from "bcryptjs";

// توليد hash لكلمة مرور افتراضية
const password = process.argv[2] || "Dallah@2026";
const hash = await bcrypt.hash(password, 10);
console.log("Password:", password);
console.log("Hash:", hash);
