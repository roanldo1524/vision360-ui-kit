#!/bin/bash
# Paso final después de que Claude leyó las fichas y vetó lo dudoso: confirma lo aprobado y etiqueta lo demás.
cd /tmp/dropi && node confirmar.js | awk -F' \\| ' '{print $1}' | sort | uniq -c
