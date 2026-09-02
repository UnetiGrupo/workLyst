"use client";

import { useEffect, useState } from "react";
import { useGroups } from "@/contexts/GroupContext";
import { Button } from "@/components/common/Button";
import { Plus, Users, ArrowRight, MoreVertical } from "lucide-react";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { Group } from "@/lib/types";
import dynamic from "next/dynamic";

const AddGroupModal = dynamic(
  () =>
    import("@/components/community/AddGroupModal").then(
      (mod) => mod.AddGroupModal,
    ),
  { ssr: false },
);

const EditGroupModal = dynamic(
  () =>
    import("@/components/community/EditGroupModal").then(
      (mod) => mod.EditGroupModal,
    ),
  { ssr: false },
);

export default function CommunityPage() {
  const { groups, fetchGroups, loading } = useGroups();
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Comunidades</h1>
          <p className="text-gray-500">
            Gestiona tus grupos de trabajo y colabora eficientemente
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="size-5" />
          Crear Grupo
        </Button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <section className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Users className="size-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">
            No perteneces a ninguna comunidad
          </h2>
          <p className="text-gray-500 mb-6">
            Comienza creando un grupo e invitando a tu equipo
          </p>
          <Button style="secondary" onClick={() => setShowModal(true)}>
            Crear mi primer grupo
          </Button>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups
            .filter((g) => g.miembros && g.miembros.length > 0)
            .map((group: Group) => (
              <GroupCard
                key={group.id}
                group={group}
                onEdit={() => setEditingGroup(group)}
              />
            ))}
        </div>
      )}

      <AddGroupModal show={showModal} onClose={() => setShowModal(false)} />
      {editingGroup && (
        <EditGroupModal
          show={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          group={editingGroup}
        />
      )}
    </main>
  );
}

function GroupCard({ group, onEdit }: { group: Group; onEdit: () => void }) {
  const maxVisibleMembers = 3;

  return (
    <div className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -right-8 -top-8 size-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />

      <div className="flex justify-between items-start mb-4 relative">
        <div className="size-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
          <Users className="size-6" />
        </div>
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-xl transition-all"
        >
          <MoreVertical className="size-5" />
        </button>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors truncate">
        {group.nombre}
      </h3>
      <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-1">
        {group.descripcion ||
          "Forma parte de esta comunidad y colabora con otros profesionales."}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
        {/* Avatares de Miembros */}
        <div className="flex -space-x-2">
          {group.miembros
            ?.sort((a, b) => (a.id === group.creador ? -1 : 1))
            .slice(0, maxVisibleMembers)
            .map((member) => (
              <div key={member.id} className="relative">
                <MemberAvatar
                  name={member.nombre}
                  className="size-8 ring-2 ring-white shadow-sm"
                  isCreator={member.id === group.creador}
                />
              </div>
            ))}
          {group.miembros && group.miembros.length > maxVisibleMembers && (
            <div className="size-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-sm">
              +{group.miembros.length - maxVisibleMembers}
            </div>
          )}
          {(!group.miembros || group.miembros.length === 0) && (
            <span className="text-[10px] text-gray-400 font-medium">
              Sin miembros
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/50 rounded-lg">
          <Users className="size-3 text-blue-500" />
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            {group.miembros?.length || 0} miemb.
          </span>
        </div>
      </div>
    </div>
  );
}
