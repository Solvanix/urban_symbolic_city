import { Link, useLocation } from "wouter";
import { ArrowLeft, Bell, Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";

const navItems = [
  { href: "/services", label: "الخدمات" },
  { href: "/tourism", label: "السياحة" },
  { href: "/market", label: "السوق المحلي" },
  { href: "/shop", label: "المتجر" },
  { href: "/about", label: "عن SENSE" },
];

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#071b42]" dir="rtl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[#f5c542] focus:px-4 focus:py-3 focus:font-bold focus:text-[#071b42]">تجاوز إلى المحتوى الرئيسي</a>
      <div className="bg-[#071b42] px-4 py-2 text-center text-xs font-semibold text-white/80">
        منصة SENSE — مدينتك أقرب، وخدماتك أوضح
      </div>
      <header className="sticky top-0 z-40 border-b border-[#d8e3f2] bg-[#f5f8fc]/95 backdrop-blur">
        <div className="container flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 focus-ring" onClick={() => setOpen(false)}>
            <span className="grid h-11 w-11 place-items-center bg-[#071b42] text-lg font-black text-[#f5c542]">S</span>
            <span>
              <span className="block text-xl font-black tracking-[.22em]">SENSE</span>
              <span className="block text-[10px] font-bold tracking-[.24em] text-[#50709b]">URBAN PLATFORM</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="التنقل الرئيسي">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} aria-current={location === item.href ? "page" : undefined} className={`focus-ring text-sm font-bold transition-colors hover:text-[#1355a3] ${location === item.href ? "text-[#1355a3]" : "text-[#456283]"}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/notifications" className="focus-ring grid h-10 w-10 place-items-center text-[#456283] hover:text-[#1355a3]" aria-label="الإشعارات"><Bell size={18} /></Link>
            <Link href="/shop/cart" className="focus-ring grid h-10 w-10 place-items-center text-[#456283] hover:text-[#1355a3]" aria-label="السلة"><ShoppingBag size={18} /></Link>
            {user ? <Link href="/dashboard"><Button className="bg-[#071b42] text-white hover:bg-[#12336e]">لوحة التحكم <ArrowLeft size={16} /></Button></Link> : <Button onClick={() => startLogin()} className="bg-[#1355a3] text-white hover:bg-[#0e4387]">دخول المنصة <ArrowLeft size={16} /></Button>}
          </div>
          <button className="focus-ring grid h-10 w-10 place-items-center lg:hidden" onClick={() => setOpen(v => !v)} aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="border-t border-[#d8e3f2] bg-white px-4 py-5 lg:hidden"><nav className="container flex flex-col gap-4" aria-label="التنقل الرئيسي للجوال">{navItems.map(item => <Link key={item.href} href={item.href} aria-current={location === item.href ? "page" : undefined} onClick={() => setOpen(false)} className="border-b border-[#e6edf6] pb-3 font-bold text-[#183a67]">{item.label}</Link>)}<Button onClick={() => startLogin()} className="mt-2 bg-[#1355a3] text-white">دخول المنصة</Button></nav></div>}
      </header>
      <div className="container py-3"><AccessibilityToolbar /></div>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="sense-grid mt-20 text-white">
        <div className="container grid gap-10 py-14 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div><div className="mb-4 text-2xl font-black tracking-[.2em] text-[#f5c542]">SENSE</div><p className="max-w-sm leading-8 text-white/70">منصة حضرية تجمع البلاغات، الخدمات، السوق المحلي، والذكاء الاصطناعي في تجربة واحدة أكثر وضوحًا.</p></div>
          <div><div className="mb-4 font-black">روابط سريعة</div><div className="grid gap-3 text-sm text-white/70"><Link href="/report/new">أرسل بلاغًا</Link><Link href="/services">الخدمات البلدية</Link><Link href="/shop">تصفح المتجر</Link></div></div>
          <div><div className="mb-4 font-black">تواصل معنا</div><p className="text-sm leading-7 text-white/70">فريق SENSE جاهز لمساعدة المدن والجهات المحلية على بناء خدمات أكثر استجابة.</p><Link href="/contact" className="mt-3 inline-block font-bold text-[#f5c542]">تحدث مع الفريق ←</Link></div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">© 2026 SENSE Urban Platform — جميع الحقوق محفوظة</div>
      </footer>
    </div>
  );
}
