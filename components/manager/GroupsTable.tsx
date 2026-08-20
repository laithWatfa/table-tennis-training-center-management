"use client";

import React, { useState } from "react";
import { Arrow } from "@/icons";
import { FaPlus} from "react-icons/fa";
import { MdEdit as Edit} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { AddPlayerToGroupForm, UpdateScheduleForm } from "./forms";
// import AddPlayerToGroupModal from "./forms/AddPlayerToGroupModal"; 

// Clean TypeScript Types matching our backend transformed payload outputs
interface Player {
  id: string;
  name: string;
  age: number;
}

interface Schedule {
  day: string;
  time: string;
  duration : number
}

interface Group {
  id: string;
  name: string;
  schedules: Schedule[];
  players: Player[];
}

interface Props {
  groups: Group[];
}

/* ---------------- Group Row (Desktop) ---------------- */
function GroupRow({
  group,
  isOpen,
  onToggle,
}: {
  group: Group;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-textSecondary/20">
      <div className="grid grid-cols-[40px_1fr_150px_1fr] items-center px-4 py-3 bg-surface text-textPrimary">
        <button onClick={onToggle} className="flex justify-center text-primary focus:outline-none">
          {/* Added transform transitions based on open states for clean UI feel */}
          <Arrow className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <div className="text-right font-bold text-base">{group.name}</div>
        <div className="text-center font-medium">{group.players.length} لاعب</div>

        <div className="flex flex-wrap gap-2 justify-end">
          {group.schedules.map((s, idx) => (
            <span key={idx} className="bg-secondary text-whiteT text-xs px-3 py-1 rounded-md font-bold">
              {s.day} {s.time}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-surface/50 border-b border-textSecondary/10 px-4"
          >
            <GroupPlayers group={group} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Group Card (Mobile) ---------------- */
function GroupCard({
  group,
  isOpen,
  onToggle,
}: {
  group: Group;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-textSecondary/20 rounded-xl bg-surface overflow-hidden shadow-sm">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-textPrimary focus:outline-none">
        <div className="font-bold text-right text-base">
          {group.name} <span className="text-sm font-normal text-textSecondary">({group.players.length} لاعب)</span>
        </div>
        <div className="text-primary">
          <Arrow className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div className="flex flex-wrap gap-2 justify-start px-4 pb-4">
        {group.schedules.map((s, idx) => (
          <span key={idx} className="bg-secondary text-whiteT text-xs px-3 py-1 rounded-md font-bold">
            {s.day} {s.time}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t bg-surface"
          >
            <GroupPlayers group={group} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



/* ---------------- Shared Expanded Content ---------------- */
function GroupPlayers({ group }: { group: Group }) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  return (
    <div className="p-4 space-y-4">
      <div className="font-bold text-sm text-textSecondary text-right">اللاعبون الحاليون في المجموعة</div>

      {group.players.length > 0 ? (
        <div className="flex flex-wrap gap-2 justify-end">
          {group.players.map((p) => (
            <span key={p.id} className="bg-grayBG dark:bg-bg border border-textSecondary/10 text-textPrimary text-xs px-4 py-1.5 rounded-full font-medium">
              {p.name} / {p.age} سنة
            </span>
          ))}
        </div>
      ) : (
        <p className="text-right text-xs italic text-textSecondary/70 py-2">لا يوجد لاعبون مسجلون في هذه المجموعة حالياً.</p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button 
          onClick={() => setShowEditSchedule(true)}
          className="flex items-center gap-2 bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-whiteT transition duration-150 px-4 py-1.5 rounded-lg text-xs font-bold"
        >
          <Edit className="w-4 h-4" /> تعديل المواعيد
        </button>
        <button 
          onClick={() => setShowAddPlayer(true)}
          className="filled-button !py-1.5 !px-4 !text-xs !bg-primary font-bold flex items-center gap-1"
        >
          <FaPlus className="w-4 h-4" /> إضافة لاعب
        </button>
      </div>
            {showAddPlayer && (
        <AddPlayerToGroupForm 
          planVariantId={group.id} 
          planVariantName={group.name} 
          setShow={setShowAddPlayer} 
        />
      )}

      {showEditSchedule && (
        <UpdateScheduleForm
          variantId={group.id} 
          variantName={group.name} 
          initialSchedules={group.schedules}
          setShow={setShowEditSchedule} 
        />
      )}
    </div>
  );
}

/* ---------------- Main Table Controller ---------------- */
export default function GroupsTable({ groups }: Props) {
  console.log(groups)
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Desktop view Grid Canvas */}
      <div className="hidden md:block border border-textSecondary/20 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[40px_1fr_150px_1fr] bg-primary text-whiteT px-4 py-3 font-bold text-sm">
          <div />
          <div className="text-right">المجموعة المشتركة</div>
          <div className="text-center">عدد المشتركين</div>
          <div className="text-center">مواعيد التمارين</div>
        </div>

        {Array.isArray(groups) && groups.length > 0 ? groups.map((group) => (
          <GroupRow
            key={group.id}
            group={group}
            isOpen={openGroupId === group.id}
            onToggle={() => setOpenGroupId(openGroupId === group.id ? null : group.id)}
          />
        )) : <p>لا يوجد مجموعات</p>}
      </div>

      {/* Mobile structural card lists grid layout */}
      <div className="md:hidden space-y-3">
                {Array.isArray(groups) && groups.length > 0 ? groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            isOpen={openGroupId === group.id}
            onToggle={() => setOpenGroupId(openGroupId === group.id ? null : group.id)}
          />
        )) : <p>لا يوجد مجموعات</p>}
        
      </div>
    </div>
  );
}
