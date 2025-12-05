# 🚀 Deploy Candidate Search to GitHub

## Step 1: Install Git

1. Go to: https://git-scm.com/download/win
2. Download Git for Windows
3. Run the installer
4. Follow the installation steps (use default settings)
5. Restart your computer
6. Verify installation:
   ```bash
   git --version
   ```

---

## Step 2: Create GitHub Account (if you don't have one)

1. Go to: https://github.com
2. Click "Sign up"
3. Create account with email
4. Verify email
5. Complete setup

---

## Step 3: Create a New Repository on GitHub

1. Log in to GitHub
2. Click "+" icon (top right)
3. Select "New repository"
4. Fill in details:
   - **Repository name:** `candidate-search`
   - **Description:** "Candidate Profile Search Application"
   - **Visibility:** Public or Private (your choice)
   - **Initialize:** Leave unchecked
5. Click "Create repository"

---

## Step 4: Initialize Git in Your Project

Open PowerShell in the candidate-search folder:

```bash
cd C:\Users\iamgo\Documents\augment-projects\enat solution\candidate-search
git init
```

---

## Step 5: Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@enatsolution.com"
```

---

## Step 6: Create .gitignore File

Create a file named `.gitignore` in the root folder with:

```
node_modules/
.env
.env.local
.DS_Store
dist/
build/
*.log
.vite/
client/dist/
```

---

## Step 7: Add Files to Git

```bash
git add .
```

---

## Step 8: Create Initial Commit

```bash
git commit -m "Initial commit: Candidate Search Application"
```

---

## Step 9: Add Remote Repository

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/candidate-search.git
```

---

## Step 10: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

You'll be prompted for authentication:
- **Username:** Your GitHub username
- **Password:** Your GitHub personal access token (see below)

---

## Step 11: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token"
3. Select "Generate new token (classic)"
4. Fill in:
   - **Note:** "Candidate Search Deployment"
   - **Expiration:** 90 days
   - **Scopes:** Check `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## Step 12: Verify on GitHub

1. Go to: https://github.com/YOUR_USERNAME/candidate-search
2. You should see all your files
3. Check the commit history

---

## 📝 Project Structure on GitHub

```
candidate-search/
├── server/
│   ├── index.js
│   ├── config.js
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   └── package.json
├── client/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json
├── .gitignore
└── README.md
```

---

## 🔄 Future Updates

After initial deployment, to push updates:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

## 🆘 Troubleshooting

**"fatal: not a git repository"**
- Run: `git init` in the project folder

**"Permission denied"**
- Use GitHub personal access token instead of password
- Check token has `repo` scope

**"remote already exists"**
- Run: `git remote remove origin`
- Then add the correct remote

**"nothing to commit"**
- Make sure you ran: `git add .`

---

## 📚 Useful Git Commands

```bash
# Check status
git status

# View commit history
git log

# View changes
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View remote
git remote -v

# Change remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/candidate-search.git
```

---

## 🎯 Next Steps

1. Install Git
2. Create GitHub account
3. Create repository on GitHub
4. Follow steps 4-12 above
5. Verify files on GitHub

---

**Your project will be on GitHub!** 🚀

