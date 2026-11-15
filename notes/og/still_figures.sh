#!/bin/bash
# The card figures in notes/og/figures/ cut from docs stills (CARD_FIGURES in cards.py): a 400×417 app px
# region of each still's light desktop cut, its real edges drawn, its cut edges dissolving. Run from the
# repository root after a still changes: bash notes/og/still_figures.sh
set -e
export MAGICK_TEMPORARY_PATH=${MAGICK_TEMPORARY_PATH:-${TMPDIR:-/tmp}}
OUT=notes/og/figures
W=800; H=834   # 400×417 app px: 1.3 card px per app px in the 520×542 figure box
LINE='rgba(24,63,56,0.16)'
fig() { # name lights(0/1) edges(top,left as list) radius(0/1) topfade(0/1)
  local name=$1 lights=$2 edges=$3 radius=$4 topfade=$5
  local src=public/img/docs/$name.desktop.light.avif tmp=$MAGICK_TEMPORARY_PATH/fig-$name
  magick $src -crop ${W}x${H}+0+0 +repage $tmp-crop.png
  local draw=()
  if [ "$lights" = 1 ]; then
    draw+=(-strokewidth 2 -fill '#ff5f57' -stroke '#e0443e' -draw 'circle 40,40 52,40' -fill '#febc2e' -stroke '#dea123' -draw 'circle 80,40 92,40' -fill '#28c840' -stroke '#1aab29' -draw 'circle 120,40 132,40')
  fi
  if [ "$radius" = 1 ]; then draw+=(-fill none -stroke "$LINE" -strokewidth 2 -draw "roundrectangle 1,1 $((W+40)),$((H+40)) 24,24")
  else
    [[ $edges == *top* ]] && draw+=(-fill none -stroke "$LINE" -strokewidth 2 -draw "line 0,1 $W,1")
    [[ $edges == *left* ]] && draw+=(-fill none -stroke "$LINE" -strokewidth 2 -draw "line 1,0 1,$H")
  fi
  magick $tmp-crop.png "${draw[@]}" $tmp-drawn.png
  # Mask: white is shown. Cut edges dissolve over 40 app px (right) and 30 (bottom, top).
  magick -size ${W}x${H} xc:black -fill white -draw "$([ "$radius" = 1 ] && echo "roundrectangle 0,0 $((W+40)),$((H+40)) 24,24" || echo "rectangle 0,0 $((W+40)),$((H+40))")" \
    \( -size 80x${H} -define gradient:direction=East gradient:white-black \) -geometry +$((W-80))+0 -compose Multiply -composite \
    \( -size ${W}x60 gradient:white-black \) -geometry +0+$((H-60)) -compose Multiply -composite \
    $([ "$topfade" = 1 ] && echo "( -size ${W}x28 gradient:black-white ) -geometry +0+0 -compose Multiply -composite") \
    $tmp-mask.png
  magick $tmp-drawn.png $tmp-mask.png -alpha off -compose CopyOpacity -composite -strip -define png:compression-level=9 $OUT/$name.png
  identify $OUT/$name.png
}
fig welcome-window 1 top,left 1 0
fig tasks-teammate 0 left 0 1
fig feed-activity 0 top,left 0 0
