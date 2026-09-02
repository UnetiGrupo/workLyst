"use client";

import { useState, useEffect } from "react";
import { useGroups } from "@/contexts/GroupContext";
import { Button } from "../common/Button";
import { X, Pencil, Trash2, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Group, GroupMember, User } from "@/lib/types";
import { AddMemberModal } from "../projects/AddMemberModal";
import { MemberAvatar } from "../common/MemberAvatar";

interface EditGroupModalProps {
  show: boolean;
  onClose: () => void;
  group: Group;
}

export function EditGroupModal({ show, onClose, group }: EditGroupModalProps) {
  const {
    updateGroup,
    deleteGroup,
    addMembers,
    removeMember,
    getGroupById,
    selectedGroup,
    loading,
  } = useGroups();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [updatingGroup, setUpdatingGroup] = useState(false);

  useEffect(() => {
    if (show && group.id) {
      getGroupById(group.id);
    }
  }, [show, group.id, getGroupById]);

  if (!show) return null;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdatingGroup(true);
    const formData = new FormData(e.currentTarget);
    const success = await updateGroup(group.id, {
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
    });
    setUpdatingGroup(false);
    if (success) onClose();
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar esta comunidad? Esta acción no se puede deshacer.",
      )
    ) {
      setIsDeleting(true);
      const success = await deleteGroup(group.id);
      setIsDeleting(false);
      if (success) onClose();
    }
  };

  const handleAddMember = async (user: User) => {
    return await addMembers(group.id, [user.id!]);
  };

  const handleRemoveMember = async (userId: string) => {
    if (window.confirm("¿Eliminar miembro de la comunidad?")) {
      await removeMember(group.id, userId);
    }
  };

  const creatorMember = selectedGroup?.miembros?.find(
    (m) => m.id === selectedGroup?.creador,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md transition-all">
      <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <header className="flex justify-between items-center p-5 sm:p-8 border-b bg-gray-50/50 rounded-t-4xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Editar Comunidad
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Gestiona los detalles y el equipo.
              </p>
              {creatorMember && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">
                    Admin: {creatorMember.nombre.split(" ")[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all active:scale-95"
          >
            <X className="size-5 sm:size-6 text-gray-500" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 custom-scrollbar">
          {/* Identificación del Creador en Mobile */}
          {creatorMember && (
            <div className="sm:hidden block p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-2">
              <div className="flex items-center gap-3">
                <MemberAvatar name={creatorMember.nombre} size="sm" isCreator />
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Creador de la Comunidad
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {creatorMember.nombre}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de edición */}
          <form
            onSubmit={handleUpdate}
            id="edit-group-form"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wide ml-1">
                  Nombre de la Comunidad
                </label>
                <input
                  name="nombre"
                  defaultValue={group.nombre}
                  required
                  placeholder="Ej: Equipo de Diseño"
                  className="w-full p-3 sm:p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wide ml-1">
                  Descripción
                </label>
                <input
                  name="descripcion"
                  defaultValue={group.descripcion}
                  placeholder="¿De qué trata este grupo?"
                  className="w-full p-3 sm:p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm font-medium"
                />
              </div>
            </div>
          </form>

          {/* Gestión de miembros */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                Miembros del Equipo
                <span className="bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm shadow-blue-200">
                  {selectedGroup?.miembros?.length || 0}
                </span>
              </h3>
              <Button
                style="secondary"
                className="w-full sm:w-auto py-2.5 px-5 text-sm rounded-xl font-bold bg-white shadow-sm border border-gray-100 hover:border-blue-200"
                onClick={() => setShowAddMember(true)}
              >
                <UserPlus className="size-4" />
                Añadir al Equipo
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="col-span-full py-12 flex flex-col items-center gap-4">
                  <Loader2 className="size-10 text-blue-500 animate-spin" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Cargando miembros...
                  </p>
                </div>
              ) : selectedGroup?.miembros?.length === 0 ? (
                <div className="col-span-full text-center py-10 px-4 text-gray-500 text-sm bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                  No hay miembros en esta comunidad todavía.
                </div>
              ) : (
                selectedGroup?.miembros
                  ?.sort((a, b) => (a.id === selectedGroup.creador ? -1 : 1))
                  .map((member: GroupMember) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all group/member ${
                        member.id === selectedGroup.creador
                          ? "bg-blue-50/30 border-blue-100"
                          : "bg-white border-gray-50 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MemberAvatar
                          name={member.nombre}
                          size="sm"
                          isCreator={member.id === selectedGroup.creador}
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-sm text-gray-900 truncate">
                              {member.nombre}
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold truncate tracking-tight">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      {member.id !== selectedGroup.creador && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/member:opacity-100 shrink-0"
                          title="Eliminar miembro"
                        >
                          <UserMinus className="size-4" />
                        </button>
                      )}
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>

        <footer className="p-5 sm:p-8 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 bg-gray-50/80 border-t border-gray-100 rounded-b-4xl">
          <Button
            style="logout"
            className="w-full sm:w-auto py-3 px-6 rounded-2xl font-bold flex items-center justify-center"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Eliminar Comunidad
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              style="secondary"
              onClick={onClose}
              className="py-3 px-6 rounded-2xl font-bold bg-white shadow-sm border-gray-100"
            >
              Cerrar
            </Button>
            <Button
              type="submit"
              form="edit-group-form"
              isLoading={updatingGroup}
              className="py-3 px-8 rounded-2xl font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Pencil className="size-4" />
              Guardar Cambios
            </Button>
          </div>
        </footer>

        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          onAddMember={handleAddMember}
          currentMembers={selectedGroup?.miembros?.map((m) => ({
            id: m.id,
            nombre: m.nombre,
            email: m.email,
          }))}
        />
      </div>
    </div>
  );
}
