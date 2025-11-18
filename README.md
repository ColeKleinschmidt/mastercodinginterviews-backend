# Master Coding Interviews

Full-stack project scaffold for [mastercodinginterviews.com](https://mastercodinginterviews.com).

## Project structure

- `server/`: Node.js + Express + MongoDB backend (TypeScript)
- `client/`: React + Vite + TypeScript frontend

## Getting started

1. Install dependencies
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. Run the backend in development
   ```bash
   cd server
   npm run dev
   ```

3. Run the frontend in development
   ```bash
   cd client
   npm run dev
   ```

## Scripts

### Backend (`server`)
- `npm run dev` - start the development server with live reload
- `npm run build` - compile TypeScript to `dist`
- `npm run start` - run the compiled server

### Frontend (`client`)
- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build for production
- `npm run preview` - preview the production build locally
