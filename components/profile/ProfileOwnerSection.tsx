"use client";

import type { ReactNode } from "react";
import { profileMessages } from "@/lib/i18n/client-messages";

export type ProfileOwnerPanelMode = "closed" | "show" | "edit";

type ProfileOwnerSectionProps = {
  title: string;
  countLabel: string;
  panel: ProfileOwnerPanelMode;
  onPanelChange: (mode: ProfileOwnerPanelMode) => void;
  onAdd: () => void;
  showContent: ReactNode;
  editContent: ReactNode;
};

function togglePanel(current: ProfileOwnerPanelMode, target: "show" | "edit"): ProfileOwnerPanelMode {
  return current === target ? "closed" : target;
}

export function ProfileOwnerSection({
  title,
  countLabel,
  panel,
  onPanelChange,
  onAdd,
  showContent,
  editContent,
}: ProfileOwnerSectionProps) {
  return (
    <section className="profile-owner-section">
      <div className="profile-owner-section__header">
        <div className="profile-owner-section__intro">
          <h3 className="profile-owner-section__title">{title}</h3>
          <p className="profile-owner-section__count">{countLabel}</p>
        </div>
        <div className="profile-owner-section__actions">
          <button
            type="button"
            className={`profile-owner-section__btn${panel === "show" ? " profile-owner-section__btn--active" : ""}`}
            onClick={() => onPanelChange(togglePanel(panel, "show"))}
          >
            {profileMessages.ownerShow}
          </button>
          <button
            type="button"
            className={`profile-owner-section__btn${panel === "edit" ? " profile-owner-section__btn--active" : ""}`}
            onClick={() => onPanelChange(togglePanel(panel, "edit"))}
          >
            {profileMessages.ownerEdit}
          </button>
          <button type="button" className="profile-owner-section__btn profile-owner-section__btn--add" onClick={onAdd}>
            {profileMessages.ownerAdd}
          </button>
        </div>
      </div>

      {panel === "show" ? (
        <div className="profile-owner-section__body profile-owner-section__body--show">{showContent}</div>
      ) : null}

      {panel === "edit" ? (
        <div className="profile-owner-section__body profile-owner-section__body--edit">{editContent}</div>
      ) : null}
    </section>
  );
}
