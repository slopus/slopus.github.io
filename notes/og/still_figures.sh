#!/bin/bash
# The card figures in notes/og/figures/ cut from docs stills (CARD_FIGURES in cards.py): a region of each
# still's light desktop cut, from its top-left, that fills the card's 520×542 figure box as well as it can,
# its real edges drawn as hairlines and its cut edges dissolving. A sidebar-plus-pane cut ends crisp on the
# sidebar's divider, never on a sliver of the pane. Run from the repository root after a still changes:
# bash notes/og/still_figures.sh
set -e
export MAGICK_TEMPORARY_PATH=${MAGICK_TEMPORARY_PATH:-${TMPDIR:-/tmp}}
OUT=notes/og/figures
LINE='rgba(24,63,56,0.16)'
# name width height (file px; height 0 keeps the box's 520:542) lights(0/1) lines(sides drawn) radius(0/1: 12 app px
# where top and left meet) fades(sides that dissolve) [left offset in file px]
fig() {
  local name=$1 W=$2 H=$3 lights=$4 lines=$5 radius=$6 fades=$7 X=${8:-0}
  [ "$H" = 0 ] && H=$(( (W * 542 + 519) / 520 ))
  # A still that plays (src/docClips.json) is cut from its rest, the finished state.
  local src=public/img/docs/$name.desktop.light.avif tmp=$MAGICK_TEMPORARY_PATH/fig-$name
  [ -f public/img/docs/$name.desktop.light.rest.avif ] && src=public/img/docs/$name.desktop.light.rest.avif
  magick $src -crop ${W}x${H}+${X}+0 +repage $tmp-crop.png
  local draw=()
  if [ "$lights" = 1 ]; then
    draw+=(-strokewidth 2 -fill '#ff5f57' -stroke '#e0443e' -draw 'circle 40,40 52,40' -fill '#febc2e' -stroke '#dea123' -draw 'circle 80,40 92,40' -fill '#28c840' -stroke '#1aab29' -draw 'circle 120,40 132,40')
  fi
  draw+=(-fill none -stroke "$LINE" -strokewidth 2)
  if [ "$radius" = 1 ]; then draw+=(-draw "roundrectangle 1,1 $((W+40)),$((H+40)) 24,24")
  else
    [[ $lines == *top* ]] && draw+=(-draw "line 0,1 $W,1")
    [[ $lines == *left* ]] && draw+=(-draw "line 1,0 1,$H")
  fi
  [[ $lines == *right* ]] && draw+=(-draw "line $((W-1)),0 $((W-1)),$H")
  [[ $lines == *bottom* ]] && draw+=(-draw "line 0,$((H-1)) $W,$((H-1))")
  magick $tmp-crop.png "${draw[@]}" $tmp-drawn.png
  # Mask, white where shown: a cut side dissolves over 40 app px (right) or 30 (top, bottom).
  local mask=(-size ${W}x${H} xc:black -fill white -draw "$([ "$radius" = 1 ] && echo "roundrectangle 0,0 $((W+40)),$((H+40)) 24,24" || echo "rectangle 0,0 $((W+40)),$((H+40))")")
  [[ $fades == *right* ]] && mask+=(\( -size 80x${H} -define gradient:direction=East gradient:white-black \) -geometry +$((W-80))+0 -compose Multiply -composite)
  [[ $fades == *bottom* ]] && mask+=(\( -size ${W}x60 gradient:white-black \) -geometry +0+$((H-60)) -compose Multiply -composite)
  [[ $fades == *top* ]] && mask+=(\( -size ${W}x28 gradient:black-white \) -geometry +0+0 -compose Multiply -composite)
  magick "${mask[@]}" $tmp-mask.png
  magick $tmp-drawn.png $tmp-mask.png -alpha off -compose CopyOpacity -composite -strip -define png:compression-level=9 $OUT/$name.png
  identify $OUT/$name.png
}
# The rail and sidebar alone, to the divider at 345 app px: 1.5 card px per app px.
fig welcome-window 690 0 1 top,left,right 1 bottom
fig tasks-teammate 690 0 0 left,right 0 top,bottom
# The whole cut where it is the rail and sidebar already.
fig computers-where 690 534 1 top,left,right 1 bottom
# A pane: 400 app px of it, 1.3 card px per app px, its cut right edge dissolving.
fig feed-activity 800 0 0 top,left 0 right,bottom
# The bot's own pane, from the divider, where the sidebar would repeat Welcome's card.
fig bots-open 800 0 0 top,left 0 right,bottom 690
# The permission menu and the composer's start, 1.7 card px per app px.
fig permissions-modes 600 444 0 left,bottom 0 top,right
