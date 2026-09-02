"use client";

import { Button } from "@/components/common/Button";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/contexts/UsersContext";

export default function UserPage() {
  const { user } = useAuth();
  const { updateUser } = useUsers();

  const PROFILE_FORM = [
    {
      label: "Nombre Completo",
      name: "nombre",
      placeholder: "John Doe",
      value: user?.nombre || "",
    },
    {
      label: "Correo Electronico",
      name: "email",
      placeholder: "john.doe@gmail.com",
      value: user?.email || "",
    },
    {
      label: "Roles",
      name: "roles",
      placeholder: "Desarrollador de Software",
      value: "",
    },
    {
      label: "Biografia",
      name: "biografia",
      placeholder: "Escribe una breve biografia",
      value: "",
    },
  ];

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates = {
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
    };
    await updateUser(user?.id!, updates);
  };

  return (
    <main className="flex flex-col gap-4 2xl:gap-6 max-w-11/12 2xl:max-w-10/12 mx-auto mt-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl 2xl:text-3xl font-bold">Ajustes de Perfil</h1>
        <p className="text-base 2xl:text-lg text-gray-500">
          Personaliza tu perfil y ajusta tus preferencias.
        </p>
      </header>
      <article className="flex flex-col gap-8 bg-white p-10 rounded-lg shadow-lg shadow-gray-200 border border-gray-200">
        <header className="flex items-center gap-4">
          <MemberAvatar name={user?.nombre} size="2xl" />
          <div className="flex flex-col gap-px">
            <h2 className="text-xl 2xl:text-2xl font-semibold">
              {user?.nombre}
            </h2>
            <h3 className="text-base 2xl:text-lg text-gray-500">
              {user?.email}
            </h3>
          </div>
        </header>
        <form
          id="profile-form"
          onSubmit={handleUpdateUser}
          className="grid grid-cols-2 gap-8 w-full"
        >
          {PROFILE_FORM.map((item) => (
            <label className="flex flex-col gap-2">
              <span>{item.label}</span>
              <input
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                type="text"
                name={item.name}
                placeholder={item.placeholder}
                defaultValue={item.value}
              />
            </label>
          ))}
        </form>
        <footer className="flex justify-end gap-2">
          <Button style="secondary" type="submit">
            Cancelar
          </Button>
          <Button type="submit" form="profile-form">
            Guardar Cambios
          </Button>
        </footer>
      </article>
    </main>
  );
}
