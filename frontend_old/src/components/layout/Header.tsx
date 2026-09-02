"use client";

import { useState, useEffect } from "react";
import { MobileMenu } from "./MobileMenu";
import { NAVBAR_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { Button } from "@/components/common/Button";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, mounted } = useAuth();

  const [showAuthButtons, setShowAuthButtons] = useState<boolean>(false);

  useEffect(() => {
    if (mounted && user) {
      setShowAuthButtons(true);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="relative  bg-white shadow-sm">
      <div className="flex items-center justify-between max-w-11/12 2xl:max-w-10/12 mx-auto h-16 2xl:h-20">
        <picture className="flex items-center gap-2 flex-1">
          <img className="w-8 lg:w-10" src="/logo.svg" alt="Worklyst Logo" />
          <h3 className="text-lg 2xl:text-xl font-semibold">WorkLyst</h3>
        </picture>

        <nav className="hidden xl:flex items-center justify-center gap-8">
          {NAVBAR_ITEMS.map(({ label, href }) => (
            <Link
              key={href}
              className="text-sm 2xl:text-lg text-gray-700 hover:text-blue-600 hover:scale-105 transition font-medium"
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <aside
          className={`hidden xl:flex items-center gap-4 flex-1 justify-end transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
        >
          {mounted && (
            <>
              {!user ? (
                <>
                  <Button href="/login">Iniciar Sesión</Button>
                  <Button href="/register" style="secondary">
                    Crear Cuenta
                  </Button>
                </>
              ) : (
                <button onClick={handleLogout}>
                  <MemberAvatar name={user?.nombre || ""} size="lg" />
                </button>
              )}
            </>
          )}
        </aside>

        <button
          className="xl:hidden p-2 text-gray-600 hover:text-blue-600 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        <MobileMenu
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          NavbarItems={NAVBAR_ITEMS}
          showAuthButtons={showAuthButtons}
          user={user}
          logout={handleLogout}
        />
      </div>
    </header>
  );
}
