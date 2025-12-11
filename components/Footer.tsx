'use client'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Made by{' '}
            <a
              href="https://github.com/q-kimi"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <img
                src="https://avatars.githubusercontent.com/u/51194216?v=4"
                alt="KiMi"
                className="w-6 h-6 rounded-full transition-transform duration-200 hover:scale-110"
              />
              <span className="username-underline">KiMi</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
