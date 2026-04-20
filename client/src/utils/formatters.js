/**
 * Format a date string into a human-readable "time ago" string.
 */
export const formatLastSeen = (dateString) => {
  if (!dateString) return 'Unknown';

  const lastSeen = new Date(dateString);
  const now = new Date();
  const diffMs = now - lastSeen;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return lastSeen.toLocaleDateString();
};

/**
 * Format a date string for display.
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};
