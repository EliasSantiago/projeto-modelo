import { signInWithProvider } from '@/actions/auth.actions'
import { enabledProviders } from '@/lib/auth'

/** Botões de login social (Google/GitHub) — renderizados só se configurados. */
export function OAuthButtons() {
  if (!enabledProviders.google && !enabledProviders.github) return null

  return (
    <div className="flex flex-col gap-3">
      {enabledProviders.google && (
        <form action={signInWithProvider.bind(null, 'google')}>
          <button
            type="submit"
            className="bg-light-primary text-navy-700 dark:bg-navy-800 dark:hover:bg-navy-700 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition hover:bg-[#e9eefb] dark:text-white"
          >
            <GoogleIcon />
            Continuar com Google
          </button>
        </form>
      )}

      {enabledProviders.github && (
        <form action={signInWithProvider.bind(null, 'github')}>
          <button
            type="submit"
            className="bg-light-primary text-navy-700 dark:bg-navy-800 dark:hover:bg-navy-700 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition hover:bg-[#e9eefb] dark:text-white"
          >
            <GitHubIcon />
            Continuar com GitHub
          </button>
        </form>
      )}

      <div className="my-2 flex items-center gap-3">
        <div className="h-px w-full bg-[var(--color-border)]" />
        <span className="text-navy-200 text-sm">ou</span>
        <div className="h-px w-full bg-[var(--color-border)]" />
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}
