export default function TopAppBar() {
  return (
    <header className="md:hidden flex justify-between items-center px-gutter h-16 w-full fixed top-0 z-50 bg-surface shadow-sm">
      <button className="text-primary p-2">
        <span className="material-symbols-outlined">menu</span>
      </button>
      <div className="font-headline-lg text-headline-lg font-bold text-primary">CrossCash</div>
      <img
        alt="User profile photo"
        className="w-8 h-8 rounded-full object-cover border border-outline-variant"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuABFRtcNjg4kTYrG9FShaoMsUSuzjDWMXbjUhqFqFddwpw6Yeos-NjPGa9dlMhQPuASHnPRqY5Oi9NrG1t1JEh3cZ9CV6QoMYDKLRibZ0fjF0Lus_8t0GC0TgvpygcYUu028dG8e4XIrB8iWWqhlFpV6BKZXfq6DEJvAbJBbaCLpN-gylR2BbKFtghBgUkmlnZFHQVZjXr9q8tUTIvYuldUaMhlxTalVksPxEYXPVbAbjcg8qXDWN8_Yw"
      />
    </header>
  );
}
