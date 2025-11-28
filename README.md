# Interview Q&A - React (Vite)

This is a minimal React conversion of `iqaversion.html` using Vite and `react-bootstrap`.

## Setup (Windows Powershell)

Run these commands in the `iqareact` folder:

```powershell
cd "d:\VisualStudio Workspace\InterviewQuestionAnswer\iqareact"
npm install
npm run dev
```

Then open the displayed local URL (usually `http://localhost:5173`).

## Notes
- The app uses `react-bootstrap` for components and `bootstrap` for styles.
- The entries are stored in memory (component state). To persist them, add backend or localStorage.

## Configure API URL

The React app will POST form data to an API URL defined by the Vite environment variable `VITE_API_URL`.
By default it falls back to `http://localhost:8080/api/qas`.

Options to configure:

- Create a file named `.env` in the `iqareact` folder and add:

```
VITE_API_URL=http://your-backend-host:8080/api/qas
```

- Or set the environment variable in Powershell before running the dev server:

```powershell
$env:VITE_API_URL = 'http://your-backend-host:8080/api/qas'
npm run dev
```

There's an example file `.env.example` in the project you can copy.
