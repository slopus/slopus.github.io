#!/bin/bash
# The card figures in notes/og/figures/ cut from docs stills (CARD_FIGURES in cards.py): a region of each
# still's light desktop cut that fills the card's 520×542 figure box, its real edges drawn, its cut edges
# dissolving. A sidebar-plus-pane cut ends crisp on the sidebar's divider, never on a sliver of the pane.
# Run from the repository root after a still changes: bash notes/og/still_figures.sh
set -e
export MAGICK_TEMPORARY_PATH=${MAGICK_TEMPORARY_PATH:-${TMPDIR:-/tmp}}
OUT=notes/og/figures
LINE='rgba(24,63,56,0.16)'
fig() { # name width(file px) lights(0/1) edges(real sides: top,left,right) radius(0/1) topfade(0/1)
  # The height keeps the figure box's 520:542, so the region fills it.
  local name=$1 W=$2 lights=$3 edges=$4 radius=$5 topfade=$6
  local H=$(( (W * 542 + 519) / 520 ))
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
  [[ $edges == *right* ]] && draw+=(-fill none -stroke "$LINE" -strokewidth 2 -draw "line $((W-1)),0 $((W-1)),$H")
  magick $tmp-crop.png "${draw[@]}" $tmp-drawn.png
  # Mask: white is shown. Cut edges dissolve over 40 app px (right) and 30 (bottom, top).
  magick -size ${W}x${H} xc:black -fill white -draw "$([ "$radius" = 1 ] && echo "roundrectangle 0,0 $((W+40)),$((H+40)) 24,24" || echo "rectangle 0,0 $((W+40)),$((H+40))")" \
    $([[ $edges == *right* ]] || echo "( -size 80x${H} -define gradient:direction=East gradient:white-black ) -geometry +$((W-80))+0 -compose Multiply -composite") \
    \( -size ${W}x60 gradient:white-black \) -geometry +0+$((H-60)) -compose Multiply -composite \
    $([ "$topfade" = 1 ] && echo "( -size ${W}x28 gradient:black-white ) -geometry +0+0 -compose Multiply -composite") \
    $tmp-mask.png
  magick $tmp-drawn.png $tmp-mask.png -alpha off -compose CopyOpacity -composite -strip -define png:compression-level=9 $OUT/$name.png
  identify $OUT/$name.png
}
# The rail and sidebar alone, to the divider at 345 app px: 1.5 card px per app px.
fig welcome-window 690 1 top,left,right 1 0
fig tasks-teammate 690 0 left,right 0 1
# A pane: 400 app px of it, 1.3 card px per app px, its cut right edge dissolving.
fig feed-activity 800 0 top,left 0 0
