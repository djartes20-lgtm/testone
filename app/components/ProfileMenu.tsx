"use client";

import { useEffect, useState } from "react";

type Perfil = {
  nome: string;
  foto: string;
};

export default function ProfileMenu() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const p = localStorage.getItem("perfilSelecionado");
    if (p) setPerfil(JSON.parse(p));
  }, []);

  function trocarFoto(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      if (!perfil) return;
      const atualizado = { ...perfil, foto: e.target?.result as string };
      localStorage.setItem("perfilSelecionado", JSON.stringify(atualizado));
      setPerfil(atualizado);
    };
    reader.readAsDataURL(file);
  }

  if (!perfil) return null;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-3 cursor-pointer
        border-2 border-red-600 rounded-xl p-2 bg-black shadow-[0_0_15px_red]"
      >
        <img
          src={perfil.foto}
          className="w-14 h-14 rounded-md object-cover border border-red-600"
        />
        <span className="font-bold text-red-600">
          {perfil.nome}
        </span>
      </div>

      {aberto && (
        <div className="mt-2 bg-black border border-red-600 rounded-xl overflow-hidden">
          <label className="block px-4 py-2 cursor-pointer hover:bg-red-600 hover:text-black">
            Trocar Foto
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e =>
                e.target.files && trocarFoto(e.target.files[0])
              }
            />
          </label>

          <button
            onClick={() => {
              localStorage.removeItem("perfilSelecionado");
              window.location.href = "/login";
            }}
            className="w-full text-left px-4 py-2 hover:bg-red-600 hover:text-black"
          >
            Trocar Perfil
          </button>
        </div>
      )}
    </div>
  );
}
