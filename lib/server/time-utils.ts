/**
 * Time-bucketing helpers shared across server modules.
 * Buckets are 30-minute windows aligned to the top :00 or :30 minute.
 */
export function truncateTo30MinBucket(date: Date): Date {
  const bucket = new Date(date);
  bucket.setSeconds(0, 0);
  const minutes = bucket.getMinutes();
  bucket.setMinutes(minutes < 30 ? 0 : 30);
  return bucket;
}

export function bucketLabel(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = date.getMinutes() === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
}

export function isWithinSameBucket(
  candidate: string | Date,
  bucketStart: Date
): boolean {
  const candidateDate =
    typeof candidate === "string" ? new Date(candidate) : candidate;
  return (
    truncateTo30MinBucket(candidateDate).getTime() === bucketStart.getTime()
  );
}
