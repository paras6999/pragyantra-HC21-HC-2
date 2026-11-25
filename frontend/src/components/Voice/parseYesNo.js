const YES = ['yes', 'haan', 'han', 'ho', 'hoy', 'हाँ', 'हां', 'हो', 'होय']
const NO  = ['no', 'nahi', 'nahin', 'नहीं', 'नाही']

/** Returns true, false, or null when the transcript is neither. "No" wins over "yes". */
export default function parseYesNo(transcript) {
  const words = transcript.toLowerCase().split(/[\s,.!?।]+/)
  if (words.some(w => NO.includes(w)))  return false
  if (words.some(w => YES.includes(w))) return true
  return null
}
