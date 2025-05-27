export function showEncounter(data) {
  if (!data) return;
  // Basic modal using alert for now
  const message = `${data.title}\n\n${data.text}`;
  alert(message);
}
