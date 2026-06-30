type ProfileDestinationCardActionsProps = {
  onEdit?: () => void;
  onRemove: () => void;
  editLabel: string;
  removeLabel: string;
};

export function ProfileDestinationCardActions({
  onEdit,
  onRemove,
  editLabel,
  removeLabel,
}: ProfileDestinationCardActionsProps) {
  return (
    <div className="profile-destination-card-actions">
      {onEdit ? (
        <button type="button" className="profile-destination-card-actions__btn" onClick={onEdit}>
          {editLabel}
        </button>
      ) : null}
      <button
        type="button"
        className="profile-destination-card-actions__btn profile-destination-card-actions__btn--remove"
        onClick={onRemove}
      >
        {removeLabel}
      </button>
    </div>
  );
}
