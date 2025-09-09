# Next.js Booking Application

## คำอธิบาย
โปรเจกต์นี้เป็นแอปพลิเคชัน Next.js สำหรับระบบจองบริการ โดยใช้ TypeScript, Tailwind CSS, Prisma สำหรับฐานข้อมูล, และ NextAuth สำหรับการยืนยันตัวตน มีฟีเจอร์เช่น การลงทะเบียน/ล็อกอิน, ฟอร์มจอง, ปฏิทินจอง, และ API สำหรับจัดการข้อมูลจอง.

โปรเจกต์นี้ถูกตั้งค่าให้ทำงานใน GitHub Codespaces โดยอัตโนมัติ แต่คุณสามารถรันบนเครื่อง local ได้เช่นกัน โดยมีคำแนะนำละเอียดด้านล่าง.

## ข้อกำหนดเบื้องต้น (Prerequisites)
ก่อนเริ่มต้น คุณต้องติดตั้งโปรแกรมต่อไปนี้บนเครื่องคอมพิวเตอร์ของคุณ:
- **Node.js** เวอร์ชัน 18 หรือสูงกว่า (ดาวน์โหลดจาก [nodejs.org](https://nodejs.org/))
- **npm** (มาพร้อมกับ Node.js) หรือ yarn ถ้าต้องการ
- **Git** สำหรับการ clone โค้ด (ดาวน์โหลดจาก [git-scm.com](https://git-scm.com/))
- **PostgreSQL** สำหรับฐานข้อมูล (ดาวน์โหลดจาก [postgresql.org](https://www.postgresql.org/)) หรือใช้ Docker ถ้าต้องการรันฐานข้อมูลใน container
- **Docker** ถ้าต้องการใช้ docker-compose.yml สำหรับฐานข้อมูล (ดาวน์โหลดจาก [docker.com](https://www.docker.com/))
- **Prisma CLI** จะถูกติดตั้งอัตโนมัติเมื่อรัน `npm install`

ตรวจสอบการติดตั้ง:
- Node.js: `node --version`
- npm: `npm --version`
- Git: `git --version`
- PostgreSQL: `psql --version` (หรือ Docker: `docker --version`)

หากคุณใช้ Windows อาจต้องติดตั้ง PostgreSQL ผ่าน installer และตั้งค่า environment variables. สำหรับ macOS ใช้ Homebrew: `brew install postgresql`. สำหรับ Linux: `sudo apt install postgresql`.

## การตั้งค่าโปรเจกต์ (Project Setup)
มี 3 วิธีหลักในการนำโค้ดมาทำงานบนเครื่อง local: ใช้ Git Clone, ดาวน์โหลดไฟล์ ZIP จาก GitHub, หรือใช้ GitHub Codespaces. เลือกวิธีที่เหมาะสมกับคุณ.

### วิธีที่ 1: ใช้ Git Clone (แนะนำสำหรับนักพัฒนา)
วิธีนี้เหมาะสำหรับผู้ที่ต้องการเวอร์ชัน control และอัปเดตโค้ดได้ง่าย.

1. **ติดตั้ง Git** ถ้ายังไม่มี (ดู Prerequisites ข้างต้น).
2. **Clone repository** จาก GitHub:
   เปิด Terminal/Command Prompt แล้วรันคำสั่ง:
   ```
   git clone https://github.com/[username]/[repository-name].git
   ```
   แทนที่ `[username]` ด้วยชื่อผู้ใช้ GitHub ของคุณ และ `[repository-name]` ด้วยชื่อ repository (เช่น `nextjs-booking-app`). หากยังไม่มี repository บน GitHub ให้สร้างก่อนโดย push โค้ดจาก Codespaces (คลิก "Publish Branch" ใน Codespaces).
3. **เข้าสู่โฟลเดอร์โปรเจกต์**:
   ```
   cd [repository-name]
   ```
4. **ติดตั้ง dependencies**:
   ```
   npm install
   ```
   หรือถ้าใช้ yarn: `yarn install`. คำสั่งนี้จะติดตั้งแพ็กเกจทั้งหมดจาก `package.json` รวมถึง Prisma, NextAuth, Tailwind ฯลฯ.
5. **ตั้งค่าสภาพแวดล้อม (Environment Variables)**:
   - คัดลอกไฟล์ `.env.example` (ถ้ามี) หรือสร้างไฟล์ `.env` ใหม่ใน root directory.
   - กรอกค่าต่อไปนี้ (ตัวอย่าง):
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/bookingdb?schema=public"
     NEXTAUTH_SECRET="your-secret-key-here"  # สร้างด้วย openssl rand -base64 32
     NEXTAUTH_URL="http://localhost:3000"
     GITHUB_ID="your-github-oauth-client-id"
     GITHUB_SECRET="your-github-oauth-client-secret"
     ```
     - `DATABASE_URL`: URL เชื่อมต่อ PostgreSQL. ถ้าใช้ local DB ให้ปรับ username/password/port/database name ให้ตรง. ถ้าใช้ Docker ดูด้านล่าง.
     - `NEXTAUTH_SECRET`: คีย์ลับสำหรับ NextAuth (สร้างด้วย `openssl rand -base64 32` ใน Terminal).
     - `GITHUB_ID` และ `GITHUB_SECRET`: จาก GitHub OAuth App (สร้างที่ [github.com/settings/developers](https://github.com/settings/developers)).
     - อย่า commit ไฟล์ `.env` ไปยัง Git (เพิ่มใน `.gitignore` แล้ว).
6. **ตั้งค่าฐานข้อมูล (Database Setup)**:
   - ถ้าใช้ PostgreSQL local: สร้าง database ใหม่ชื่อ `bookingdb` ด้วย `createdb bookingdb` (หรือใช้ pgAdmin).
   - ถ้าใช้ Docker: รัน `docker-compose up -d` เพื่อเริ่ม container PostgreSQL (ไฟล์ `docker-compose.yml` มีให้แล้ว).
   - รัน migration เพื่อสร้างตาราง:
     ```
     npx prisma migrate dev --name init
     ```
     คำสั่งนี้จะสร้าง schema จาก `prisma/schema.prisma` และอัปเดตฐานข้อมูล.
   - ถ้าต้องการ seed ข้อมูลเริ่มต้น (ถ้ามีไฟล์ seed): `npx prisma db seed`.
7. **รันโปรเจกต์**:
   ```
   npm run dev
   ```
   แอปจะรันที่ `http://localhost:3000`. เปิดเบราว์เซอร์ไปที่ URL นั้นเพื่อทดสอบ.

หากมีปัญหา เช่น port ถูกใช้ ให้หยุด process อื่นหรือเปลี่ยน port ใน `package.json`.

### วิธีที่ 2: ดาวน์โหลดไฟล์ ZIP โดยตรงจาก GitHub
วิธีนี้เหมาะสำหรับผู้ใช้ที่ไม่ต้องการ Git หรือทดสอบชั่วคราว.

1. **ไปที่ repository บน GitHub**: เปิดเบราว์เซอร์ไปที่ `https://github.com/[username]/[repository-name]`.
2. **ดาวน์โหลด ZIP**: คลิกปุ่ม "Code" > "Download ZIP".
3. **แตกไฟล์**: Extract ไฟล์ ZIP ไปยังโฟลเดอร์ที่ต้องการ (เช่น `C:\projects\booking-app` หรือ `~/projects/booking-app`).
4. **ทำตามขั้นตอนตั้งค่าต่อจากนี้**:
   - ทำตามขั้นตอน 4-7 ใน "วิธีที่ 1" (ติดตั้ง dependencies, ตั้งค่า .env, setup DB, รันโปรเจกต์).
   หมายเหตุ: คุณจะไม่สามารถ `git pull` เพื่ออัปเดตได้ง่ายๆ ถ้าต้องการอัปเดต ให้ดาวน์โหลด ZIP ใหม่และแทนที่ไฟล์.

### วิธีที่ 3: ใช้ GitHub Codespaces (แนะนำสำหรับการพัฒนาใน Cloud)
วิธีนี้ไม่ต้องติดตั้งอะไรบนเครื่อง local ทุกอย่างรันในเบราว์เซอร์.

1. **มีบัญชี GitHub**: ถ้ายังไม่มี สร้างที่ [github.com](https://github.com).
2. **สร้างหรือเปิด Repository**: ถ้าโปรเจกต์ยังไม่มี repo ให้ push จาก Codespace ปัจจุบัน (คลิก "Publish Branch" ใน VS Code Codespace).
3. **เปิด Codespaces**:
   - ไปที่ repository บน GitHub.
   - คลิกปุ่ม "Code" > "Codespaces" > "Create codespace on main".
   - Codespace จะโหลด VS Code ในเบราว์เซอร์อัตโนมัติ.
4. **Codespace จะตั้งค่าอัตโนมัติ**:
   - Dependencies จะติดตั้งเองผ่าน `devcontainer.json`.
   - ฐานข้อมูลรันผ่าน Docker ใน Codespace.
   - รัน `npm run dev` ใน Terminal ของ Codespace เพื่อเริ่มเซิร์ฟเวอร์.
5. **เข้าถึงแอป**: คลิกไอคอน "Ports" ใน VS Code เพื่อเปิด `http://localhost:3000` ในเบราว์เซอร์.
6. **หยุด Codespace**: เมื่อเสร็จ คลิก "Codespaces" ใน GitHub เพื่อหยุดหรือลบ (ไม่เสียเงินถ้า free tier).

Codespaces ฟรีสำหรับ public repo และมี quota สำหรับ private. ถ้า quota หมด ให้รอหรืออัปเกรดแผน.

## คำสั่งที่มีประโยชน์ (Useful Commands)
- รัน development server: `npm run dev`
- Build สำหรับ production: `npm run build`
- รัน production: `npm start`
- Lint code: `npm run lint`
- Test: ถ้ามี `npm test`
- Prisma Studio (ดูข้อมูล DB): `npx prisma studio`
- Migrate DB: `npx prisma migrate dev`
- Generate Prisma client: `npx prisma generate`

## การแก้ปัญหา (Troubleshooting)
- **Error: Cannot find module**: รัน `npm install` ใหม่.
- **Database connection failed**: ตรวจสอบ DATABASE_URL ใน .env และให้แน่ใจว่า DB รันอยู่ ( `psql` หรือ Docker).
- **Port 3000 in use**: เปลี่ยน port ด้วย `npm run dev -- -p 3001`.
- **Prisma migration error**: ลบ `prisma/migrations` แล้วรัน migrate ใหม่ (ระวังข้อมูลหาย).
- **Auth issues**: ตรวจสอบ NEXTAUTH_SECRET และ OAuth credentials.
- ถ้าใช้ Windows: ใช้ Git Bash สำหรับ Terminal และตรวจสอบ path separators.

## โครงสร้างไฟล์ (Project Structure)
- `pages/`: Next.js pages (เช่น index.js สำหรับ home).
- `components/`: React components (เช่น BookingForm.js, LoginForm.js).
- `lib/`: Utilities (auth.ts, prisma.ts).
- `prisma/`: Database schema (schema.prisma).
- `pages/api/`: API routes (availability.ts, auth/[...nextauth].ts).
- `styles/`: CSS modules.
- `.env`: Environment variables (อย่า commit).
- `docker-compose.yml`: สำหรับ DB container.

## การพัฒนาเพิ่มเติม
- เพิ่ม features ใหม่ใน components/pages.
- ทดสอบ API ด้วย Postman หรือ curl.
- Deploy ไป Vercel/Netlify: `npm run build` แล้ว push ไป GitHub.

หากมีคำถามเพิ่มเติม ติดต่อ Line: @boombignose หรือ Skool Admin: https://www.skool.com/boombignose-8034/about.

---

เอกสารนี้เขียนเป็นภาษาไทยเพื่อความสะดวก หากต้องการเวอร์ชันภาษาอังกฤษ สามารถเพิ่มได้.
