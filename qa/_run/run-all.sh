cd "$(dirname "$0")/../.."
for s in routes practice ui procedures mobile lab-ui cabinet-ui cabinet-controls temperature-ui detectors-ui solder-panel solder-panel-ui mobile-lab meter-parity modo pwa cade diagram-layout; do
  for slash in "" "/"; do
    PANELLAB_URL="http://127.0.0.1:4399$slash" timeout 400 npm run verify:$s > qa/_run/$s.log 2>&1; rc=$?
    echo "$s rc=$rc slash=[$slash]" >> qa/_run/summary.txt
    [ $rc -eq 0 ] && break
  done
done
echo DONE >> qa/_run/summary.txt
