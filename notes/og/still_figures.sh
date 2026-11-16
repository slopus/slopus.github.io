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
# name width height (app px; height 0 keeps the box's 520:542) lights(0/1) lines(sides drawn) radius(0/1: 12 app px
# where top and left meet) fades(sides that dissolve) [left offset in app px]
fig() {
  local name=$1 lights=$4 lines=$5 radius=$6 fades=$7
  # File px per app px: 2, times the still's scale (src/docStills.json; a clip's in src/docClips.json).
  local f=$(node -p "2 * ((require('./src/docStills.json')['$name'] ?? require('./src/docClips.json')['$name']).desktop.scale ?? 1)")
  px() { awk -v a="$1" -v f="$f" 'BEGIN { printf "%d", a * f + 0.5 }'; }
  local W=$(px $2) H=$(px $3) X=$(px ${8:-0}) R=$(px 12) R2=$(( $(px 12) * 2 ))
  [ "$H" = 0 ] && H=$(( (W * 542 + 519) / 520 ))
  # A still that plays (src/docClips.json) is cut from its rest, the finished state.
  local src=public/img/docs/$name.desktop.light.avif tmp=$MAGICK_TEMPORARY_PATH/fig-$name
  [ -f public/img/docs/$name.desktop.light.rest.avif ] && src=public/img/docs/$name.desktop.light.rest.avif
  magick $src -crop ${W}x${H}+${X}+0 +repage $tmp-crop.png
  local draw=()
  if [ "$lights" = 1 ]; then
    # The window's lights: 12 app px wide, 20 apart, centred 20 in from the top and left.
    local y=$(px 20) r=$(px 6)
    draw+=(-strokewidth 2 -fill '#ff5f57' -stroke '#e0443e' -draw "circle $(px 20),$y $(( $(px 20) + r )),$y" -fill '#febc2e' -stroke '#dea123' -draw "circle $(px 40),$y $(( $(px 40) + r )),$y" -fill '#28c840' -stroke '#1aab29' -draw "circle $(px 60),$y $(( $(px 60) + r )),$y")
  fi
  draw+=(-fill none -stroke "$LINE" -strokewidth 2)
  if [ "$radius" = 1 ]; then draw+=(-draw "roundrectangle 1,1 $((W+R2)),$((H+R2)) $R,$R")
  else
    [[ $lines == *top* ]] && draw+=(-draw "line 0,1 $W,1")
    [[ $lines == *left* ]] && draw+=(-draw "line 1,0 1,$H")
  fi
  [[ $lines == *right* ]] && draw+=(-draw "line $((W-1)),0 $((W-1)),$H")
  [[ $lines == *bottom* ]] && draw+=(-draw "line 0,$((H-1)) $W,$((H-1))")
  magick $tmp-crop.png "${draw[@]}" $tmp-drawn.png
  # Mask, white where shown: a cut side dissolves over 40 app px (right), 30 (bottom) or 14 (top).
  local mask=(-size ${W}x${H} xc:black -fill white -draw "$([ "$radius" = 1 ] && echo "roundrectangle 0,0 $((W+R2)),$((H+R2)) $R,$R" || echo "rectangle 0,0 $((W+40)),$((H+40))")")
  local right=$(px 40) bottom=$(px 30) top=$(px 14)
  [[ $fades == *right* ]] && mask+=(\( -size ${right}x${H} -define gradient:direction=East gradient:white-black \) -geometry +$((W-right))+0 -compose Multiply -composite)
  [[ $fades == *bottom* ]] && mask+=(\( -size ${W}x${bottom} gradient:white-black \) -geometry +0+$((H-bottom)) -compose Multiply -composite)
  [[ $fades == *top* ]] && mask+=(\( -size ${W}x${top} gradient:black-white \) -geometry +0+0 -compose Multiply -composite)
  magick "${mask[@]}" $tmp-mask.png
  magick $tmp-drawn.png $tmp-mask.png -alpha off -compose CopyOpacity -composite -strip -define png:compression-level=9 $OUT/$name.png
  identify $OUT/$name.png
}
# The rail and sidebar alone, to the divider at 345 app px: 1.5 card px per app px.
fig welcome-window 345 0 1 top,left,right 1 bottom
fig tasks-teammate 345 0 0 left,right 0 top,bottom
# The whole cut where it is the rail and sidebar already.
fig computers-where 345 267 1 top,left,right 1 bottom
# The feed's own pane, from the divider, 1.3 card px per app px, its cut right edge dissolving.
fig feed-activity 400 0 0 top,left 0 right,bottom 345
# The bot's own pane, from the divider, where the sidebar would repeat Welcome's card.
fig bots-open 400 0 0 top,left 0 right,bottom 345
# The permission menu and the composer's start, the cut's whole height, 1.7 card px per app px.
fig permissions-modes 300 216 0 left,bottom 0 top,right
