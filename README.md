# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d43da826-79c3-4182-aa34-46380484ec07

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d43da826-79c3-4182-aa34-46380484ec07) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Supabase configuration

1. Create a `.env` file in the project root:

   ```env
   REACT_APP_SUPABASE_URL=https://izojvjihlozhnbgoumcb.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2p2amlobG96aG5iZ291bWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NzM2NzcsImV4cCI6MjA3MzU0OTY3N30.HAag54UmBSeoAkk1a3LDZ1sVym5osKKw4EHLA-9vPvs
   VITE_SUPABASE_URL=https://izojvjihlozhnbgoumcb.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2p2amlobG96aG5iZ291bWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NzM2NzcsImV4cCI6MjA3MzU0OTY3N30.HAag54UmBSeoAkk1a3LDZ1sVym5osKKw4EHLA-9vPvs
   ```

   The duplicated `VITE_` variables allow Vite to expose the credentials to the browser build while keeping compatibility with other tooling that expects `REACT_APP_` keys.

2. In the Supabase dashboard, under **Auth → Providers**, enable **Email** sign-in.
3. For local development, disable email confirmations so that new sign-ups receive a session instantly. Re-enable confirmations before shipping to production to retain security best practices.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d43da826-79c3-4182-aa34-46380484ec07) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
