# platonic-validate.awk
# Input: space-separated 7 quadrant values (0..3)
# Output: platonic_class, degree_signature, quadrant_counts

BEGIN { FS = "[[:space:]]+" }

{
  delete freq
  for (i = 1; i <= 7; i++) {
    if ($i !~ /^[0-3]$/) {
      print "ERROR: invalid quadrant at position " i ": " $i > "/dev/stderr"
      exit 2
    }
    q = $i + 0
    freq[q]++
  }

  # Sort non-zero frequencies ascending for a stable signature
  n = 0
  for (k = 0; k < 4; k++) if (freq[k] > 0) vals[++n] = freq[k]

  for (i = 1; i <= n; i++) {
    for (j = i + 1; j <= n; j++) {
      if (vals[i] > vals[j]) { t = vals[i]; vals[i] = vals[j]; vals[j] = t }
    }
  }

  deg = ""
  for (i = 1; i <= n; i++) deg = deg ":" vals[i]

  class = "archimedean"
  if (deg == ":1:1:2:3" || deg == ":1:2:2:2" || deg == ":1:1:1:4") class = "archimedean"
  # Reserved mapping for future canonical signatures from higher-order projector

  printf "platonic_class=%s\n", class
  printf "degree_signature=%s\n", deg
  printf "quadrant_counts=%d:%d:%d:%d\n", freq[0] + 0, freq[1] + 0, freq[2] + 0, freq[3] + 0
}
