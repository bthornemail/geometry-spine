# pfister-embed.awk
# Input: q1 q2 q3 q4 q5 q6 q7 arch_transform catalan_result

BEGIN { FS = "[[:space:]]+" }

function hash8(s,    cmd, out) {
  cmd = "printf '%s' '" s "' | sha256sum"
  cmd | getline out
  close(cmd)
  return substr(out, 1, 8)
}

{
  if (NF < 9) {
    print "ERROR: expected 9 fields (7 matrix + arch + catalan)" > "/dev/stderr"
    exit 2
  }

  o8_input = ""
  o8_bits = 0
  for (i = 1; i <= 7; i++) {
    if ($i !~ /^[0-3]$/) {
      print "ERROR: invalid quadrant at position " i > "/dev/stderr"
      exit 2
    }
    m = $i + 0
    o8_input = o8_input m
    o8_bits += (m * (2 ^ (2 * (i - 1))))
  }

  arch = $8
  catalan = $9

  o8_hex = sprintf("%04x", o8_bits % 65536)
  p32 = hash8(arch o8_input)
  c32 = hash8(catalan o8_input)

  # 20 hex chars (80 bits) + deterministic zero padding to 128 bits => 32 hex chars
  pf80 = o8_hex p32 c32
  pf128 = pf80 "000000000000"

  printf "pfister128=%s\n", pf128
  printf "o8=%s\n", o8_hex
  printf "p32=%s\n", p32
  printf "c32=%s\n", c32
  print "components=O8(16)+P32(32)+C32(32)=80bits (padded to 128)"
}
