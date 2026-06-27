"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-base-100 shadow-md">
      <div className="navbar max-w-7xl mx-auto px-4">
        <div className="flex-1">
          <Link
            href="/"
            className="text-2xl font-bold text-primary"
          >
            Sagui
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <label className="input input-bordered flex items-center gap-2 w-full max-w-md ">
            <input
              type="text"
              className="grow placeholder:text-[#2f302f]"
              placeholder="Pesquisar..."
            />
          </label>
        </div>

        <div className="flex gap-4">
          <Link
            href="/sobre"
            className="btn btn-ghost text-[#2f302f]"
          >
            Sobre
          </Link>

          <Link
            href="/dashboard"
            className="btn btn-primary"
          >
            Dashboard
          </Link>

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="avatar cursor-pointer"
            >
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src="https://i.pravatar.cc/150?img=12"
                  alt="Avatar"
                />
              </div>
            </div>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-box w-52 text-[#2f302f]"
            >
              <li>
                <a>Perfil</a>
              </li>

              <li>
                <a>Configurações</a>
              </li>

              <li>
                <a>Sair</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}