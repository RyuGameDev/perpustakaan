type FlashMessageProps = {
  success?: string;
  error?: string;
};

export function FlashMessage({ success, error }: FlashMessageProps) {
  if (!success && !error) {
    return null;
  }

  return <div className={`flash ${error ? "flash-error" : "flash-success"}`}>{error || success}</div>;
}
