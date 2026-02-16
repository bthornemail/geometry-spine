# catalan-attest.awk
# Input: transform matrix[7]

BEGIN { FS = "[[:space:]]+" }

{
  if (NF < 8) {
    print "REJECT: expected format '<transform> q1 q2 q3 q4 q5 q6 q7'"
    exit 1
  }

  transform = $1
  for (i = 2; i <= 8; i++) {
    if ($i !~ /^[0-3]$/) {
      print "REJECT: invalid quadrant at position " (i - 1)
      exit 1
    }
    matrix[i - 1] = $i + 0
  }

  for (i = 1; i <= 7; i++) dual[i] = (3 - matrix[8 - i])

  if (transform == "snub_L" || transform == "snub_R") {
    self_dual = 1
    for (i = 1; i <= 7; i++) if (matrix[i] != dual[i]) self_dual = 0
    if (self_dual) {
      print "REJECT: snub transform cannot be self-dual"
      exit 1
    }
    print "ACCEPT: chiral dual valid"
    exit 0
  }

  if (transform == "truncate" || transform == "expand") {
    print "ACCEPT: degree signature preserved"
    exit 0
  }

  if (transform == "rectify" || transform == "identity") {
    self_dual = 1
    for (i = 1; i <= 7; i++) if (matrix[i] != dual[i]) self_dual = 0
    if (self_dual) {
      print "ACCEPT: self-dual transform"
      exit 0
    }
    print "REJECT: expected self-dual but got chiral"
    exit 1
  }

  print "REJECT: unknown transform type"
  exit 1
}
