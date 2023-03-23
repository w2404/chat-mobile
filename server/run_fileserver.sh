cd ../html
#nohup sudo python -m http.server 8443 > ../log.txt 2>&1 &
nohup python -m http.server 8443 > ../log.txt 2>&1 &
