# GymPlify Setup Guide

## Prerequisites

### Check Node.js Installation

1. **Open CMD** and run these commands **isa-isa**:
   ```bash
   node -v
   npm -v
   ```
   **Note** : Kailangan may lumabas na numbers sa dalawa.

- Kapag may lumabas na version numbers → Skip to Step 2
- Kapag wala → Install Node.js muna. Install Node.js (LTS version)
  - Visit: https://nodejs.org/en/download
  - Download and install the LTS version

### Clone the Project

2. Punta sa folder na gusto mong paglagyan ng project sa CMD, then run:
   git clone https://github.com/zeeddd0107/GymPlify.git

   ```bash
   cd GymPlify
   code .
   ```

3. Check project structure
   - Press CTRL + J to open the terminal in VSCode
   - Run:
   ```bash
   ls
   ```

**Dapat may makita kayong folders: backend, mobile, web**

### Install Dependencies

4. Install Yarn (if wala ka pa). Do this in the GymPlify directory

```bash
yarn --version
```

- Kapag may lumabas na number → OK na
- Kapag wala → Install:
  ```bash
  npm install -g yarn
  ```

5. Install dependencies sa lahat ng directories
   From project root (GymPlify):
   ```bash
   yarn install
   cd web
   yarn install
   cd ..
   cd mobile
   yarn install
   ```

### Run the Projects

**For Web**

```bash
cd web
yarn dev
```

**Kapag may error na ganito:**
running scripts is disabled on this system

- Gawin niyo ‘to sa PowerShell:
  Get-ExecutionPolicy

* If it returns "Restricted", run:
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

- Click “A” when prompted

**For Mobile (Expo)** (Kahit huwag muna ito, need kasi ito ng connections sa Android Studio)

```bash
cd mobile
yarn start
```

# or

```bash
npx expo start
```
