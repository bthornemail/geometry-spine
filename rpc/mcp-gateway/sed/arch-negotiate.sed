# arch-negotiate.sed
# Minimal deterministic negotiation normalizer
# Input lines like:
# capabilities=identity,snub,truncate
# preferences=snub,rectify,identity

s/[[:space:]]//g
s/^capabilities=/CAPS:/
s/^preferences=/PREFS:/
