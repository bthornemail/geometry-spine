# canonicalize.sed
# Lightweight canonicalization for NDJSON-ish lines
s/[[:space:]]\+$//
s/^\s\+//
s/\s\+/,/g
